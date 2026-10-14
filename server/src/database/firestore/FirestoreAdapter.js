import { getFirestore, Timestamp } from 'firebase-admin/firestore';

import { getApp, getApps, initializeApp } from 'firebase-admin/app';

if (getApps().length === 0) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.GCLOUD_PROJECT = 'demo-trend-tech';
  initializeApp({ projectId: 'demo-trend-tech' });
}
const db = getFirestore();

export class FirestoreQuery {
  constructor(modelName, op, filter) {
    this.modelName = modelName;
    this.op = op;
    this.filter = filter || {};
    this.options = { populates: [], sortObj: null, limitNum: null, isLean: false };
  }

  populate(field) {
    if (typeof field === 'string') {
      this.options.populates.push(...field.split(' '));
    } else if (field && field.path) {
      this.options.populates.push(field.path);
    }
    return this;
  }

  sort(sortObj) {
    this.options.sortObj = sortObj;
    return this;
  }

  limit(limitNum) {
    this.options.limitNum = limitNum;
    return this;
  }

  lean() {
    this.options.isLean = true;
    return this;
  }

  select(fields) {
    return this;
  }

  async execute() {
    let docs = [];

    if (this.op === 'findById') {
      const doc = await db.collection(this.modelName).doc(this.filter).get();
      if (!doc.exists) return null;
      let data = { _id: doc.id, id: doc.id, ...doc.data() };
      data = await this.enrich(data);
      return this._wrap(data);
    }

    // Fetch all or query
    let snapshot;
    // We will do a generic fetch and memory filter to perfectly simulate Mongo queries 
    // including $regex, $in, $gte, etc. without worrying about Firestore composite index limitations
    // for this transparent adapter. (Optimized queries can be added later).
    
    // Quick path for simple equality queries to speed up find()
    let queryRef = db.collection(this.modelName || collectionName);
    let requiresMemoryFilter = false;

    if (this.filter && Object.keys(this.filter).length > 0) {
      for (const [k, v] of Object.entries(this.filter)) {
        if (typeof v === 'object' && v !== null && !(v instanceof Date) && !(v.toDate)) {
          requiresMemoryFilter = true;
          break;
        }
      }
    }

    if (!requiresMemoryFilter && this.filter && Object.keys(this.filter).length > 0) {
      for (const [k, v] of Object.entries(this.filter)) {
        if (k !== '_id' && typeof v !== 'object') {
           queryRef = queryRef.where(k, '==', v);
        }
      }
    }

    if (!requiresMemoryFilter && !this.options.sortObj) {
      if (this.op === 'findOne') {
        queryRef = queryRef.limit(1);
      } else if (this.options.limitNum) {
        queryRef = queryRef.limit(this.options.limitNum);
      }
    }

    snapshot = await queryRef.get();

    for (const d of snapshot.docs) {
      const rawData = { _id: d.id, id: d.id, ...d.data() };
      
      if (this.matchMongoFilter(rawData, this.filter)) {
        docs.push(rawData);
      }
    }

    if (this.options.sortObj) {
      docs.sort((a, b) => {
        for (const [key, val] of Object.entries(this.options.sortObj)) {
          const aVal = a[key] instanceof Timestamp ? a[key].toDate() : a[key];
          const bVal = b[key] instanceof Timestamp ? b[key].toDate() : b[key];
          if (aVal > bVal) return val === 1 ? 1 : -1;
          if (aVal < bVal) return val === 1 ? -1 : 1;
        }
        return 0;
      });
    }

    if (this.options.limitNum) {
      docs = docs.slice(0, this.options.limitNum);
    }

    docs = await this.enrichBulk(docs);
    for (let i = 0; i < docs.length; i++) {
      docs[i] = this._wrap(docs[i]);
    }

    if (this.op === 'findOne') {
      return docs.length > 0 ? docs[0] : null;
    }

    return docs;
  }

  matchMongoFilter(doc, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, reqVal] of Object.entries(filter)) {
      if (key === '_id') {
        const idStr = reqVal && reqVal.toString ? reqVal.toString() : reqVal;
        let queryStr = idStr;
        if (reqVal && reqVal.$in) queryStr = reqVal.$in.map(v => v.toString());
        if (reqVal && reqVal.$ne) queryStr = reqVal.$ne.toString();

        if (reqVal && reqVal.$in) {
           if (!queryStr.includes(doc._id)) return false;
        } else if (reqVal && reqVal.$ne) {
           if (doc._id === queryStr) return false;
        } else {
           if (doc._id !== idStr) return false;
        }
        continue;
      }
      
      let docVal = doc[key];
      if (docVal instanceof Timestamp) {
        docVal = docVal.toDate();
      }

      if (reqVal && typeof reqVal === 'object' && !Array.isArray(reqVal) && !(reqVal instanceof Date)) {
        // Handle mongo operators
        if (reqVal.$in) {
           const inArr = reqVal.$in.map(x => x && x.toString ? x.toString() : x);
           const dvStr = docVal && docVal.toString ? docVal.toString() : docVal;
           if (!inArr.includes(dvStr)) return false;
        }
        if (reqVal.$nin) {
           if (reqVal.$nin.includes(docVal)) return false;
        }
        if (reqVal.$ne !== undefined) {
           if (docVal === reqVal.$ne) return false;
        }
        if (reqVal.$gte !== undefined) {
           if (docVal < reqVal.$gte) return false;
        }
        if (reqVal.$lte !== undefined) {
           if (docVal > reqVal.$lte) return false;
        }
        if (reqVal.$regex) {
           const regex = new RegExp(reqVal.$regex, reqVal.$options || '');
           if (!regex.test(docVal)) return false;
        }
        if (reqVal.$exists !== undefined) {
           if (reqVal.$exists && (docVal === undefined || docVal === null)) return false;
           if (!reqVal.$exists && docVal !== undefined && docVal !== null) return false;
        }
      } else {
        const reqStr = reqVal && reqVal.toString ? reqVal.toString() : reqVal;
        const dvStr = docVal && docVal.toString ? docVal.toString() : docVal;
        if (reqStr !== dvStr) return false;
      }
    }
    return true;
  }

  async enrichBulk(docs) {
    if (!docs || docs.length === 0) return docs;
    if (!this.options.populates || this.options.populates.length === 0) return docs;

    const refsToFetch = [];
    const refMap = new Map();
    
    for (const doc of docs) {
      for (const popField of this.options.populates) {
        let colName = null;
        if (popField === 'marketplace' && doc.marketplace) colName = 'marketplaces';
        if (popField === 'product' && doc.product) colName = 'products';
        
        if (colName) {
           const id = doc[popField].toString();
           const path = `${colName}/${id}`;
           if (!refMap.has(path)) {
             refMap.set(path, { collection: colName, id: id, targets: [] });
             refsToFetch.push(db.collection(colName).doc(id));
           }
           refMap.get(path).targets.push({ doc, field: popField });
        }
      }
    }
    
    if (refsToFetch.length === 0) return docs;
    
    const chunkSize = 100;
    const snapshots = [];
    for (let i = 0; i < refsToFetch.length; i += chunkSize) {
       const chunkSnaps = await db.getAll(...refsToFetch.slice(i, i + chunkSize));
       snapshots.push(...chunkSnaps);
    }
    
    for (const snap of snapshots) {
       if (snap.exists) {
          const path = `${snap.ref.parent.id}/${snap.id}`;
          const mapping = refMap.get(path);
          if (mapping) {
             const populatedData = { _id: snap.id, id: snap.id, ...snap.data() };
             for (const target of mapping.targets) {
                target.doc[target.field] = populatedData;
             }
          }
       }
    }
    
    return docs;
  }

  async enrich(data) {
    if (!data) return data;
    const res = await this.enrichBulk([data]);
    return res[0];
  }

  _wrap(data) {
    if (!data) return data;
    // Emulate mongoose document
    if (!this.options.isLean) {
      data.toJSON = () => data;
    }
    // Emulate ObjectIds
    data._id = data._id || data.id;
    return data;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().then(undefined, reject);
  }
}

export function createFirestoreModel(collectionName) {
  return class Model {
    constructor(data) { Object.assign(this, data); }
    async save() { return this; }
  

  static find(filter) { return new FirestoreQuery(collectionName, 'find', filter); }
  static findOne(filter) { return new FirestoreQuery(collectionName, 'findOne', filter); }
  static findById(id) { 
    const strId = id && id.toString ? id.toString() : id;
    return new FirestoreQuery(collectionName, 'findById', strId); 
  }
  
  static async create(doc) {
    const ref = db.collection(collectionName).doc();
    const data = { ...doc };
    await ref.set(data);
    return { _id: ref.id, id: ref.id, ...data };
  }
  
  static async updateOne(filter, update) {
    // simplified for adapter
    const doc = await this.findOne(filter).lean();
    if (doc) {
      const uData = update.$set || update;
      await db.collection(collectionName).doc(doc._id).set(uData, { merge: true });
    }
  }

  static async findOneAndUpdate(filter, update, options) {
    const doc = await this.findOne(filter).lean();
    if (doc) {
      const uData = update.$set || update;
      await db.collection(collectionName).doc(doc._id).set(uData, { merge: true });
      return { ...doc, ...uData };
    }
    return null;
  }

  static async countDocuments(filter) {
    const docs = await this.find(filter).lean();
    return docs.length;
  }
}
}

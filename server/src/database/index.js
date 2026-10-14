import { Product as MongoProduct } from '../models/Product.model.js';
import { MarketplaceProduct as MongoMP } from '../models/MarketplaceProduct.model.js';
import { PriceHistory as MongoPH } from '../models/PriceHistory.model.js';
import { Marketplace as MongoMarketplace } from '../models/Marketplace.model.js';
import { Category as MongoCategory } from '../models/Category.model.js';
import { Deal as MongoDeal } from '../models/Deal.model.js';
import { User as MongoUser } from '../models/User.model.js';

import { FirestoreModel } from './firestore/FirestoreAdapter.js';

const useFirestore = process.env.DATABASE_PROVIDER === 'firestore';

// In firestore, the collection names align with what we migrated
export const Product = useFirestore ? new FirestoreModel('products') : MongoProduct;
export const MarketplaceProduct = useFirestore ? new FirestoreModel('marketplaceProducts') : MongoMP;
export const PriceHistory = useFirestore ? new FirestoreModel('priceHistory') : MongoPH;
export const Marketplace = useFirestore ? new FirestoreModel('marketplaces') : MongoMarketplace;
export const Category = useFirestore ? new FirestoreModel('categories') : MongoCategory;
export const Deal = useFirestore ? new FirestoreModel('deals') : MongoDeal;
export const User = useFirestore ? new FirestoreModel('users') : MongoUser;

console.log(`Database Provider Initialized: ${useFirestore ? 'FIRESTORE EMULATOR' : 'MONGODB'}`);

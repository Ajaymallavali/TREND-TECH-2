export function parseShoppingQuery(query) {
  const q = query.toLowerCase().trim();
  
  const result = {
    intent: 'PRODUCT_SEARCH',
    category: null,
    budget: null,
    requirements: [],
    compareSubjects: []
  };

  if (q.includes('compare') || q.includes(' vs ')) {
    result.intent = 'PRODUCT_COMPARISON';
    // attempt to extract subjects
    const cleaned = q.replace('compare ', '').split(' vs ');
    if (cleaned.length === 2) {
      result.compareSubjects = cleaned.map(s => s.trim());
    } else {
      const andSplit = q.replace('compare ', '').split(' and ');
      if (andSplit.length === 2) {
        result.compareSubjects = andSplit.map(s => s.trim());
      }
    }
  } else if (q.includes('best') || q.includes('under') || q.includes('cheap') || q.includes('recommend') || q.match(/\bfor\b/)) {
    result.intent = 'NATURAL_LANGUAGE_SHOPPING';
  }

  // Budget Extraction
  const budgetMatch = q.match(/(under|below|within)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*)(k)?/i);
  if (budgetMatch) {
    let num = parseInt(budgetMatch[2].replace(/,/g, ''), 10);
    if (budgetMatch[3] && budgetMatch[3].toLowerCase() === 'k') num *= 1000;
    result.budget = { maxPrice: num };
  } else {
    const aroundMatch = q.match(/around\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*)(k)?/i);
    if (aroundMatch) {
      let num = parseInt(aroundMatch[1].replace(/,/g, ''), 10);
      if (aroundMatch[2] && aroundMatch[2].toLowerCase() === 'k') num *= 1000;
      // 10% tolerance for 'around'
      result.budget = { minPrice: num * 0.9, maxPrice: num * 1.1 };
    } else {
      const betweenMatch = q.match(/between\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*)(k)?\s*and\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*)(k)?/i);
      if (betweenMatch) {
        let minNum = parseInt(betweenMatch[1].replace(/,/g, ''), 10);
        if (betweenMatch[2] && betweenMatch[2].toLowerCase() === 'k') minNum *= 1000;
        let maxNum = parseInt(betweenMatch[3].replace(/,/g, ''), 10);
        if (betweenMatch[4] && betweenMatch[4].toLowerCase() === 'k') maxNum *= 1000;
        result.budget = { minPrice: minNum, maxPrice: maxNum };
      }
    }
  }

  // Category Detection
  const categories = [
    'Mobile', 'Laptop', 'TV', 'Monitor', 'Headphone', 'Earphone', 'Smartwatch', 'Tablet', 'Camera', 'AC', 'Refrigerator', 'Charger',
    'Men\'s Fashion', 'Women\'s Fashion', 'Shoes', 'Watches'
  ];
  
  for (const cat of categories) {
    const catLower = cat.toLowerCase();
    if (q.includes(catLower) || q.includes(catLower.replace(/s$/, ''))) {
      if (catLower === 'mobile' || catLower === 'mobiles' || q.includes('phone') || q.includes('smartphone')) {
        result.category = 'Mobiles';
      } else if (catLower === 'laptop' || catLower === 'laptops') {
        result.category = 'Laptops';
      } else if (catLower === 'headphone' || catLower === 'headphones' || catLower === 'earphone' || catLower === 'earphones') {
        result.category = 'Headphones';
      } else if (catLower === 'tv' || catLower === 'tvs' || q.includes('television')) {
        result.category = 'TVs';
      } else if (catLower === 'shoe' || catLower === 'shoes' || q.includes('sneaker')) {
        result.category = 'Shoes';
      } else {
        result.category = cat;
      }
      break; 
    }
  }
  if (!result.category && (q.includes('phone') || q.includes('smartphone'))) result.category = 'Mobiles';
  if (!result.category && q.includes('sneaker')) result.category = 'Shoes';

  // Requirements Extraction
  const features = ['camera', 'battery', 'performance', 'gaming', 'display', 'ram', 'storage', 'anc', 'comfort', 'brand', 'screen', 'weight', 'portability'];
  for (const f of features) {
    if (q.includes(f)) {
      result.requirements.push(f);
    }
  }

  const ramMatch = q.match(/(\d+)\s*gb\s*ram/i);
  if (ramMatch) result.requirements.push(`${ramMatch[1]}GB RAM`);
  
  const storageMatch = [...q.matchAll(/(\d+)\s*(gb|tb)\s*(storage|rom)?/gi)];
  for (const match of storageMatch) {
    if (!q.includes(`${match[1]}gb ram`)) {
      result.requirements.push(`${match[1]}${match[2].toUpperCase()} Storage`);
    }
  }

  if (q.includes('rtx')) result.requirements.push('RTX Graphics');
  
  return result;
}

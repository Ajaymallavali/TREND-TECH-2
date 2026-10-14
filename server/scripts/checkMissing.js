import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Product } from "../src/models/Product.model.js";

async function run() {
  await connectDB();
  const products = await Product.find({ $or: [{ image: null }, { image: "" }, { image: "null" }] }).lean();
  
  const categoryCounts = {};
  const items = {};
  
  products.forEach(p => {
    const cat = p.category || "Unknown";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    if (!items[cat]) items[cat] = [];
    items[cat].push(`${p.brand} ${p.name}`);
  });
  
  console.log("Categories with missing images:");
  console.log(categoryCounts);
  
  console.log("\nSample Tech (electronics):", items["electronics"]?.slice(0, 15));
  console.log("\nSample Trend (fashion):", items["fashion"]?.slice(0, 15));
  
  process.exit(0);
}
run();

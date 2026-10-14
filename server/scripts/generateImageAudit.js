import mongoose from "mongoose";
import fs from "fs";
import { connectDB } from "../src/config/db.js";
import { Product } from "../src/models/Product.model.js";

const ARTIFACT_PATH = "C:\\Users\\ajaym\\.gemini\\antigravity\\brain\\fa1ce98e-f5d5-4c0f-b60d-803f533db1e6\\missing_images_audit.md";

const TECH_CATEGORIES = ['Smartphones', 'smartphone', 'laptop', 'monitor', 'gaming', 'television', 'smartwatch', 'air-conditioner', 'headphones', 'Audio', 'camera', 'tablet'];
const TREND_CATEGORIES = ['accessories', 'Watches', 'Fashion Accessories', 'Accessories', 'Women Fashion', 'Men Fashion'];

async function run() {
  await connectDB();
  const products = await Product.find({ $or: [{ image: null }, { image: "" }, { image: "null" }] }).lean();
  
  let techCount = 0;
  let trendCount = 0;
  let techList = {};
  let trendList = {};
  
  products.forEach(p => {
    const cat = p.category || "Unknown";
    const name = `**${p.brand}** ${p.name}`;
    
    if (TECH_CATEGORIES.includes(cat)) {
      techCount++;
      if (!techList[cat]) techList[cat] = [];
      techList[cat].push(name);
    } else if (TREND_CATEGORIES.includes(cat)) {
      trendCount++;
      if (!trendList[cat]) trendList[cat] = [];
      trendList[cat].push(name);
    } else {
      // Treat unknown as trend by default or something
      trendCount++;
      if (!trendList[cat]) trendList[cat] = [];
      trendList[cat].push(name);
    }
  });
  
  let md = `# Product Image Coverage Audit\n\n`;
  md += `> [!IMPORTANT]\n> A total of **${techCount + trendCount}** products are currently missing verified images in the database.\n\n`;
  
  md += `## 💻 Tech Categories (${techCount} Missing)\n\n`;
  for (const cat of Object.keys(techList).sort()) {
    md += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${techList[cat].length})\n`;
    techList[cat].forEach(item => {
      md += `- ${item}\n`;
    });
    md += `\n`;
  }
  
  md += `## 👗 Trend (Fashion) Categories (${trendCount} Missing)\n\n`;
  for (const cat of Object.keys(trendList).sort()) {
    md += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${trendList[cat].length})\n`;
    trendList[cat].forEach(item => {
      md += `- ${item}\n`;
    });
    md += `\n`;
  }
  
  fs.writeFileSync(ARTIFACT_PATH, md, "utf-8");
  console.log("Artifact generated successfully.");
  process.exit(0);
}
run();

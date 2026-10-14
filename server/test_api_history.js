fetch('http://localhost:5001/api/products/6a9904e369652590e0aadbea/history').then(r=>r.json()).then(data=>console.log(JSON.stringify(data, null, 2))).catch(console.error);

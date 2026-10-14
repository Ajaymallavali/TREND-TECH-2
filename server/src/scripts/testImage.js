import { image_search } from 'duckduckgo-images-api';

async function test() {
  try {
    const results = await image_search({ query: 'Dot & Key Barrier Repair Ceramides Moisturiser', moderate: true, iterations: 1 });
    console.log(results[0].image);
  } catch (err) {
    console.error(err);
  }
}
test();

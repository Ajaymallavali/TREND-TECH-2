import { image_search } from 'duckduckgo-images-api';

async function run() {
  try {
    const results = await image_search({ query: 'Apple iPhone 17 Pro Max official front view', moderate: true, iterations: 1 });
    console.log(results.slice(0, 3));
  } catch (err) {
    console.error(err);
  }
}
run();

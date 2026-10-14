import google from 'googlethis';

async function test() {
  try {
    const images = await google.image('Dot & Key Barrier Repair Ceramides Moisturiser', { safe: false });
    console.log(images[0].url);
  } catch (err) {
    console.error(err);
  }
}
test();

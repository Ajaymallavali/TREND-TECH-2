import gis from 'g-i-s';

gis('Apple iPhone 17 Pro Max official front view', logResults);

function logResults(error, results) {
  if (error) {
    console.log(error);
  }
  else {
    console.log(JSON.stringify(results.slice(0, 3), null, 2));
  }
}

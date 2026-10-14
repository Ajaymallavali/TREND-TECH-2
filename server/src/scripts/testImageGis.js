import gis from 'g-i-s';

gis('Dot Key Barrier Repair Ceramides Moisturiser', { filterOutDomains: ['pinterest.com'] }, (error, results) => {
  if (error) {
    console.log("Error:", error);
  }
  else {
    console.log("Results:", results?.slice(0, 2));
  }
});

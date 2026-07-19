const fs = require('fs');
const seats = [];

// Z is the long axis (North-South)
const innerRadiusX = 80; 
const innerRadiusZ = 120;  

const numRows = 38;
const rowDepth = 1.6;
const rowHeight = 0.85; 

for (let row = 0; row < numRows; row++) {
  const currentRadiusX = innerRadiusX + row * rowDepth;
  const currentRadiusZ = innerRadiusZ + row * rowDepth;
  const y = 2.0 + row * rowHeight;
  
  const a = currentRadiusX;
  const b = currentRadiusZ;
  const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
  const circumference = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  
  // To reduce lag, we don't need a seat every 1.1 units. A seat every 1.5 units is fine visually.
  const numSeatsInRow = Math.floor(circumference / 1.5);
  
  for (let i = 0; i < numSeatsInRow; i++) {
    const angle = (i / numSeatsInRow) * Math.PI * 2;
    const x = Math.cos(angle) * currentRadiusX;
    const z = Math.sin(angle) * currentRadiusZ;
    
    const angleDeg = (angle * 180 / Math.PI + 360) % 360;
    
    let isAisle = false;
    
    // Four main entrances
    if (row < 14) {
      if ((angleDeg > 350 || angleDeg < 10) || 
          (angleDeg > 80 && angleDeg < 100) || 
          (angleDeg > 170 && angleDeg < 190) || 
          (angleDeg > 260 && angleDeg < 280)) {
        isAisle = true;
      }
    }
    
    // Stairways every 22.5 degrees
    if (angleDeg % 22.5 < 2 || angleDeg % 22.5 > 20.5) {
      isAisle = true;
    }
    
    if (!isAisle) {
      seats.push({ x, y, z });
    }
  }
}

console.log("Generated seats:", seats.length);
fs.writeFileSync('src/components/seats_extracted.json', JSON.stringify({ seats }, null, 2));

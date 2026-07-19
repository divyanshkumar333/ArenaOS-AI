const fs = require('fs');
let lines = fs.readFileSync('src/components/CrowdSystem.tsx', 'utf8').split('\n');

for (let i = 0; i < 470; i++) {
  lines[i] = lines[i].replace(/torsosDynamicRef\.current!\.setMatrixAt\(localIdx/g, 'torsosRef.current!.setMatrixAt(idx');
  lines[i] = lines[i].replace(/headsDynamicRef\.current!\.setMatrixAt\(localIdx/g, 'headsRef.current!.setMatrixAt(idx');
  lines[i] = lines[i].replace(/hairsDynamicRef\.current!\.setMatrixAt\(localIdx/g, 'hairsRef.current!.setMatrixAt(idx');
  lines[i] = lines[i].replace(/legsDynamicRef\.current!\.setMatrixAt\(localIdx \*/g, 'legsRef.current!.setMatrixAt(idx *');
  lines[i] = lines[i].replace(/hatsDynamicRef\.current!\.setMatrixAt\(localIdx/g, 'hatsRef.current!.setMatrixAt(idx');
  lines[i] = lines[i].replace(/backpacksDynamicRef\.current!\.setMatrixAt\(localIdx/g, 'backpacksRef.current!.setMatrixAt(idx');
}

for (let i = 475; i < 495; i++) {
  lines[i] = lines[i].replace(/colorTemp\.set\(/g, 'tempColor.setHex(');
}

fs.writeFileSync('src/components/CrowdSystem.tsx', lines.join('\n'));

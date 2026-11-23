import { readFileSync } from 'fs';

const content = readFileSync('src/data/fleetData.js', 'utf8');

// Extract all names from VEHICLE_IMAGE_URLS
const urlBlock = content.match(/VEHICLE_IMAGE_URLS\s*=\s*\{([\s\S]*?)\};/);
const urlNames = [];
if (urlBlock) {
  const matches = urlBlock[1].matchAll(/['"](.*?)['"]\s*:/g);
  for (const m of matches) urlNames.push(m[1]);
}

// Extract FEATURED names
const featuredNames = [];
const lines = content.split('\n');
for (const line of lines) {
  const m = line.match(/^\s*name:\s*'([^']+)'/);
  if (m) featuredNames.push(m[1]);
}

// Extract additionalCars
const carsBlock = content.match(/additionalCars\s*=\s*\[([\s\S]*?)\];/);
const cars = [];
if (carsBlock) {
  for (const m of carsBlock[1].matchAll(/'([^']+)'/g)) cars.push(m[1]);
}

// Extract additionalMotors  
const motorsBlock = content.match(/additionalMotors\s*=\s*\[([\s\S]*?)\];/);
const motors = [];
if (motorsBlock) {
  for (const m of motorsBlock[1].matchAll(/'([^']+)'/g)) motors.push(m[1]);
}

const allVehicles = [...featuredNames, ...cars, ...motors];
const withImages = new Set(urlNames);

console.log('=== Vehicles WITHOUT real images (using illustration SVG) ===');
const noImage = allVehicles.filter(n => !withImages.has(n));
console.log('Count:', noImage.length);
noImage.forEach(n => console.log(' -', n));

console.log('');
console.log('=== Vehicles WITH real images ===');
const hasImage = allVehicles.filter(n => withImages.has(n));
console.log('Count:', hasImage.length);
hasImage.forEach(n => console.log(' +', n));

// Cars without images
const carsNoImage = cars.filter(n => !withImages.has(n));
console.log('\n=== Additional Cars WITHOUT images ===');
carsNoImage.forEach((n, i) => {
  const idx = cars.indexOf(n);
  console.log(`  additionalCars[${idx}] = '${n}'`);
});

// Motors without images
const motorsNoImage = motors.filter(n => !withImages.has(n));
console.log('\n=== Additional Motors WITHOUT images ===');
motorsNoImage.forEach((n, i) => {
  const idx = motors.indexOf(n);
  console.log(`  additionalMotors[${idx}] = '${n}'`);
});

// Featured without images
const featuredNoImage = featuredNames.filter(n => !withImages.has(n));
console.log('\n=== Featured Vehicles WITHOUT images ===');
featuredNoImage.forEach(n => console.log(' -', n));

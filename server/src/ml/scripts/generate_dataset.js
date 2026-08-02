import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scenarioEngine, scenarioState } from '../../scenario/index.js';
import { extractTelemetryWindowFeatures } from './featureExtractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target dataset directory and filepath
const datasetDir = path.join(__dirname, '../datasets');
const csvFilePath = path.join(datasetDir, 'cortex_master_dataset.csv');

// Ensure datasets folder exists
if (!fs.existsSync(datasetDir)) {
  fs.mkdirSync(datasetDir, { recursive: true });
}

// Parse command line sample count: e.g. node generate_dataset.js --samples=5000
const args = process.argv.slice(2);
let totalSamples = 5000;
args.forEach(arg => {
  if (arg.startsWith('--samples=')) {
    const val = parseInt(arg.split('=')[1], 10);
    if (!isNaN(val) && val > 0) totalSamples = val;
  }
});

console.log(`\n🚀 Starting Cortex Offline Historical Dataset Generator...`);
console.log(`📦 Target Dataset File: ${csvFilePath}`);
console.log(`📊 Total Telemetry Windows to Generate: ${totalSamples.toLocaleString()} samples`);
console.log(`⚡ Mode: Pure In-Memory High-Throughput (Zero DB / Zero Sleep Timers / Zero Socket.io)\n`);

const startTime = Date.now();

// 1. Pre-generate telemetry windows in memory to compute lookahead targets
const windows = [];

for (let i = 0; i < totalSamples + 1; i++) {
  // Force transition every 12 samples in fast offline generation mode
  if (i > 0 && i % 12 === 0) {
    scenarioState.forceTransition();
  }

  // Read scenario state and batch
  const stateMetrics = scenarioEngine.getCurrentTelemetryState();
  const batch = scenarioEngine.generateRequestBatch();
  const logs = batch.steps;

  windows.push({
    workflow: batch.workflow,
    scenario: batch.scenario,
    requestVolume: stateMetrics.requestVolume,
    logs,
    stateMetrics
  });
}

// 2. Open High-Performance Buffered CSV Stream Writer
const writeStream = fs.createWriteStream(csvFilePath, { encoding: 'utf8' });

// Extract headers from first sample
const rawFirstFeature = extractTelemetryWindowFeatures(windows[0], null, windows[1]);
const csvHeaders = Object.keys(rawFirstFeature).join(',');
writeStream.write(csvHeaders + '\n');

// 3. Transform and Stream Serialize Features into CSV
let prevFeatureVector = null;

for (let i = 0; i < totalSamples; i++) {
  const currentWindow = windows[i];
  const nextWindow = windows[i + 1];

  // Extract feature vector
  const featureVector = extractTelemetryWindowFeatures(currentWindow, prevFeatureVector, extractTelemetryWindowFeatures(nextWindow, null, null));
  prevFeatureVector = featureVector;

  // Convert values to CSV row string
  const rowString = Object.values(featureVector)
    .map(val => {
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    })
    .join(',');

  writeStream.write(rowString + '\n');

  if ((i + 1) % 1000 === 0 || i + 1 === totalSamples) {
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`   [Progress] Generated ${ (i + 1).toLocaleString() } / ${ totalSamples.toLocaleString() } CSV rows (${ elapsedSec }s)...`);
  }
}

writeStream.end();

writeStream.on('finish', () => {
  const totalTimeMs = Date.now() - startTime;
  const totalTimeSec = (totalTimeMs / 1000).toFixed(2);
  const throughputPerSec = Math.round((totalSamples / totalTimeMs) * 1000);
  const fileSizeMb = (fs.statSync(csvFilePath).size / 1024 / 1024).toFixed(2);

  console.log(`\n===========================================================`);
  console.log(`✨ CORTEX HISTORICAL DATASET GENERATION COMPLETE!`);
  console.log(`===========================================================`);
  console.log(`📄 Output File: ${csvFilePath}`);
  console.log(`💾 File Size: ${fileSizeMb} MB`);
  console.log(`⏱️ Total Time Elapsed: ${totalTimeSec} seconds`);
  console.log(`⚡ Generation Throughput: ${throughputPerSec.toLocaleString()} telemetry windows / second`);
  console.log(`📊 Columns per Row: 44 Master Attributes & Target Labels`);
  console.log(`===========================================================\n`);
});

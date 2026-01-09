// backend/dataStore.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.trim()) {
    return [];
  }
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error(`Fehler beim Parsen von ${fileName}:`, e);
    return [];
  }
}

function writeJson(fileName, data) {
  const filePath = path.join(dataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readJson,
  writeJson
};

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

function loadJson(fileName) {
  const filePath = path.join(__dirname, 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

// Projekte
app.get('/api/projects', (req, res) => {
  const projects = loadJson('projects.json');
  res.json(projects);
});

// Risiken
app.get('/api/risks', (req, res) => {
  const risks = loadJson('risks.json');
  res.json(risks);
});

// Maßnahmen
app.get('/api/measures', (req, res) => {
  const measures = loadJson('measures.json');
  res.json(measures);
});

// Maßnahmen zu einem Risiko
app.get('/api/risks/:id/measures', (req, res) => {
  const riskId = req.params.id;
  const measures = loadJson('measures.json').filter(m => m.riskId === riskId);
  res.json(measures);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RSMS backend running on http://localhost:${PORT}`);
});

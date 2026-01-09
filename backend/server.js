// backend/server.js
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { readJson, writeJson } = require('./dataStore');

const app = express();
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Projekt anlegen
app.post('/api/tenants/:tenantId/projects', (req, res) => {
  const { tenantId } = req.params;
  const { name, type, startDate, plannedEndDate, projectManagerId, budget } = req.body;

  if (!name || !type || !projectManagerId) {
    return res.status(400).json({
      error: 'name, type und projectManagerId sind Pflichtfelder'
    });
  }

  const projects = readJson('projects.json');

  const projectId = randomUUID();
  const now = new Date().toISOString();

  const project = {
    id: projectId,
    tenantId,
    name,
    type,
    status: 'PLANNING',
    startDate: startDate || null,
    plannedEndDate: plannedEndDate || null,
    projectManagerId,
    budget: budget || null,
    createdAt: now,
    updatedAt: now
  };

  projects.push(project);
  writeJson('projects.json', projects);

  return res.status(201).json(project);
});

// Projekte eines Tenants auflisten
app.get('/api/tenants/:tenantId/projects', (req, res) => {
  const { tenantId } = req.params;
  const projects = readJson('projects.json');
  const filtered = projects.filter(p => p.tenantId === tenantId);
  res.json(filtered);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});

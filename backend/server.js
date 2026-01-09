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

// -----------------------------------------------------------------------------
// PROJEKTE
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// RISIKEN
// -----------------------------------------------------------------------------

// Risiken eines Projekts auflisten
app.get('/api/projects/:projectId/risks', (req, res) => {
  const { projectId } = req.params;

  const risks = readJson('risks.json');
  const projectRisks = risks.filter(r => r.projectId === projectId);

  res.json(projectRisks);
});

// Neues Risiko anlegen
app.post('/api/projects/:projectId/risks', (req, res) => {
  const { projectId } = req.params;
  const { title, description, likelihood, impact, category } = req.body;

  if (!title || likelihood == null || impact == null) {
    return res.status(400).json({
      error: 'title, likelihood und impact sind Pflichtfelder'
    });
  }

  const risks = readJson('risks.json');

  const riskId = randomUUID();
  const now = new Date().toISOString();

  const numericLikelihood = Number(likelihood);
  const numericImpact = Number(impact);
  const criticality = numericLikelihood * numericImpact;

  const risk = {
    id: riskId,
    projectId,
    title,
    description: description || '',
    likelihood: numericLikelihood,
    impact: numericImpact,
    criticality,
    category: category || 'SECURITY',
    status: 'IDENTIFIED',
    createdAt: now,
    updatedAt: now
  };

  risks.push(risk);
  writeJson('risks.json', risks);

  res.status(201).json(risk);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});

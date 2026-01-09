// === View-Navigation (Sidebar) ===
(function() {
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  function showView(name) {
    views.forEach(v => {
      if (v.id === 'view-' + name) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-view');
      if (!name) return;

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      showView(name);
    });
  });

  // Initial: Portfolio anzeigen
  showView('portfolio');
})();

// === Datenbasis (JSON unter /backend/data) ===
const DATA_BASE = './backend/data';

async function loadJson(file) {
  const res = await fetch(`${DATA_BASE}/${file}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} beim Laden von ${file}`);
  return await res.json();
}

// --- Portfolio (Projects) ---
async function initPortfolio() {
  try {
    const projects = await loadJson('projects.json');
    renderPortfolioProjects(projects);
    renderPortfolioPhases(projects);
  } catch (err) {
    console.warn('Konnte projects.json nicht laden, nutze statische Demos:', err);
  }
}

function renderPortfolioProjects(projects) {
  const table = document.querySelector('#view-portfolio table.top-risks-table tbody');
  if (!table) return;
  table.innerHTML = '';

  projects.forEach(p => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = `${p.id} ${p.name}`;

    const tdType = document.createElement('td');
    tdType.textContent = p.type || '';

    const tdStatus = document.createElement('td');
    tdStatus.textContent = p.status || '';

    const tdRisk = document.createElement('td');
    const span = document.createElement('span');
    span.classList.add('severity-pill');
    if (p.riskLevel === 'Critical') span.classList.add('severity-critical');
    else if (p.riskLevel === 'High') span.classList.add('severity-high');
    else span.classList.add('severity-medium');
    span.textContent = p.riskLevel || 'Medium';
    tdRisk.appendChild(span);

    const tdPM = document.createElement('td');
    tdPM.textContent = p.projectManager || '';

    tr.appendChild(tdName);
    tr.appendChild(tdType);
    tr.appendChild(tdStatus);
    tr.appendChild(tdRisk);
    tr.appendChild(tdPM);

    table.appendChild(tr);
  });
}

function renderPortfolioPhases(projects) {
  const body = document.querySelector('#view-portfolio table.matrix-table tbody');
  if (!body) return;
  body.innerHTML = '';

  projects.forEach(p => {
    const tr = document.createElement('tr');

    const tdProject = document.createElement('td');
    tdProject.textContent = p.name || p.id;
    tr.appendChild(tdProject);

    for (let i = 0; i < 9; i++) {
      const td = document.createElement('td');
      const v = (p.phases || [])[i];

      if (v === true) {
        td.textContent = '✔';
      } else if (v === 'in-progress') {
        td.textContent = '●';
      } else if (v === 'planned') {
        td.textContent = '○';
      } else {
        td.textContent = '-';
      }

      tr.appendChild(td);
    }

    body.appendChild(tr);
  });
}

// --- Executive (Risks) ---
async function initExecutive() {
  try {
    const risks = await loadJson('risks.json');
    renderExecutiveTopRisks(risks);
    renderExecutiveKPIs(risks);
  } catch (err) {
    console.warn('Konnte risks.json nicht laden, nutze statische Demos:', err);
  }
}

function renderExecutiveTopRisks(risks) {
  const tbody = document.querySelector('#view-executive table.top-risks-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const top = [...risks]
    .sort((a, b) => (b.criticality || 0) - (a.criticality || 0))
    .slice(0, 5);

  top.forEach(risk => {
    const tr = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.textContent = `${risk.id}: ${risk.title}`;

    const tdOwner = document.createElement('td');
    tdOwner.textContent = risk.riskOwner || risk.owner || '';

    const tdResidual = document.createElement('td');
    const span = document.createElement('span');
    span.classList.add('severity-pill');
    if (risk.residualLevel === 'Critical') span.classList.add('severity-critical');
    else if (risk.residualLevel === 'High') span.classList.add('severity-high');
    else span.classList.add('severity-medium');
    span.textContent = risk.residualLevel || 'Medium';
    tdResidual.appendChild(span);

    const tdStatus = document.createElement('td');
    tdStatus.textContent = risk.status || '';

    tr.appendChild(tdTitle);
    tr.appendChild(tdOwner);
    tr.appendChild(tdResidual);
    tr.appendChild(tdStatus);

    tbody.appendChild(tr);
  });
}

function renderExecutiveKPIs(risks) {
  const totalCritical = risks.filter(r => r.residualLevel === 'Critical').length;
  const criticalElem = document.querySelector('#view-executive .grid:nth-of-type(1) .card:nth-of-type(2) .kpi-value');
  if (criticalElem) criticalElem.textContent = String(totalCritical);

  console.log('Risiko-Verteilung Executive:', { totalCritical });
}

// --- Risk & Measures Dashboard ---
async function initRiskDashboard() {
  try {
    const [risks, measures] = await Promise.all([
      loadJson('risks.json'),
      loadJson('measures.json')
    ]);

    renderRiskKPIs(risks, measures);
    renderRiskRegister(risks, measures);
  } catch (err) {
    console.warn('Konnte Risk Dashboard Daten nicht laden:', err);
  }
}

function renderRiskKPIs(risks, measures) {
  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r =>
    (r.residualLevel || r.currentLevel || '').toLowerCase() === 'critical'.toLowerCase()
  ).length;
  const openMeasures = measures.filter(m => (m.status || '').toLowerCase() !== 'done').length;

  const totalElem = document.getElementById('risk-kpi-total');
  const criticalElem = document.getElementById('risk-kpi-critical');
  const openMeasuresElem = document.getElementById('risk-kpi-open-measures');

  if (totalElem) totalElem.textContent = String(totalRisks);
  if (criticalElem) criticalElem.textContent = String(criticalRisks);
  if (openMeasuresElem) openMeasuresElem.textContent = String(openMeasures);
}

function renderRiskRegister(risks, measures) {
  const tbody = document.querySelector('#risk-register-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Sortiere z.B. nach Criticality absteigend
  const sortedRisks = [...risks].sort((a, b) => (b.criticality || 0) - (a.criticality || 0));

  sortedRisks.forEach(risk => {
    // Risiko-Hauptzeile
    const tr = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.textContent = `${risk.id}: ${risk.title}`;

    const tdCategory = document.createElement('td');
    tdCategory.textContent = risk.category || '';

    const tdLikelihood = document.createElement('td');
    tdLikelihood.textContent = risk.likelihood != null ? String(risk.likelihood) : '';

    const tdImpact = document.createElement('td');
    tdImpact.textContent = risk.impact != null ? String(risk.impact) : '';

    const tdCriticality = document.createElement('td');
    tdCriticality.textContent = risk.criticality != null ? String(risk.criticality) : '';

    const tdStrategy = document.createElement('td');
    tdStrategy.textContent = risk.treatmentStrategy || '';

    const tdOwner = document.createElement('td');
    tdOwner.textContent = risk.riskOwner || risk.owner || '';

    const tdStatus = document.createElement('td');
    const statusText = (risk.status || '').toLowerCase();
    const statusBadge = document.createElement('span');
    statusBadge.classList.add('badge');

    if (statusText === 'open') {
      statusBadge.classList.add('badge-status-open');
      statusBadge.textContent = 'Open';
    } else if (statusText === 'in progress' || statusText === 'mitigation laufend') {
      statusBadge.classList.add('badge-status-progress');
      statusBadge.textContent = 'In Progress';
    } else if (statusText === 'closed' || statusText === 'resolved') {
      statusBadge.classList.add('badge-status-done');
      statusBadge.textContent = 'Closed';
    } else {
      statusBadge.textContent = risk.status || '';
    }

    tdStatus.appendChild(statusBadge);

    tr.appendChild(tdTitle);
    tr.appendChild(tdCategory);
    tr.appendChild(tdLikelihood);
    tr.appendChild(tdImpact);
    tr.appendChild(tdCriticality);
    tr.appendChild(tdStrategy);
    tr.appendChild(tdOwner);
    tr.appendChild(tdStatus);

    tbody.appendChild(tr);

    // Maßnahmen-Zeile
    const linkedMeasures = measures.filter(m => m.riskId === risk.id);
    if (linkedMeasures.length > 0) {
      const trMeasures = document.createElement('tr');
      const tdMeasures = document.createElement('td');
      tdMeasures.colSpan = 8;

      tdMeasures.innerHTML = renderMeasuresInline(linkedMeasures);
      trMeasures.appendChild(tdMeasures);
      tbody.appendChild(trMeasures);
    }
  });
}

function renderMeasuresInline(measures) {
  const itemsHtml = measures.map(m => {
    const status = (m.status || '').toLowerCase();
    let statusClass = 'badge-status-open';
    let statusLabel = m.status || '';

    if (status === 'in progress') {
      statusClass = 'badge-status-progress';
      statusLabel = 'In Progress';
    } else if (status === 'done' || status === 'completed') {
      statusClass = 'badge-status-done';
      statusLabel = 'Done';
    }

    return `
      <li>
        <strong>${m.id}</strong> – ${m.title}
        <span class="badge ${statusClass}">${statusLabel}</span>
      </li>
    `;
  }).join('');

  return `
    <div class="measures-list">
      <div><strong>Maßnahmen:</strong></div>
      <ul>
        ${itemsHtml}
      </ul>
    </div>
  `;
}

// Initialisierung beim Laden
initPortfolio();
initExecutive();
initRiskDashboard();

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

// === Daten aus statischen JSON-Dateien laden (für GitHub Pages) ===
const DATA_BASE = './data';

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
    .sort((a, b) => b.criticality - a.criticality)
    .slice(0, 5);

  top.forEach(risk => {
    const tr = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.textContent = `${risk.id}: ${risk.title}`;

    const tdOwner = document.createElement('td');
    tdOwner.textContent = risk.owner || '';

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
  const totalHigh = risks.filter(r => r.residualLevel === 'High').length;
  const totalMedium = risks.filter(r => r.residualLevel === 'Medium').length;

  const criticalElem = document.querySelector('#view-executive .grid:nth-of-type(1) .card:nth-of-type(2) .kpi-value');
  if (criticalElem) criticalElem.textContent = String(totalCritical);

  console.log('Risiko-Verteilung:', { totalCritical, totalHigh, totalMedium });
}

// Initialisierung beim Laden
initPortfolio();
initExecutive();

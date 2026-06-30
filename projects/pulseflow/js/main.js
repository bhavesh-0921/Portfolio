/* ============================================
   PULSEFLOW — Enterprise Dashboard Engine
   ============================================
   State management, dynamic charting, kanban drag/drop,
   workflow canvas connections, and command panel (Cmd+K).
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAppRouter();
  initCommandMenu();
  initKanbanDragDrop();
  initAnalyticsCharts();
  initWorkflowEngine();
  initTaskModal();
  initFAQAccordion();
  initMetricsAnimation();
  initNotifications();
});

/* ---- STATE STORE (Mock Database) ---- */
const AppState = {
  tasks: [
    { id: 'PF-101', title: 'Migrate DB to globally distributed cluster', status: 'backlog', priority: 'high', assignee: 'BA', time: '1d ago' },
    { id: 'PF-102', title: 'Audit API endpoints for security compliance', status: 'progress', priority: 'medium', assignee: 'IA', time: '2h ago' },
    { id: 'PF-103', title: 'Deploy updated billing dashboard to staging', status: 'done', priority: 'low', assignee: 'CB', time: 'Yesterday' }
  ],
  workflows: [
    { id: 'wf-1', type: 'trigger', title: 'On Task State Completed', category: 'System' },
    { id: 'wf-2', type: 'condition', title: 'Check if Priority == High', category: 'Logic' },
    { id: 'wf-3', type: 'action', title: 'Notify Slack channel #alerts', category: 'Integration' }
  ],
  notifications: [
    { title: 'Cluster scaling complete', desc: 'Added 4 new edge regions.', type: 'success' },
    { title: 'Rate limit warning', desc: 'Endpoint /v1/flows hit 85% capacity.', type: 'warning' }
  ]
};

/* ---- NOTIFICATIONS SYSTEM ---- */
function initNotifications() {
  const container = document.createElement('div');
  container.className = 'pf-toast-container';
  document.body.appendChild(container);

  window.showToast = (title, desc, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `pf-toast pf-toast--${type}`;
    toast.innerHTML = `
      <div class="pf-toast__body">
        <span class="pf-toast__title">${title}</span>
        <span class="pf-toast__desc">${desc}</span>
      </div>
      <button class="pf-toast__close">✕</button>
    `;
    container.appendChild(toast);

    toast.querySelector('.pf-toast__close').addEventListener('click', () => toast.remove());
    setTimeout(() => {
      toast.classList.add('pf-toast--fadeOut');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };
}

/* ---- SPA TAB ROUTER ---- */
function initAppRouter() {
  const links = document.querySelectorAll('[data-tab-target]');
  const views = document.querySelectorAll('[data-tab-view]');
  const headerTitle = document.getElementById('pf-header-title');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab-target');

      links.forEach(l => l.classList.toggle('active', l.getAttribute('data-tab-target') === tab));
      views.forEach(v => v.classList.toggle('active', v.getAttribute('data-tab-view') === tab));

      if (headerTitle) {
        headerTitle.innerHTML = `${tab.charAt(0).toUpperCase() + tab.slice(1)} <span style="font-size: 11px; opacity: 0.4; margin-left: 8px;">Workspace / ${tab}</span>`;
      }

      if (tab === 'automation') {
        setTimeout(drawWorkflowLines, 50); // Redraw SVG path links
      }
    });
  });
}

/* ---- COMMAND MENU (Cmd + K / Search) ---- */
function initCommandMenu() {
  const cmdMenu = document.createElement('div');
  cmdMenu.className = 'pf-cmd-menu';
  cmdMenu.innerHTML = `
    <div class="pf-cmd-menu__box">
      <div class="pf-cmd-menu__search-wrapper">
        <span class="pf-cmd-menu__search-icon">🔍</span>
        <input type="text" class="pf-cmd-menu__input" placeholder="Type a command or search workspace..." autofocus>
        <span class="pf-cmd-menu__esc">ESC</span>
      </div>
      <div class="pf-cmd-menu__results">
        <div class="pf-cmd-menu__group-label">Navigation</div>
        <div class="pf-cmd-menu__item" data-action="nav" data-dest="dashboard">Go to Dashboard <span class="shortcut">↵</span></div>
        <div class="pf-cmd-menu__item" data-action="nav" data-dest="projects">Go to Projects Board <span class="shortcut">↵</span></div>
        <div class="pf-cmd-menu__item" data-action="nav" data-dest="analytics">Go to Analytics <span class="shortcut">↵</span></div>
        <div class="pf-cmd-menu__item" data-action="nav" data-dest="automation">Go to Flow Builder <span class="shortcut">↵</span></div>
        <div class="pf-cmd-menu__group-label">Actions</div>
        <div class="pf-cmd-menu__item" data-action="new-task">Create new task <span class="shortcut">⌘N</span></div>
        <div class="pf-cmd-menu__item" data-action="clear-tasks">Clear completed tasks</div>
      </div>
    </div>
  `;
  document.body.appendChild(cmdMenu);

  const toggleCmdMenu = (show) => {
    cmdMenu.classList.toggle('open', show);
    if (show) cmdMenu.querySelector('.pf-cmd-menu__input').focus();
  };

  // Keyboard triggers
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleCmdMenu(!cmdMenu.classList.contains('open'));
    }
    if (e.key === 'Escape') {
      toggleCmdMenu(false);
    }
  });

  // Global search input triggers Cmd+K
  const searchInput = document.querySelector('.pf-search__input');
  if (searchInput) {
    searchInput.addEventListener('focus', (e) => {
      e.preventDefault();
      searchInput.blur();
      toggleCmdMenu(true);
    });
  }

  cmdMenu.addEventListener('click', (e) => {
    if (e.target === cmdMenu) toggleCmdMenu(false);
  });

  // Action execution
  cmdMenu.querySelectorAll('.pf-cmd-menu__item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      const dest = item.getAttribute('data-dest');

      toggleCmdMenu(false);

      if (action === 'nav') {
        const link = document.querySelector(`[data-tab-target="${dest}"]`);
        if (link) link.click();
      } else if (action === 'new-task') {
        const btn = document.querySelector('[data-open-modal]');
        if (btn) btn.click();
      } else if (action === 'clear-tasks') {
        AppState.tasks = AppState.tasks.filter(t => t.status !== 'done');
        renderKanban();
        renderTable();
        window.showToast('Tasks cleared', 'Completed tasks removed from workspace.', 'success');
      }
    });
  });
}

/* ---- KANBAN BOARD WITH DRAG & DROP ---- */
function initKanbanDragDrop() {
  renderKanban();
  renderTable();

  const cols = document.querySelectorAll('.pf-kanban-col__list');
  cols.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const targetStatus = col.getAttribute('data-kanban-status');

      const task = AppState.tasks.find(t => t.id === taskId);
      if (task && task.status !== targetStatus) {
        task.status = targetStatus;
        renderKanban();
        renderTable();
        window.showToast('Task status updated', `Moved ${task.id} to ${targetStatus}.`, 'success');
      }
    });
  });
}

function renderKanban() {
  const columns = {
    backlog: document.querySelector('[data-kanban-status="backlog"]'),
    progress: document.querySelector('[data-kanban-status="progress"]'),
    done: document.querySelector('[data-kanban-status="done"]')
  };

  if (!columns.backlog) return;

  // Clear lists
  Object.keys(columns).forEach(key => {
    columns[key].innerHTML = '';
  });

  // Populate tasks
  AppState.tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'pf-task-card';
    card.draggable = true;
    card.setAttribute('data-task-id', task.id);
    
    const priorityClass = `badge badge--${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`;

    card.innerHTML = `
      <div class="pf-task-card__header">
        <span class="pf-task-card__id">${task.id}</span>
        <span class="${priorityClass}">${task.priority}</span>
      </div>
      <h4 class="pf-task-card__title">${task.title}</h4>
      <div class="pf-task-card__footer">
        <span class="pf-task-card__assignee">
          <span class="pf-avatar" style="width:20px; height:20px; font-size:9px;">${task.assignee}</span>
        </span>
        <span class="pf-task-card__time">${task.time}</span>
      </div>
    `;

    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.id);
      setTimeout(() => card.style.opacity = '0.4', 0);
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
    });

    if (columns[task.status]) {
      columns[task.status].appendChild(card);
    }
  });

  // Update counts
  Object.keys(columns).forEach(key => {
    const countSpan = columns[key].parentElement.querySelector('.pf-kanban-col__count');
    if (countSpan) {
      countSpan.textContent = columns[key].children.length;
    }
  });
}

function renderTable() {
  const tbody = document.querySelector('.pf-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  AppState.tasks.forEach(task => {
    const tr = document.createElement('tr');
    const statusBadge = `badge badge--${task.status === 'done' ? 'success' : task.status === 'progress' ? 'warning' : 'danger'}`;
    const priorityColor = task.priority === 'high' ? 'var(--pf-danger)' : task.priority === 'medium' ? 'var(--pf-warning)' : 'var(--pf-text-secondary)';
    
    tr.innerHTML = `
      <td style="color:var(--pf-text-primary); font-weight:500;">
        <span style="font-family:var(--pf-mono); font-size:11px; opacity:0.5; margin-right:8px;">${task.id}</span>
        ${task.title}
      </td>
      <td><span class="${statusBadge}">${task.status === 'progress' ? 'In Progress' : task.status === 'done' ? 'Completed' : 'Backlog'}</span></td>
      <td style="color:${priorityColor}; font-weight:500;">${task.priority.toUpperCase()}</td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="pf-avatar" style="width:20px; height:20px; font-size:9px;">${task.assignee}</span>
          ${task.assignee === 'BA' ? 'Bhavesh Agrawal' : task.assignee === 'IA' ? 'Integration Agent' : 'Corporate Bot'}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---- ANALYTICS CHARTS (Rich SVG Line Graph) ---- */
function initAnalyticsCharts() {
  const chartWrapper = document.querySelector('.pf-chart-graph');
  if (!chartWrapper) return;

  const dataset = [30, 45, 38, 70, 62, 85, 94];
  const width = 600;
  const height = 180;
  const padding = 20;

  // Generate SVG path coordinate points
  const points = dataset.map((val, idx) => {
    const x = padding + (idx / (dataset.length - 1)) * (width - padding * 2);
    const y = height - padding - (val / 100) * (height - padding * 2);
    return { x, y };
  });

  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  chartWrapper.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
      <defs>
        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--pf-accent)" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="var(--pf-accent)" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <!-- Gridlines -->
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <line x1="${padding}" y1="${(height - padding) / 2}" x2="${width - padding}" y2="${(height - padding) / 2}" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      
      <!-- Area Graph -->
      <path d="${areaD}" fill="url(#chartGlow)" />
      <!-- Line Graph -->
      <path d="${pathD}" fill="none" stroke="var(--pf-accent)" stroke-width="2" />
      
      <!-- Plot Points -->
      ${points.map((p, i) => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--pf-surface)" stroke="var(--pf-accent)" stroke-width="2" class="pf-chart-point" data-val="${dataset[i]}"/>
      `).join('')}
    </svg>
  `;
}

/* ---- WORKFLOW BUILDER ENGINE (Active Connecting Lines) ---- */
function initWorkflowEngine() {
  const addNodeBtn = document.getElementById('pf-add-node-btn');
  if (!addNodeBtn) return;

  const nodeTemplates = [
    { type: 'action', title: 'Send Slack alert to #deployment', category: 'Slack' },
    { type: 'condition', title: 'Check if payload.error == true', category: 'Logic' },
    { type: 'action', title: 'Post Webhook status check', category: 'System' }
  ];
  let templateIndex = 0;

  addNodeBtn.addEventListener('click', () => {
    if (templateIndex >= nodeTemplates.length) {
      window.showToast('Demo limit reached', 'Only 3 custom pipeline nodes allowed in sandbox mode.', 'warning');
      return;
    }

    const tpl = nodeTemplates[templateIndex++];
    const nodeFlowList = document.getElementById('pf-node-flow-list');

    // Create workflow model record
    const newId = `wf-${AppState.workflows.length + 1}`;
    AppState.workflows.push({ id: newId, type: tpl.type, title: tpl.title, category: tpl.category });

    // Render node card
    const nodeCard = document.createElement('div');
    nodeCard.className = `pf-node pf-node--${tpl.type}`;
    nodeCard.setAttribute('id', newId);
    nodeCard.innerHTML = `
      <div class="pf-node__header">
        <span class="badge badge--info">${tpl.category}</span>
        <button class="pf-node__delete">✕</button>
      </div>
      <h4 class="pf-node__title">${tpl.title}</h4>
    `;

    nodeFlowList.appendChild(nodeCard);

    // Delete handler
    nodeCard.querySelector('.pf-node__delete').addEventListener('click', (e) => {
      e.stopPropagation();
      AppState.workflows = AppState.workflows.filter(w => w.id !== newId);
      nodeCard.remove();
      drawWorkflowLines();
      window.showToast('Node removed', 'Pipeline step deleted from memory.', 'info');
    });

    drawWorkflowLines();
    window.showToast('Pipeline updated', `Added "${tpl.title}" to flow trigger.`, 'success');
  });

  window.addEventListener('resize', drawWorkflowLines);
}

function drawWorkflowLines() {
  const container = document.querySelector('.pf-automation-canvas');
  let svg = document.getElementById('pf-workflow-svg');

  if (!container) return;

  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'pf-workflow-svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1';
    container.appendChild(svg);
  }

  svg.innerHTML = '';

  const nodes = document.querySelectorAll('.pf-node');
  if (nodes.length < 2) return;

  for (let i = 0; i < nodes.length - 1; i++) {
    const nodeA = nodes[i];
    const nodeB = nodes[i + 1];

    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();
    const canvasRect = container.getBoundingClientRect();

    // Compute relative start/end connector ports
    const startX = (rectA.left + rectA.right) / 2 - canvasRect.left;
    const startY = rectA.bottom - canvasRect.top;
    
    const endX = (rectB.left + rectB.right) / 2 - canvasRect.left;
    const endY = rectB.top - canvasRect.top;

    const controlPointY = startY + (endY - startY) / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${startX} ${startY} C ${startX} ${controlPointY}, ${endX} ${controlPointY}, ${endX} ${endY}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--pf-border-hover)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '4, 4');
    
    svg.appendChild(path);
  }
}

/* ---- NEW TASK DIALOG MOCK ---- */
function initTaskModal() {
  const modalBackdrop = document.getElementById('pf-modal-backdrop');
  const openBtns = document.querySelectorAll('[data-open-modal]');
  const closeBtns = document.querySelectorAll('[data-close-modal]');
  const form = document.getElementById('pf-new-task-form');

  if (!modalBackdrop) return;

  openBtns.forEach(btn => btn.addEventListener('click', () => modalBackdrop.classList.add('open')));
  closeBtns.forEach(btn => btn.addEventListener('click', () => modalBackdrop.classList.remove('open')));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('pf-task-title-input').value;
      const status = document.getElementById('pf-task-status-input').value;

      if (!title) return;

      const newId = `PF-${100 + AppState.tasks.length + 1}`;
      AppState.tasks.push({
        id: newId,
        title,
        status,
        priority: 'high',
        assignee: 'BA',
        time: 'Just now'
      });

      renderKanban();
      renderTable();
      form.reset();
      modalBackdrop.classList.remove('open');
      window.showToast('Task Created', `Added ${newId} to board.`, 'success');
    });
  }
}

/* ---- FAQ ACCORDIONS ---- */
function initFAQAccordion() {
  document.querySelectorAll('.pf-faq-item').forEach(item => {
    const header = item.querySelector('.pf-faq-item__header');
    const body = item.querySelector('.pf-faq-item__body');

    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.pf-faq-item').forEach(other => {
        other.classList.remove('open');
        const otherBody = other.querySelector('.pf-faq-item__body');
        if (otherBody) otherBody.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ---- METRICS ANIMATION ---- */
function initMetricsAnimation() {
  const metrics = document.querySelectorAll('[data-metric-target]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const val = parseFloat(entry.target.getAttribute('data-metric-target'));
        const suffix = entry.target.getAttribute('data-metric-suffix') || '';
        let start = 0;
        const duration = 1500;
        const startTime = performance.now();

        function animate(t) {
          const elapsed = t - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = progress * (2 - progress); // Ease out quad
          const currentVal = start + easeProgress * (val - start);

          if (val % 1 === 0) {
            entry.target.textContent = Math.floor(currentVal).toLocaleString() + suffix;
          } else {
            entry.target.textContent = currentVal.toFixed(1) + suffix;
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        }
        requestAnimationFrame(animate);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  metrics.forEach(m => observer.observe(m));
}

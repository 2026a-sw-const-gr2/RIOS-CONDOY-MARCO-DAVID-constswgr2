// =============================================
//  GESTOR DE SUSCRIPCIONES — EPN
//  Taller Construcción de Software
//  Integración con EPN Event Manager
// =============================================

import { suscripcionesRepo } from './data-access/subscription.repository.js';

const EPN_URL = 'http://localhost:3000/events';

let editId = null;

function saveAndRender() {
  render();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function addLog(action, nombre, ok) {
  const container = document.getElementById('log-container');
  const empty = container.querySelector('.log-empty');
  if (empty) empty.remove();

  const ts = new Date().toISOString();
  const item = document.createElement('div');
  item.className = 'log-item';

  const statusSpan = ok
    ? `<span class="ok">✓ 200 OK — guardado en hub</span>`
    : `<span class="fail">✗ sin conexión — guardado en localStorage</span>`;

  item.innerHTML = `[${ts}] <strong>${action}</strong> → ${nombre} — ${statusSpan}`;
  container.prepend(item);

  while (container.children.length > 10) {
    container.lastChild.remove();
  }
}

async function sendEvent(action, sub, oldSub) {
  const payload = { ...sub };
  if (oldSub) payload.previous = oldSub;

  const body = {
    source: 'subscription-manager',
    entity: 'Suscripcion',
    action: action.toUpperCase(),
    title: `${action} — ${sub.nombre}`,
    description: `${sub.nombre} | ${sub.plan || 'Sin plan'} | $${parseFloat(sub.valor).toFixed(2)}/mes`,
    payload: payload
  };

  try {
    const response = await fetch(EPN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000)
    });
    const ok = response.ok;
    addLog(action.toUpperCase(), sub.nombre, ok);
    return ok;
  } catch (err) {
    addLog(action.toUpperCase(), sub.nombre, false);
    return false;
  }
}

function daysUntil(dia) {
  const today = new Date();
  let target = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  target.setDate(dia);
  if (target <= today) {
    target = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    target.setDate(dia);
  }
  return Math.ceil((target - today) / 86400000);
}

function badgeClass(cat) {
  const map = {
    streaming: 'badge-streaming',
    anime:     'badge-anime',
    celular:   'badge-celular',
    gaming:    'badge-gaming',
    otro:      'badge-otro'
  };
  return map[cat] || 'badge-otro';
}

function catLabel(cat) {
  const map = {
    streaming: 'Streaming',
    anime:     'Anime',
    celular:   'Plan Celular',
    gaming:    'Gaming',
    otro:      'Otro'
  };
  return map[cat] || 'Otro';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

function render() {
  const grid   = document.getElementById('sub-grid');
  const empty  = document.getElementById('empty-msg');

  Array.from(grid.querySelectorAll('.sub-card')).forEach(c => c.remove());

  const subs = suscripcionesRepo.findAll();

  if (subs.length === 0) {
    empty.style.display = 'block';
    updateStats(0, 0, '—');
    return;
  }

  empty.style.display = 'none';

  let totalGasto = 0;
  let minDays    = Infinity;
  let minName    = '—';

  subs.forEach(sub => {
    const valor = parseFloat(sub.valor) || 0;
    totalGasto += valor;

    const days = daysUntil(parseInt(sub.dia));
    if (days < minDays) { minDays = days; minName = sub.nombre; }

    let dueClass = 'due';
    let duePrefix = '📅';
    if (days <= 3)      { dueClass += ' urgent'; duePrefix = '🔴'; }
    else if (days <= 7) { dueClass += ' soon';   duePrefix = '🟡'; }

    const card = document.createElement('div');
    card.className = 'sub-card';
    card.innerHTML = `
      <span class="badge ${badgeClass(sub.cat)}">${catLabel(sub.cat)}</span>
      <h3>${escHtml(sub.nombre)}</h3>
      <p class="plan">${escHtml(sub.plan || 'Sin plan especificado')}</p>
      <p class="price">$${parseFloat(sub.valor).toFixed(2)}<span>/mes</span></p>
      <p class="${dueClass}">${duePrefix} Pago en ${days} día${days !== 1 ? 's' : ''} (día ${sub.dia})</p>
      ${sub.metodo ? `<p class="metodo-tag">💳 ${escHtml(sub.metodo)}</p>` : ''}
      <div class="card-actions">
        <button class="btn-edit" onclick="openModal('${sub.id}')">✏️ Editar</button>
        <button class="btn-delete" onclick="deleteSub('${sub.id}')">🗑️ Eliminar</button>
      </div>
    `;
    grid.appendChild(card);
  });

  const proxText = subs.length ? `${minName} (${minDays}d)` : '—';
  updateStats(subs.length, totalGasto, proxText);
}

function updateStats(total, gasto, prox) {
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-gasto').textContent = '$' + gasto.toFixed(2);
  document.getElementById('stat-prox').textContent  = prox;
}

function openModal(id) {
  editId = id || null;
  const bg    = document.getElementById('modal-bg');
  const title = document.getElementById('modal-title');
  const btn   = document.getElementById('btn-guardar');

  if (id) {
    const sub = suscripcionesRepo.findById(id);
    if (!sub) return;
    title.textContent             = 'Editar suscripción';
    btn.textContent               = 'Actualizar';
    document.getElementById('f-nombre').value  = sub.nombre;
    document.getElementById('f-cat').value     = sub.cat;
    document.getElementById('f-plan').value    = sub.plan || '';
    document.getElementById('f-valor').value   = sub.valor;
    document.getElementById('f-dia').value     = sub.dia;
    document.getElementById('f-metodo').value  = sub.metodo || '';
  } else {
    title.textContent = 'Nueva suscripción';
    btn.textContent   = 'Guardar';
    ['f-nombre','f-plan','f-valor','f-dia','f-metodo'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('f-cat').value = 'streaming';
  }

  bg.classList.add('open');
  setTimeout(() => document.getElementById('f-nombre').focus(), 60);
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  editId = null;
}

document.getElementById('modal-bg').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

async function guardar() {
  const nombre = document.getElementById('f-nombre').value.trim();
  const valorStr = document.getElementById('f-valor').value;
  const diaStr   = document.getElementById('f-dia').value;

  if (!nombre) {
    showToast('⚠️ El nombre del servicio es obligatorio.');
    document.getElementById('f-nombre').focus();
    return;
  }

  if (nombre.length > 80) {
    showToast('⚠️ El nombre no puede superar 80 caracteres.');
    return;
  }

  const valor = parseFloat(valorStr);
  if (!valorStr || isNaN(valor) || valor < 0 || valor > 9999) {
    showToast('⚠️ Ingresa un valor mensual válido (0 – 9999).');
    document.getElementById('f-valor').focus();
    return;
  }

  const dia = parseInt(diaStr);
  if (!diaStr || isNaN(dia) || dia < 1 || dia > 31) {
    showToast('⚠️ El día de pago debe estar entre 1 y 31.');
    document.getElementById('f-dia').focus();
    return;
  }

  const sub = {
    nombre:    nombre,
    cat:       document.getElementById('f-cat').value,
    plan:      document.getElementById('f-plan').value.trim().slice(0, 100),
    valor:     valor.toFixed(2),
    dia:       dia,
    metodo:    document.getElementById('f-metodo').value.trim().slice(0, 60)
  };

  if (editId) {
    const old = suscripcionesRepo.findById(editId);
    const result = suscripcionesRepo.update(editId, sub);
    saveAndRender();
    closeModal();
    showToast('✅ Suscripción actualizada.');
    await sendEvent('UPDATE', result.updated, result.old);
  } else {
    const created = suscripcionesRepo.create(sub);
    saveAndRender();
    closeModal();
    showToast('✅ Suscripción agregada.');
    await sendEvent('CREATE', created);
  }
}

async function deleteSub(id) {
  const sub = suscripcionesRepo.findById(id);
  if (!sub) return;

  const confirmar = confirm(`¿Eliminar la suscripción "${sub.nombre}"?`);
  if (!confirmar) return;

  suscripcionesRepo.delete(id);
  saveAndRender();
  showToast('🗑️ Suscripción eliminada.');
  await sendEvent('DELETE', sub);
}

render();
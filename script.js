/* ══════════════════════════════════════════════════════════
   SGA — Sistema de Gestión Académica
   script.js — Lógica completa (localStorage, formularios, UI)
══════════════════════════════════════════════════════════ */

// ─── ESTADO / DATOS ────────────────────────────────────────

let estado = {
  estudiantes: [],
  materias: [],
  calificaciones: []
};

// ─── INIT ──────────────────────────────────────────────────

function init() {
  cargarDesdeStorage();
  if (estado.estudiantes.length === 0) cargarDatosEjemplo();
  setupNav();
  setupForms();
  setupMobileMenu();
  renderAll();
}

// ─── STORAGE ───────────────────────────────────────────────

function cargarDesdeStorage() {
  try {
    const raw = localStorage.getItem('sga_data');
    if (raw) estado = JSON.parse(raw);
  } catch (_) {}
}

function guardarEnStorage() {
  localStorage.setItem('sga_data', JSON.stringify(estado));
}

// ─── DATOS EJEMPLO ──────────────────────────────────────────

function cargarDatosEjemplo() {
  estado.estudiantes = [
    { id: 'e1', nombre: 'Valentina López',  curso: '3° A' },
    { id: 'e2', nombre: 'Matías Rodríguez', curso: '3° A' },
    { id: 'e3', nombre: 'Camila Fernández', curso: '3° B' },
    { id: 'e4', nombre: 'Luciano Torres',   curso: '4° A' },
    { id: 'e5', nombre: 'Sofía Martínez',   curso: '4° A' },
  ];
  estado.materias = [
    { id: 'm1', nombre: 'Matemática',   area: 'Ciencias Exactas' },
    { id: 'm2', nombre: 'Lengua',       area: 'Lengua y Literatura' },
    { id: 'm3', nombre: 'Historia',     area: 'Ciencias Sociales' },
    { id: 'm4', nombre: 'Física',       area: 'Ciencias Exactas' },
    { id: 'm5', nombre: 'Inglés',       area: 'Idiomas' },
  ];
  estado.calificaciones = [
    // Valentina — Aprobada
    { id: genId(), estudianteId: 'e1', materiaId: 'm1', nota: 8,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e1', materiaId: 'm2', nota: 9,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e1', materiaId: 'm3', nota: 7,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e1', materiaId: 'm4', nota: 8,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e1', materiaId: 'm5', nota: 10, periodo: '1° Bimestre' },
    // Matías — En proceso
    { id: genId(), estudianteId: 'e2', materiaId: 'm1', nota: 5,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e2', materiaId: 'm2', nota: 6,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e2', materiaId: 'm3', nota: 7,  periodo: '1° Bimestre' },
    // Camila — Desaprobada
    { id: genId(), estudianteId: 'e3', materiaId: 'm1', nota: 3,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e3', materiaId: 'm2', nota: 4,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e3', materiaId: 'm3', nota: 3,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e3', materiaId: 'm4', nota: 5,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e3', materiaId: 'm5', nota: 2,  periodo: '1° Bimestre' },
    // Luciano — Aprobado
    { id: genId(), estudianteId: 'e4', materiaId: 'm1', nota: 7,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e4', materiaId: 'm2', nota: 8,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e4', materiaId: 'm3', nota: 9,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e4', materiaId: 'm4', nota: 6,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e4', materiaId: 'm5', nota: 7,  periodo: '1° Bimestre' },
    // Sofía — En proceso
    { id: genId(), estudianteId: 'e5', materiaId: 'm1', nota: 6,  periodo: '1° Bimestre' },
    { id: genId(), estudianteId: 'e5', materiaId: 'm2', nota: 5,  periodo: '1° Bimestre' },
  ];
  guardarEnStorage();
}

// ─── UTILS ─────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function toast(msg, tipo = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${tipo}`;
  setTimeout(() => { el.className = 'toast'; }, 2800);
}

/**
 * LÓGICA DE SITUACIÓN ACADÉMICA:
 * - Aprobado:    promedio >= 7 (y no tiene ninguna materia < 4)
 * - Desaprobado: promedio < 5  (o tiene 2+ materias reprobadas)
 * - En proceso:  promedio entre 5 y 6.9
 * Si no tiene notas: "Sin calificaciones"
 */
function calcularSituacion(estudianteId) {
  const notas = estado.calificaciones.filter(c => c.estudianteId === estudianteId);
  if (notas.length === 0) return { situacion: 'Sin calificaciones', promedio: null };

  const promedio = notas.reduce((sum, c) => sum + Number(c.nota), 0) / notas.length;
  const reprobadas = notas.filter(c => Number(c.nota) < 6).length;

  let situacion;
  if (promedio >= 7 && reprobadas === 0) {
    situacion = 'Aprobado';
  } else if (promedio < 5 || reprobadas >= 2) {
    situacion = 'Desaprobado';
  } else {
    situacion = 'En proceso';
  }
  return { situacion, promedio: promedio.toFixed(1) };
}

function badgeClass(situacion) {
  if (situacion === 'Aprobado')    return 'badge-aprobado';
  if (situacion === 'Desaprobado') return 'badge-desaprobado';
  if (situacion === 'En proceso')  return 'badge-proceso';
  return 'badge-sin-notas';
}

function notaClass(nota) {
  if (nota == null) return 'nota-sin';
  if (nota >= 7)    return 'nota-alta';
  if (nota >= 5)    return 'nota-media';
  return 'nota-baja';
}

// ─── NAV ───────────────────────────────────────────────────

function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = btn.dataset.section;
      navigate(sec);
      // cerrar menú mobile
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function navigate(sec) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === sec));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === `section-${sec}`));
  const titles = { dashboard: 'Dashboard', estudiantes: 'Estudiantes', materias: 'Materias', calificaciones: 'Calificaciones', boletines: 'Boletines' };
  document.getElementById('topbar-title').textContent = titles[sec] || sec;
  if (sec === 'boletines') renderBoletines();
}

function setupMobileMenu() {
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

// ─── FORMS ─────────────────────────────────────────────────

function setupForms() {
  // Estudiante
  document.getElementById('form-estudiante').addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('est-nombre').value.trim();
    const curso  = document.getElementById('est-curso').value;
    if (!nombre || !curso) return toast('Completá todos los campos.', 'error');
    estado.estudiantes.push({ id: genId(), nombre, curso });
    guardarEnStorage();
    renderAll();
    e.target.reset();
    toast(`Estudiante "${nombre}" agregado.`);
  });

  // Materia
  document.getElementById('form-materia').addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('mat-nombre').value.trim();
    const area   = document.getElementById('mat-area').value;
    if (!nombre || !area) return toast('Completá todos los campos.', 'error');
    if (estado.materias.find(m => m.nombre.toLowerCase() === nombre.toLowerCase())) {
      return toast('Esa materia ya existe.', 'error');
    }
    estado.materias.push({ id: genId(), nombre, area });
    guardarEnStorage();
    renderAll();
    e.target.reset();
    toast(`Materia "${nombre}" agregada.`);
  });

  // Calificación
  document.getElementById('form-calificacion').addEventListener('submit', e => {
    e.preventDefault();
    const estudianteId = document.getElementById('cal-estudiante').value;
    const materiaId    = document.getElementById('cal-materia').value;
    const nota         = parseInt(document.getElementById('cal-nota').value);
    const periodo      = document.getElementById('cal-periodo').value;
    if (!estudianteId || !materiaId || isNaN(nota)) return toast('Completá todos los campos.', 'error');
    if (nota < 1 || nota > 10) return toast('La nota debe estar entre 1 y 10.', 'error');
    // Actualiza si ya existe la combinación estudiante+materia+periodo
    const idx = estado.calificaciones.findIndex(c => c.estudianteId === estudianteId && c.materiaId === materiaId && c.periodo === periodo);
    if (idx >= 0) {
      estado.calificaciones[idx].nota = nota;
      toast('Calificación actualizada.');
    } else {
      estado.calificaciones.push({ id: genId(), estudianteId, materiaId, nota, periodo });
      toast('Calificación registrada.');
    }
    guardarEnStorage();
    renderAll();
    document.getElementById('cal-nota').value = '';
  });

  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('¿Seguro? Se borrarán TODOS los datos guardados.')) return;
    localStorage.removeItem('sga_data');
    estado = { estudiantes: [], materias: [], calificaciones: [] };
    renderAll();
    toast('Datos reseteados.', 'error');
  });

  // Filtro boletines
  document.getElementById('btn-filtrar').addEventListener('click', renderBoletines);
}

// ─── RENDER ALL ────────────────────────────────────────────

function renderAll() {
  renderDashboard();
  renderTablaEstudiantes();
  renderTablaMaterias();
  renderTablaCalificaciones();
  actualizarSelectores();
  actualizarFiltros();
  actualizarTopbarCount();
}

// ─── DASHBOARD ─────────────────────────────────────────────

function renderDashboard() {
  const total = estado.estudiantes.length;
  document.getElementById('num-estudiantes').textContent = total;
  document.getElementById('num-materias').textContent = estado.materias.length;

  let aprobados = 0, proceso = 0, desaprobados = 0;
  estado.estudiantes.forEach(est => {
    const { situacion } = calcularSituacion(est.id);
    if (situacion === 'Aprobado')    aprobados++;
    else if (situacion === 'En proceso') proceso++;
    else if (situacion === 'Desaprobado') desaprobados++;
  });
  document.getElementById('num-aprobados').textContent = aprobados;
  document.getElementById('num-proceso').textContent   = proceso;
  document.getElementById('num-desaprobados').textContent = desaprobados;

  // Barras distribución
  const pct = (n) => total ? Math.round((n / total) * 100) : 0;
  const pA = pct(aprobados), pP = pct(proceso), pD = pct(desaprobados);
  document.getElementById('fill-aprobado').style.width  = pA + '%';
  document.getElementById('fill-proceso').style.width   = pP + '%';
  document.getElementById('fill-desaprobado').style.width = pD + '%';
  document.getElementById('pct-aprobado').textContent   = pA + '%';
  document.getElementById('pct-proceso').textContent    = pP + '%';
  document.getElementById('pct-desaprobado').textContent = pD + '%';

  // Últimas notas
  const container = document.getElementById('ultimas-notas');
  const ultimas = [...estado.calificaciones].slice(-6).reverse();
  if (ultimas.length === 0) {
    container.innerHTML = '<p class="empty-msg">Sin calificaciones aún.</p>';
  } else {
    container.innerHTML = ultimas.map(c => {
      const est = estado.estudiantes.find(e => e.id === c.estudianteId);
      const mat = estado.materias.find(m => m.id === c.materiaId);
      return `
        <div class="lista-item">
          <div class="lista-item-left">
            <div class="lista-item-name">${est ? est.nombre : '—'}</div>
            <div class="lista-item-meta">${mat ? mat.nombre : '—'} · ${c.periodo}</div>
          </div>
          <span class="nota-pill ${notaClass(c.nota)}">${c.nota}</span>
        </div>`;
    }).join('');
  }
}

// ─── TABLA ESTUDIANTES ──────────────────────────────────────

function renderTablaEstudiantes() {
  const cont = document.getElementById('tabla-estudiantes');
  document.getElementById('chip-est').textContent = estado.estudiantes.length;
  if (estado.estudiantes.length === 0) {
    cont.innerHTML = '<p class="empty-msg">Aún no hay estudiantes registrados.</p>';
    return;
  }
  cont.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Curso</th>
          <th>Situación</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${estado.estudiantes.map((est, i) => {
          const { situacion } = calcularSituacion(est.id);
          return `
            <tr>
              <td class="td-muted">${i + 1}</td>
              <td><strong>${est.nombre}</strong></td>
              <td class="td-muted">${est.curso}</td>
              <td><span class="boletin-badge ${badgeClass(situacion)}">${situacion}</span></td>
              <td>
                <button class="btn-icon" onclick="eliminarEstudiante('${est.id}')" title="Eliminar">✕</button>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function eliminarEstudiante(id) {
  if (!confirm('¿Eliminás al estudiante y todas sus calificaciones?')) return;
  estado.estudiantes = estado.estudiantes.filter(e => e.id !== id);
  estado.calificaciones = estado.calificaciones.filter(c => c.estudianteId !== id);
  guardarEnStorage();
  renderAll();
  toast('Estudiante eliminado.', 'error');
}

// ─── TABLA MATERIAS ────────────────────────────────────────

function renderTablaMaterias() {
  const cont = document.getElementById('tabla-materias');
  document.getElementById('chip-mat').textContent = estado.materias.length;
  if (estado.materias.length === 0) {
    cont.innerHTML = '<p class="empty-msg">Aún no hay materias registradas.</p>';
    return;
  }
  cont.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Materia</th>
          <th>Área</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${estado.materias.map((m, i) => `
          <tr>
            <td class="td-muted">${i + 1}</td>
            <td><strong>${m.nombre}</strong></td>
            <td class="td-muted">${m.area}</td>
            <td>
              <button class="btn-icon" onclick="eliminarMateria('${m.id}')" title="Eliminar">✕</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function eliminarMateria(id) {
  if (!confirm('¿Eliminás la materia y todas sus calificaciones?')) return;
  estado.materias = estado.materias.filter(m => m.id !== id);
  estado.calificaciones = estado.calificaciones.filter(c => c.materiaId !== id);
  guardarEnStorage();
  renderAll();
  toast('Materia eliminada.', 'error');
}

// ─── TABLA CALIFICACIONES ──────────────────────────────────

function renderTablaCalificaciones() {
  const cont = document.getElementById('tabla-calificaciones');
  document.getElementById('chip-cal').textContent = estado.calificaciones.length;
  if (estado.calificaciones.length === 0) {
    cont.innerHTML = '<p class="empty-msg">Aún no hay calificaciones.</p>';
    return;
  }
  const sorted = [...estado.calificaciones].reverse();
  cont.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Estudiante</th>
          <th>Materia</th>
          <th>Período</th>
          <th>Nota</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(c => {
          const est = estado.estudiantes.find(e => e.id === c.estudianteId);
          const mat = estado.materias.find(m => m.id === c.materiaId);
          return `
            <tr>
              <td>${est ? est.nombre : '<span class="td-muted">—</span>'}</td>
              <td class="td-muted">${mat ? mat.nombre : '—'}</td>
              <td class="td-muted">${c.periodo}</td>
              <td><span class="nota-pill ${notaClass(c.nota)}">${c.nota}</span></td>
              <td>
                <button class="btn-icon" onclick="eliminarCalificacion('${c.id}')" title="Eliminar">✕</button>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function eliminarCalificacion(id) {
  estado.calificaciones = estado.calificaciones.filter(c => c.id !== id);
  guardarEnStorage();
  renderAll();
  toast('Calificación eliminada.', 'error');
}

// ─── BOLETINES ─────────────────────────────────────────────

function renderBoletines() {
  const filtroCurso = document.getElementById('filtro-curso').value;
  const filtroSit   = document.getElementById('filtro-situacion').value;
  const cont        = document.getElementById('boletines-grid');

  let lista = [...estado.estudiantes];
  if (filtroCurso) lista = lista.filter(e => e.curso === filtroCurso);

  if (filtroSit) {
    lista = lista.filter(e => calcularSituacion(e.id).situacion === filtroSit);
  }

  if (lista.length === 0) {
    cont.innerHTML = '<p class="empty-msg">No hay estudiantes que coincidan con los filtros.</p>';
    return;
  }

  cont.innerHTML = lista.map(est => {
    const { situacion, promedio } = calcularSituacion(est.id);
    const notasEst = estado.calificaciones.filter(c => c.estudianteId === est.id);

    const filasMaterias = estado.materias.map(mat => {
      const notaObj = notasEst.filter(c => c.materiaId === mat.id);
      const ultimaNota = notaObj.length ? notaObj[notaObj.length - 1].nota : null;
      return `
        <div class="boletin-materia-row">
          <span>${mat.nombre}</span>
          <span class="nota-pill ${notaClass(ultimaNota)}">
            ${ultimaNota !== null ? ultimaNota : '—'}
          </span>
        </div>`;
    }).join('');

    return `
      <div class="boletin-card">
        <div class="boletin-head">
          <div>
            <div class="boletin-name">${est.nombre}</div>
            <div class="boletin-curso">${est.curso}</div>
          </div>
          <span class="boletin-badge ${badgeClass(situacion)}">${situacion}</span>
        </div>
        <div class="boletin-body">
          ${estado.materias.length > 0 ? filasMaterias : '<p class="empty-msg" style="padding:8px 0">Sin materias registradas.</p>'}
        </div>
        <div class="boletin-foot">
          <span>Promedio general</span>
          <span class="prom-val">${promedio !== null ? promedio : '—'}</span>
        </div>
      </div>`;
  }).join('');
}

// ─── SELECTORES ────────────────────────────────────────────

function actualizarSelectores() {
  // Select estudiantes (calificaciones)
  const selEst = document.getElementById('cal-estudiante');
  const prevEst = selEst.value;
  selEst.innerHTML = '<option value="">— Seleccioná —</option>' +
    estado.estudiantes.map(e => `<option value="${e.id}">${e.nombre} (${e.curso})</option>`).join('');
  if (prevEst) selEst.value = prevEst;

  // Select materias (calificaciones)
  const selMat = document.getElementById('cal-materia');
  const prevMat = selMat.value;
  selMat.innerHTML = '<option value="">— Seleccioná —</option>' +
    estado.materias.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
  if (prevMat) selMat.value = prevMat;
}

function actualizarFiltros() {
  const sel = document.getElementById('filtro-curso');
  const prev = sel.value;
  const cursos = [...new Set(estado.estudiantes.map(e => e.curso))].sort();
  sel.innerHTML = '<option value="">Todos los cursos</option>' +
    cursos.map(c => `<option value="${c}">${c}</option>`).join('');
  if (prev) sel.value = prev;
}

function actualizarTopbarCount() {
  document.getElementById('topbar-count').textContent =
    `${estado.estudiantes.length} estudiantes · ${estado.materias.length} materias`;
}

// ─── ARRANCAR ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);

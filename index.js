const express = require('express'), { Sequelize, DataTypes, Op } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

// Configuración de Base de Datos (Se mantiene igual para no afectar tus 258 filas)
const db = new Sequelize(process.env.DATABASE_URL, { 
  dialect: 'postgres', 
  logging: false, 
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
});

// Modelo Original - NO TOCAR PARA MANTENER COMPATIBILIDAD
const C = db.define('Carga', {
  oficina: DataTypes.STRING, emp_gen: DataTypes.STRING, comercial: DataTypes.STRING, pto: DataTypes.STRING,
  refleja: DataTypes.STRING, f_doc: DataTypes.STRING, h_doc: DataTypes.STRING, do_bl: DataTypes.STRING,
  cli: DataTypes.STRING, subc: DataTypes.STRING, mod: DataTypes.STRING, lcl: DataTypes.STRING,
  cont: DataTypes.STRING, peso: DataTypes.STRING, unid: DataTypes.STRING, prod: DataTypes.STRING,
  esq: DataTypes.STRING, vence: DataTypes.STRING, orig: DataTypes.STRING, dest: DataTypes.STRING,
  t_v: DataTypes.STRING, ped: DataTypes.STRING, f_c: DataTypes.STRING, h_c: DataTypes.STRING,
  f_d: DataTypes.STRING, h_d: DataTypes.STRING, placa: DataTypes.STRING, f_p: DataTypes.STRING,
  f_f: DataTypes.STRING, obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE INSTRUCCIONES' },
  f_act: DataTypes.STRING, obs: DataTypes.TEXT, cond: DataTypes.TEXT, h_t: DataTypes.STRING,
  muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING,
  est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
}, { timestamps: true });

const opts = {
  estados: ['ASIGNADO VEHÍCULO', 'PENDIENTE CITA ASIGNADO', 'VEHÍCULO CON CITA', 'CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 'CONTENEDOR EN INSPECCIÓN', 'CONTENEDOR RETIRADO PARA ITR', 'DESPACHADO', 'DESPACHADO CON NOVEDAD', 'EN CONSECUCIÓN', 'EN PROGRAMACIÓN', 'EN SITIO DE CARGUE', 'FINALIZADO CON NOVEDAD', 'FINALIZADO SIN NOVEDAD', 'HOJA DE VIDA EN ESTUDIO', 'MERCANCÍA EN INSPECCIÓN', 'NOVEDAD', 'PENDIENTE BAJAR A PATIO', 'PENDIENTE INSTRUCCIONES', 'PRE ASIGNADO', 'RETIRADO DE PUERTO PENDIENTE CONSOLIDADO', 'CANCELADO POR GERENCIA', 'VEHICULO EN RUTA'],
  despachadores: ['ABNNER MARTINEZ', 'CAMILO TRIANA', 'FREDY CARRILLO', 'RAUL LOPEZ', 'EDDIER RIVAS'],
  oficinas: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN']
};

const getNow = () => new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\//g, '-');

// --- ESTILOS VISUALES (SEMÁFOROS Y ALERTAS) ---
const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  .sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  table{border-collapse:collapse;min-width:4000px;font-size:10px;table-layout: fixed;}
  th{background:#1e40af;padding:10px;position:sticky;top:0;border-right:1px solid #3b82f6;}
  td{padding:8px;border:1px solid #334155;text-align:center;}
  .btn-stats{background:#4c1d95;color:white;padding:10px 15px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;}
  .btn-cancel-filter{background:#ef4444;color:white;border:none;padding:10px;border-radius:6px;cursor:pointer;font-weight:bold;}
  /* ALERTA DUPLICADOS: Solo visual, no afecta la DB */
  .duplicado-warning { background: #431407 !important; border: 2px solid #f97316 !important; color: #fb923c !important; font-weight: bold; }
  .fila-cancelada { background: rgba(239, 68, 68, 0.1); }
</style>`;

// --- VISTA PRINCIPAL ---
app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    
    // Lógica para detectar duplicados en los 258 registros actuales
    const contMap = {};
    d.forEach(x => { if(x.cont) contMap[x.cont] = (contMap[x.cont] || 0) + 1; });

    let rows = '';
    d.forEach((c, i) => {
      const esDuplicado = (c.cont && contMap[c.cont] > 1) ? 'duplicado-warning' : '';
      const esCancelado = c.obs_e.includes('CANCELADO') ? 'S' : 'N';
      
      rows += `<tr class="fila-datos ${esCancelado==='S'?'fila-cancelada':''}" data-cancelado="${esCancelado}">
        <td>${i+1}</td>
        <td style="font-weight:bold; color:#3b82f6">${c.id}</td>
        <td>${new Date(c.createdAt).toLocaleString('es-CO')}</td>
        <td>${c.oficina||''}</td>
        <td>${c.cli||''}</td>
        <td class="${esDuplicado}">${c.cont||''}</td>
        <td>${c.placa||''}</td>
        <td style="color:#fbbf24">${c.obs_e||''}</td>
        <td><b>${c.desp||''}</b></td>
        <td>${c.f_fin ? '✅' : '⏳'}</td>
        <td><a href="/d/${c.id}" onclick="return confirm('¿Borrar registro?')">🗑️</a></td>
      </tr>`;
    });

    res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>
      <h2 style="color:#3b82f6">CONTROL LOGÍSTICO - YEGO ECO T S.A.S</h2>
      <div style="display:flex; gap:15px; margin-bottom:20px;">
        <input type="text" id="busq" onkeyup="buscar()" placeholder="🔍 Buscar por contenedor, placa o ID..." style="padding:10px; width:300px; border-radius:5px;">
        <button class="btn-cancel-filter" onclick="toggleCancel()">⚠️ Filtrar Pérdida Emergente</button>
        <a href="/stats" class="btn-stats">📊 Ver Indicadores y Semáforos</a>
      </div>
      <div class="sc">
        <table>
          <thead><tr><th>#</th><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>CLIENTE</th><th>CONTENEDOR</th><th>PLACA</th><th>ESTADO ACTUAL</th><th>DESPACHADOR</th><th>FIN</th><th>ACC</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <script>
        function buscar(){
          let f = document.getElementById("busq").value.toUpperCase();
          document.querySelectorAll(".fila-datos").forEach(r => r.style.display = r.innerText.toUpperCase().includes(f) ? "" : "none");
        }
        let fCan = false;
        function toggleCancel(){
          fCan = !fCan;
          document.querySelectorAll(".fila-datos").forEach(r => {
            if(fCan) r.style.display = (r.dataset.cancelado === 'S' ? "" : "none");
            else r.style.display = "";
          });
        }
      </script></body></html>`);
  } catch (e) { res.send(e.message); }
});

// --- VISTA DE INDICADORES (KPI + SEMÁFOROS) ---
app.get('/stats', async (req, res) => {
  try {
    const cargas = await C.findAll();
    const hoyStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    const mesActual = hoyStr.substring(0, 7);

    // Cálculos de Pérdida (Diario vs Mensual)
    const perdidosTotal = cargas.filter(c => c.obs_e.includes('CANCELADO'));
    const pDiaria = perdidosTotal.filter(c => new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }) === hoyStr).length;
    const pMensual = perdidosTotal.filter(c => new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }).startsWith(mesActual)).length;

    // Semáforo de Productividad por Despachador
    const prod = {};
    cargas.forEach(c => {
      const d = c.desp || 'SIN ASIGNAR';
      const fCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      if(!prod[d]) prod[d] = { hoy:0, mes:0 };
      if(fCrea === hoyStr) prod[d].hoy++;
      if(fCrea.startsWith(mesActual)) prod[d].mes++;
    });

    res.send(`<html><head><meta charset="UTF-8"><style>
      body{background:#0f172a; color:#fff; font-family:sans-serif; padding:25px;}
      .grid{display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:40px;}
      .card{background:#1e293b; padding:25px; border-radius:15px; text-align:center; border:1px solid #334155;}
      .card h2{font-size:45px; margin:10px 0; color:#3b82f6;}
      .card.danger{border-left: 8px solid #ef4444;}
      table{width:100%; border-collapse:collapse; background:#1e293b;}
      th,td{padding:15px; border:1px solid #334155; text-align:center;}
      /* COLORES DEL SEMÁFORO */
      .semaforo-verde{ background: rgba(16, 185, 129, 0.2); color: #34d399; font-weight:bold; }
      .semaforo-rojo{ background: rgba(239, 68, 68, 0.2); color: #f87171; font-weight:bold; }
      .semaforo-amarillo{ background: rgba(251, 191, 36, 0.2); color: #fbbf24; font-weight:bold; }
    </style></head>
    <body>
      <a href="/" style="color:#3b82f6; text-decoration:none;">← Volver al Panel Principal</a>
      <h1>TABLERO DE INDICADORES (KPI)</h1>
      
      <div class="grid">
        <div class="card"><h3>Total Histórico</h3><h2>${cargas.length}</h2><small>Filas en base</small></div>
        <div class="card danger"><h3>Pérdida (DIARIO)</h3><h2 style="color:#ef4444">${pDiaria}</h2></div>
        <div class="card danger" style="border-left-color:#f87171"><h3>Pérdida (MENSUAL)</h3><h2 style="color:#f87171">${pMensual}</h2></div>
      </div>

      <h3>SEMÁFORO DE PRODUCTIVIDAD POR DESPACHADOR</h3>
      <table>
        <thead><tr><th>DESPACHADOR</th><th>HOY</th><th>MES</th><th>ESTADO</th></tr></thead>
        <tbody>
          ${Object.entries(prod).map(([name, s]) => {
            let clase = 'semaforo-amarillo', estado = '🟡 PROCESANDO';
            if(s.hoy >= 5) { clase = 'semaforo-verde'; estado = '🟢 ALTO RENDIMIENTO'; }
            if(s.hoy === 0) { clase = 'semaforo-rojo'; estado = '🔴 SIN DESPACHOS HOY'; }
            return `<tr class="${clase}"><td><b>${name}</b></td><td>${s.hoy}</td><td>${s.mes}</td><td>${estado}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </body></html>`);
  } catch (e) { res.send(e.message); }
});

// Rutas de acción (Sin cambios para no afectar la DB)
app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });

// Sincronización Segura
db.sync({ alter: false }).then(() => app.listen(process.env.PORT || 3000));

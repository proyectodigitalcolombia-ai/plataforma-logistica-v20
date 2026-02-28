const express = require('express'), { Sequelize, DataTypes } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

const C = db.define('Carga', {
  oficina: DataTypes.STRING, emp_gen: DataTypes.STRING, comercial: DataTypes.STRING, pto: DataTypes.STRING,
  refleja: DataTypes.STRING, f_doc: DataTypes.STRING, h_doc: DataTypes.STRING, do_bl: DataTypes.STRING,
  cli: DataTypes.STRING, subc: DataTypes.STRING, mod: DataTypes.STRING, lcl: DataTypes.STRING,
  cont: DataTypes.STRING, peso: DataTypes.STRING, unid: DataTypes.STRING, prod: DataTypes.STRING,
  esq: DataTypes.STRING, vence: DataTypes.STRING, orig: DataTypes.STRING, dest: DataTypes.STRING,
  t_v: DataTypes.STRING, ped: DataTypes.STRING, f_c: DataTypes.STRING, h_c: DataTypes.STRING,
  f_d: DataTypes.STRING, h_d: DataTypes.STRING, placa: DataTypes.STRING, f_p: DataTypes.STRING,
  f_f: DataTypes.STRING, obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  f_act: DataTypes.STRING, obs: DataTypes.TEXT, cond: DataTypes.TEXT, h_t: DataTypes.STRING,
  muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING,
  est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
});

const opts = {
  estados: ['ASIGNADO VEHÍCULO', 'PENDIENTE CITA', 'DESPACHADO', 'FINALIZADO SIN NOVEDAD', 'CANCELADO', 'VEHICULO EN RUTA'],
  ciudades: ['BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUENAVENTURA']
};

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  .sc-container{max-height:70vh;overflow:auto;border:1px solid #334155;border-radius:8px}
  table{border-collapse:separate;border-spacing:0;min-width:4000px;font-size:10px}
  th{background:#1e40af;padding:12px;position:sticky;top:0;z-index:10;border:1px solid #3b82f6}
  td{padding:8px;border:1px solid #334155;text-align:center;background:#1e293b}
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;background:#1e293b;padding:15px;margin-bottom:20px;border-radius:8px}
  .st-real{padding:4px 8px;border-radius:10px;font-weight:bold}
  .st-desp{background:#065f46;color:#34d399} .st-fin{background:#1e40af;color:#93c5fd}
  .btn-fin{background:#10b981;color:#fff;padding:5px;text-decoration:none;border-radius:4px;font-weight:bold}
  .warn{color:#f87171;font-weight:bold}
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => {
    const isLocked = c.f_fin ? 'disabled' : '';
    const stCls = c.est_real==='DESPACHADO'?'st-desp':(c.est_real==='FINALIZADO'?'st-fin':'');
    const btn = c.f_fin ? `<b>✓</b>` : (c.placa ? `<a href="/finish/${c.id}" class="btn-fin">🏁 FINALIZAR</a>` : `<span class="warn">REQ. PLACA</span>`);
    return `<tr><td>${c.id}</td><td>${c.cli||''}</td><td>${c.cont||''}</td><td><form action="/u/${c.id}" method="POST"><input name="placa" value="${c.placa||''}" ${isLocked} style="width:60px"><button ${isLocked}>OK</button></form></td><td><span class="st-real ${stCls}">${c.est_real}</span></td><td>${c.obs_e}</td><td>${btn}</td><td>${c.f_fin||'--'}</td></tr>`;
  }).join('');
  res.send(`<html><head><meta charset="UTF-8">${css}</head><body>
    <h2>LOGIS V20 - CONTROL REAL</h2>
    <form action="/add" method="POST" class="form">
      <input name="cli" placeholder="Cliente"> <input name="cont" placeholder="Contenedor">
      <button style="grid-column:1/-1">REGISTRAR</button>
    </form>
    <div class="sc-container">
      <table>
        <thead><tr><th>ID</th><th>CLIENTE</th><th>CONTENEDOR</th><th>PLACA</th><th>ESTADO REAL</th><th>LOGÍSTICA</th><th>ACCION</th><th>FECHA FIN</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </body></html>`);
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { 
  await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO' }, { where: { id: req.params.id } }); 
  res.redirect('/'); 
});
app.get('/finish/:id', async (req, res) => {
  const c = await C.findByPk(req.params.id);
  if(c.placa) await C.update({ f_fin: new Date().toLocaleString(), est_real: 'FINALIZADO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

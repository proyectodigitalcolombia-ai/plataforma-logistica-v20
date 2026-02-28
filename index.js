const express = require('express'), { Sequelize, DataTypes } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
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
  ofic: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  est: ['ASIGNADO VEHÍCULO', 'PENDIENTE CITA', 'VEHÍCULO CON CITA', 'DESPACHADO', 'FINALIZADO SIN NOVEDAD', 'CANCELADO', 'VEHICULO EN RUTA']
};

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  /* ESTO INMOVILIZA EL ENCABEZADO */
  .sc-container{height:70vh;overflow:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  table{border-collapse:separate;border-spacing:0;min-width:6000px;font-size:10px}
  th{background:#1e40af !important;color:white;padding:15px;position:sticky;top:0;z-index:100;border-bottom:2px solid #3b82f6;border-right:1px solid #334155}
  td{padding:10px;border-bottom:1px solid #334155;border-right:1px solid #334155;text-align:center;background:#1e293b}
  /* FORMULARIO */
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:4px}
  label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
  input,select{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000}
  .btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:15px;cursor:pointer;border:none;font-weight:700;border-radius:6px}
  /* ESTADOS REALES */
  .st-real{padding:5px 10px;border-radius:20px;font-weight:bold;font-size:9px}
  .st-desp{background:#065f46;color:#34d399} .st-fin{background:#1e40af;color:#93c5fd}
  .btn-fin{background:#10b981;color:white;padding:5px 10px;border-radius:4px;text-decoration:none;font-weight:bold}
  .warn{color:#f87171;font-weight:bold}
</style>`;

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    const rows = d.map(c => {
      const isLocked = c.f_fin ? 'disabled' : '';
      const stCls = c.est_real==='DESPACHADO'?'st-desp':(c.est_real==='FINALIZADO'?'st-fin':'');
      const btn = c.f_fin ? `<b style="color:#10b981">✓</b>` : (c.placa ? `<a href="/finish/${c.id}" class="btn-fin">🏁 FINALIZAR</a>` : `<span class="warn">⚠️ REQ. PLACA</span>`);
      
      return `<tr><td><b>${c.id}</b></td><td>${c.oficina||''}</td><td>${c.cli||''}</td><td>${c.cont||''}</td><td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:2px"><input name="placa" value="${c.placa||''}" ${isLocked} style="width:70px" oninput="this.value=this.value.toUpperCase()"><button ${isLocked}>OK</button></form></td><td><span class="st-real ${stCls}">${c.est_real}</span></td><td>${c.obs_e||''}</td><td>${btn}</td><td>${c.f_fin||'--:--'}</td><td><a href="/d/${c.id}" style="color:#f87171">X</a></td></tr>`;
    }).join('');

    res.send(`<html><head><meta charset="UTF-8">${css}</head><body>
      <h2>SISTEMA LOGÍSTICO V20</h2>
      <form action="/add" method="POST" class="form">
        <div class="fg"><label>Oficina</label><select name="oficina">${opts.ofic.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Cliente</label><input name="cli"></div>
        <div class="fg"><label>Contenedor</label><input name="cont"></div>
        <button class="btn">💾 REGISTRAR</button>
      </form>
      <div class="sc-container">
        <table>
          <thead>
            <tr>
              <th>ITEM</th><th>OFICINA</th><th>CLIENTE</th><th>CONTENEDOR</th><th>PLACA</th><th>ESTADO REAL</th><th>LOGÍSTICA</th><th>ACCIÓN</th><th>FINALIZACIÓN</th><th>DEL</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </body></html>`);
  } catch (e) { res.send(e.message); }
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { 
  await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO' }, { where: { id: req.params.id } }); 
  res.redirect('/'); 
});
app.get('/finish/:id', async (req, res) => {
  const c = await C.findByPk(req.params.id);
  if (c.placa) {
    const ahora = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    await C.update({ f_fin: ahora, est_real: 'FINALIZADO' }, { where: { id: req.params.id } });
  }
  res.redirect('/');
});

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

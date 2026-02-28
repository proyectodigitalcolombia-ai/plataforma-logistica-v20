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
  of: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  ps: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO BAHÍA', 'N/A'],
  cl: ['GEODIS', 'MAERSK', 'SAMSUNG SDS', 'ENVAECOL', 'YARA', 'ESENTTIA', 'BRINSA', 'TENARIS', 'CORONA']
};

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:15px}
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:15px;background:#1e293b;padding:15px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column} label{font-size:8px;color:#94a3b8;font-weight:700}
  input,select{padding:5px;border-radius:4px;border:none;font-size:10px}
  .sc-container{height:60vh;overflow:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  table{border-collapse:separate;border-spacing:0;min-width:5000px}
  /* INMOVILIZAR ENCABEZADO */
  thead th{position:sticky;top:0;background:#1e40af;z-index:10;padding:12px;font-size:10px;border-bottom:2px solid #3b82f6;border-right:1px solid #334155}
  td{padding:8px;border-bottom:1px solid #334155;border-right:1px solid #334155;text-align:center;font-size:10px;background:#1e293b}
  .st-real{padding:3px 8px;border-radius:10px;font-weight:bold}
  .st-desp{background:#065f46;color:#34d399} .st-fin{background:#1e40af;color:#93c5fd}
  .btn-fin{background:#10b981;color:white;padding:4px;border-radius:4px;text-decoration:none;font-weight:bold}
  .warn{color:#f87171;font-weight:bold}
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => {
    const isL = c.f_fin ? 'disabled' : '';
    const stC = c.est_real === 'DESPACHADO' ? 'st-desp' : (c.est_real === 'FINALIZADO' ? 'st-fin' : '');
    const acc = c.f_fin ? `<b>✓</b>` : (c.placa ? `<a href="/finish/${c.id}" class="btn-fin">FINALIZAR</a>` : `<span class="warn">REQ. PLACA</span>`);
    return `<tr><td>${c.id}</td><td>${c.oficina||''}</td><td>${c.pto||''}</td><td>${c.cli||''}</td><td>${c.cont||''}</td><td>${c.prod||''}</td>
    <td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:2px"><input name="placa" value="${c.placa||''}" ${isL} style="width:60px" oninput="this.value=this.value.toUpperCase()"><button ${isL}>OK</button></form></td>
    <td><span class="st-real ${stC}">${c.est_real}</span></td><td>${c.obs_e||''}</td><td>${acc}</td><td>${c.f_fin||'--'}</td><td><a href="/d/${c.id}" style="color:#f87171">X</a></td></tr>`;
  }).join('');
  res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>
    <h3 style="color:#3b82f6">CONTROL DE CARGAS V20</h3>
    <form action="/add" method="POST" class="form">
      <div class="fg"><label>Oficina</label><select name="oficina">${opts.of.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Puerto</label><select name="pto">${opts.ps.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Cliente</label><select name="cli">${opts.cl.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><label>Producto</label><input name="prod"></div>
      <button style="grid-column:1/-1;background:#2563eb;color:#fff;padding:10px;border:none;border-radius:5px;cursor:pointer">💾 REGISTRAR</button>
    </form>
    <div class="sc-container"><table><thead><tr><th>ID</th><th>OFICINA</th><th>PUERTO</th><th>CLIENTE</th><th>CONTENEDOR</th><th>PRODUCTO</th><th>PLACA</th><th>ESTADO REAL</th><th>LOGÍSTICA</th><th>ACCIÓN</th><th>FECHA FIN</th><th>DEL</th></tr></thead><tbody>${rows}</tbody></table></div>
  </body></html>`);
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO' }, { where: { id: req.params.id } }); res.redirect('/'); });
app.get('/finish/:id', async (req, res) => {
  const c = await C.findByPk(req.params.id);
  if(c && c.placa) await C.update({ f_fin: new Date().toLocaleString(), est_real: 'FINALIZADO', obs_e: 'FINALIZADO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

db.sync({alter:true}).then(()=>app.listen(process.env.PORT||3000));

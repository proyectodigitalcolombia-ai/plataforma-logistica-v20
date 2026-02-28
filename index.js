const express = require('express'),
  { Sequelize, DataTypes } = require('sequelize'),
  app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
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
  muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING
}, { timestamps: true });

const opts = {
  oficina: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  comerciales: ['RAÚL LÓPEZ'],
  puertos: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC'],
  clientes: ['GEODIS', 'MAERSK', 'SAMSUNG SDS', 'ENVAECOL', 'YARA'],
  modalidades: ['NACIONALIZADO', 'OTM', 'DTA', 'TRASLADO'],
  lcl_fcl: ['CARGA SUELTA', 'CONTENEDOR 40', 'CONTENEDOR 20'],
  esquemas: ['1 ESCOLTA - SELLO', 'SELLO', 'NO REQUIERE'],
  vehiculos: ['TURBO', 'SENCILLO', 'PATINETA', 'TRACTOMULA'],
  ciudades: ['BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUENAVENTURA'],
  estados: ['ASIGNADO', 'CANCELADO', 'DESPACHADO', 'EN PROGRAMACIÓN', 'PENDIENTE'],
  despachadores: ['ZULEIMA RIASCOS', 'ABNNER MARTINEZ', 'OSCAR CHACON']
};

const css = `<style>body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}.sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}table{border-collapse:collapse;min-width:4000px;font-size:10px}th{background:#1e40af;padding:12px;text-align:left;position:sticky;top:0;white-space:nowrap}td{padding:8px;border:1px solid #334155;white-space:nowrap}.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:20px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700;display:flex;flex-direction:column;gap:4px}input,select{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000}.btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:15px;cursor:pointer;border:none;font-weight:700;border-radius:6px}</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => `<tr><td><b>${c.id}</b></td><td>${new Date(c.createdAt).toLocaleString()}</td><td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td><td>${c.cont||''}</td><td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td><td>${c.vence||''}</td><td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td><td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td><td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:3px"><input name="placa" value="${c.placa||''}" style="width:70px" oninput="this.value=this.value.toUpperCase()"><button style="background:#10b981;color:white;border:none;padding:4px;border-radius:3px">OK</button></form></td><td>${c.f_p||''}</td><td>${c.f_f||''}</td><td><span style="background:#475569;padding:4px;border-radius:4px">${c.obs_e||'PENDIENTE'}</span></td><td>${c.f_act||''}</td><td>${c.obs||''}</td><td>${c.cond||''}</td><td>${c.h_t||''}</td><td>${c.muc||''}</td><td>${c.desp||''}</td><td>${c.f_fin||''}</td><td><a href="/d/${c.id}" style="color:#f87171" onclick="return confirm('¿Borrar?')">X</a></td></tr>`).join('');
  res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>
    <h2 style="color:#3b82f6">SISTEMA LOGÍSTICO V20</h2>
    <form action="/add" method="POST" class="form">
      <label>Oficina<select name="oficina">${opts.oficina.map(o => `<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Empresa Generadora<select name="emp_gen"><option>YEGO ECO-T SAS</option></select></label>
      <label>Comercial<select name="comercial">${opts.comerciales.map(o => `<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Pto Cargue<select name="pto">${opts.puertos.map(o => `<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>F.Doc<input name="f_doc" type="date"></label>
      <label>DO/BL/OC<input name="do_bl"></label>
      <label>Cliente<select name="cli">${opts.clientes.map(o => `<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Estado<select name="obs_e">${opts.estados.map(o => `<option value="${o}" ${o==='PENDIENTE'?'selected':''}>${o}</option>`).join('')}</select></label>
      <label>Placa<input name="placa" oninput="this.value=this.value.toUpperCase()"></label>
      <button class="btn">💾 REGISTRAR NUEVA CARGA</button>
    </form>
    <div class="sc"><table><thead><tr><th>ITEM</th><th>REGISTRO</th><th>OFICINA</th><th>GENERADORA</th><th>COMERCIAL</th><th>PUERTO</th><th>REFLEJA</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL/OC</th><th>CLIENTE</th><th>SUBCLIENTE</th><th>MOD</th><th>LCL</th><th>N.CONT</th><th>PESO</th><th>UNID</th><th>PROD</th><th>SEG</th><th>VENCE</th><th>ORIG</th><th>DEST</th><th>T.VEH</th><th>PED</th><th>F.CAR</th><th>H.CAR</th><th>F.DESC</th><th>H.DESC</th><th>PLACA</th><th>F.PAG</th><th>F.FAC</th><th>ESTADO</th><th>ACT.EST</th><th>OBS</th><th>COND</th><th>HORA</th><th>MUC</th><th>DESP</th><th>FIN</th><th>DEL</th></tr></thead><tbody>${rows}</tbody></table></div>
  </body></html>`);
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase() }, { where: { id: req.params.id } }); res.redirect('/'); });

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

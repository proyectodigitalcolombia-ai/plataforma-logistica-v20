const express = require('express'), { Sequelize, DataTypes } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());
const db = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } });

const C = db.define('Carga', {
  oficina: DataTypes.STRING, emp_gen: DataTypes.STRING, comercial: DataTypes.STRING, pto: DataTypes.STRING, refleja: DataTypes.STRING, f_doc: DataTypes.STRING, h_doc: DataTypes.STRING, do_bl: DataTypes.STRING, cli: DataTypes.STRING, subc: DataTypes.STRING, mod: DataTypes.STRING, lcl: DataTypes.STRING, cont: DataTypes.STRING, peso: DataTypes.STRING, unid: DataTypes.STRING, prod: DataTypes.STRING, esq: DataTypes.STRING, vence: DataTypes.STRING, orig: DataTypes.STRING, dest: DataTypes.STRING, t_v: DataTypes.STRING, ped: DataTypes.STRING, f_c: DataTypes.STRING, h_c: DataTypes.STRING, f_d: DataTypes.STRING, h_d: DataTypes.STRING, placa: DataTypes.STRING, f_p: DataTypes.STRING, f_f: DataTypes.STRING, obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }, f_act: DataTypes.STRING, obs: DataTypes.TEXT, cond: DataTypes.TEXT, h_t: DataTypes.STRING, muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING, est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
});

const opts = {
  of: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  ps: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO BAHÍA', 'N/A'],
  cl: ['GEODIS', 'MAERSK', 'SAMSUNG SDS', 'ENVAECOL', 'YARA', 'ESENTTIA', 'BRINSA', 'ACERIAS PAZ DEL RIO', 'TENARIS', 'CORONA', 'ALIMENTOS POLAR', 'FAJOBE'],
  md: ['NACIONALIZADO', 'OTM', 'DTA', 'TRASLADO', 'ITR', 'VACÍO'],
  lc: ['CARGA SUELTA', 'CONT 40', 'CONT 20', 'REFER 40', 'REFER 20'],
  eq: ['1 ESCOLTA - SELLO', 'SELLO', 'NO REQUIERE', '2 ESCOLTAS'],
  vh: ['TURBO', 'SENCILLO', 'PATINETA', 'TRACTOMULA 3S2', 'TRACTOMULA 3S3', 'CAMA BAJA']
};

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:15px}
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:15px;background:#1e293b;padding:15px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column} label{font-size:8px;color:#94a3b8;font-weight:700;text-transform:uppercase}
  input,select{padding:5px;border-radius:4px;border:none;font-size:10px}
  .sc-container{height:60vh;overflow:auto;background:#1e293b;border:1px solid #334155;border-radius:8px;position:relative}
  table{border-collapse:separate;border-spacing:0;min-width:7000px}
  thead th{position:sticky;top:0;background:#1e40af !important;z-index:50;padding:12px;font-size:10px;border-bottom:2px solid #3b82f6;border-right:1px solid #334155;color:white}
  td{padding:8px;border-bottom:1px solid #334155;border-right:1px solid #334155;text-align:center;font-size:10px;background:#1e293b}
  .st-real{padding:3px 8px;border-radius:10px;font-weight:bold}
  .st-desp{background:#065f46;color:#34d399} .st-fin{background:#1e40af;color:#93c5fd}
  .btn-fin{background:#10b981;color:white;padding:4px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:9px}
  .warn{color:#f87171;font-weight:bold;font-size:9px}
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => {
    const isL = c.f_fin ? 'disabled' : '';
    const stC = c.est_real === 'DESPACHADO' ? 'st-desp' : (c.est_real === 'FINALIZADO' ? 'st-fin' : '');
    const acc = c.f_fin ? `<b>✓</b>` : (c.placa ? `<a href="/finish/${c.id}" class="btn-fin">FINALIZAR</a>` : `<span class="warn">REQ. PLACA</span>`);
    return `<tr><td>${c.id}</td><td>${c.oficina}</td><td>${c.emp_gen}</td><td>${c.comercial}</td><td>${c.pto}</td><td>${c.refleja}</td><td>${c.f_doc}</td><td>${c.h_doc}</td><td>${c.do_bl}</td><td>${c.cli}</td><td>${c.subc}</td><td>${c.mod}</td><td>${c.lcl}</td><td>${c.cont}</td><td>${c.peso}</td><td>${c.unid}</td><td>${c.prod}</td><td>${c.esq}</td><td>${c.vence}</td><td>${c.orig}</td><td>${c.dest}</td><td>${c.t_v}</td><td>${c.ped}</td><td>${c.f_c}</td><td>${c.h_c}</td><td>${c.f_d}</td><td>${c.h_d}</td><td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:2px"><input name="placa" value="${c.placa||''}" ${isL} style="width:60px" oninput="this.value=this.value.toUpperCase()"><button ${isL}>OK</button></form></td><td>${c.f_p}</td><td>${c.f_f}</td><td>${c.obs_e}</td><td>${c.f_act}</td><td><span class="st-real ${stC}">${c.est_real}</span></td><td>${c.obs}</td><td>${c.cond}</td><td>${c.h_t}</td><td>${c.muc}</td><td>${c.desp}</td><td>${acc}</td><td>${c.f_fin||'--'}</td><td><a href="/d/${c.id}" style="color:#f87171">X</a></td></tr>`;
  }).join('');

  res.send(`<html><head><meta charset="UTF-8"><title>V20</title>${css}</head><body>
    <h3 style="color:#3b82f6;margin:0 0 10px 0">SISTEMA DE CARGAS V20</h3>
    <form action="/add" method="POST" class="form">
      <div class="fg"><label>Oficina</label><select name="oficina">${opts.of.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Empresa</label><input name="emp_gen" value="YEGO ECO-T SAS"></div>
      <div class="fg"><label>Comercial</label><input name="comercial" value="RAÚL LÓPEZ"></div>
      <div class="fg"><label>Puerto</label><select name="pto">${opts.ps.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Refleja</label><select name="refleja"><option>SI</option><option>NO</option></select></div>
      <div class="fg"><label>F.Doc</label><input name="f_doc" type="date"></div>
      <div class="fg"><label>H.Doc</label><input name="h_doc" type="time"></div>
      <div class="fg"><label>DO/BL/OC</label><input name="do_bl"></div>
      <div class="fg"><label>Cliente</label><select name="cli">${opts.cl.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Subcliente</label><input name="subc"></div>
      <div class="fg"><label>Mod</label><select name="mod">${opts.md.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>LCL/FCL</label><select name="lcl">${opts.lc.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><label>Peso</label><input name="peso"></div>
      <div class="fg"><label>Unid</label><input name="unid"></div>
      <div class="fg"><label>Prod</label><input name="prod"></div>
      <div class="fg"><label>Esq</label><select name="esq">${opts.eq.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Vence</label><input name="vence" type="date"></div>
      <div class="fg"><label>Orig</label><input name="orig"></div>
      <div class="fg"><label>Dest</label><input name="dest"></div>
      <div class="fg"><label>T.Veh</label><select name="t_v">${opts.vh.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Ped</label><input name="ped"></div>
      <div class="fg"><label>F.Carg</label><input name="f_c" type="date"></div>
      <div class="fg"><label>H.Carg</label><input name="h_c" type="time"></div>
      <div class="fg"><label>F.Desc</label><input name="f_d" type="date"></div>
      <div class="fg"><label>H.Desc</label><input name="h_d" type="time"></div>
      <div class="fg"><label>F.Pag</label><input name="f_p"></div>
      <div class="fg"><label>F.Fact</label><input name="f_f"></div>
      <div class="fg"><label>Obs Log</label><input name="obs_e"></div>
      <div class="fg"><label>Obs Gen</label><input name="obs"></div>
      <div class="fg"><label>Cond</label><input name="cond"></div>
      <div class="fg"><label>Hora</label><input name="h_t"></div>
      <div class="fg"><label>MUC</label><input name="muc"></div>
      <div class="fg"><label>Desp</label><input name="desp"></div>
      <button style="grid-column:1/-1;background:#2563eb;color:#fff;padding:12px;border:none;border-radius:5px;cursor:pointer;font-weight:bold">💾 REGISTRAR CARGA COMPLETA</button>
    </form>
    <div class="sc-container"><table><thead><tr><th>ID</th><th>OFIC</th><th>EMP</th><th>COM</th><th>PTO</th><th>REF</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLI</th><th>SUB</th><th>MOD</th><th>LCL</th><th>CONT</th><th>PESO</th><th>UNI</th><th>PROD</th><th>ESQ</th><th>VEN</th><th>ORI</th><th>DES</th><th>VEH</th><th>PED</th><th>F.C</th><th>H.C</th><th>F.D</th><th>H.D</th><th>PLACA</th><th>F.PAG</th><th>F.FAC</th><th>LOGIS</th><th>ACT</th><th>EST.REAL</th><th>OBS</th><th>COND</th><th>HORA</th><th>MUC</th><th>DESP</th><th>ACC</th><th>FIN</th><th>X</th></tr></thead><tbody>${rows}</tbody></table></div>
  </body></html>`);
});

app.post('/add',async(req,res)=>{await C.create(req.body);res.redirect('/');});
app.get('/d/:id',async(req,res)=>{await C.destroy({where:{id:req.params.id}});res.redirect('/');});
app.post('/u/:id',async(req,res)=>{await C.update({placa:req.body.placa.toUpperCase(),est_real:'DESPACHADO'},{where:{id:req.params.id}});res.redirect('/');});
app.get('/finish/:id',async(req,res)=>{const c=await C.findByPk(req.params.id);if(c&&c.placa)await C.update({f_fin:new Date().toLocaleString('es-CO'),est_real:'FINALIZADO'},{where:{id:req.params.id}});res.redirect('/');});
db.sync({alter:true}).then(()=>app.listen(process.env.PORT||3000));

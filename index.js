const express = require('express'), { Sequelize, DataTypes } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());
const db = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } });

const C = db.define('Carga', {
  oficina: DataTypes.STRING, emp_gen: DataTypes.STRING, comercial: DataTypes.STRING, pto: DataTypes.STRING, refleja: DataTypes.STRING, f_doc: DataTypes.STRING, h_doc: DataTypes.STRING, do_bl: DataTypes.STRING, cli: DataTypes.STRING, subc: DataTypes.STRING, mod: DataTypes.STRING, lcl: DataTypes.STRING, cont: DataTypes.STRING, peso: DataTypes.STRING, unid: DataTypes.STRING, prod: DataTypes.STRING, esq: DataTypes.STRING, vence: DataTypes.STRING, orig: DataTypes.STRING, dest: DataTypes.STRING, t_v: DataTypes.STRING, ped: DataTypes.STRING, f_c: DataTypes.STRING, h_c: DataTypes.STRING, f_d: DataTypes.STRING, h_d: DataTypes.STRING, placa: DataTypes.STRING, f_p: DataTypes.STRING, f_f: DataTypes.STRING, obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }, f_act: DataTypes.STRING, obs: DataTypes.TEXT, cond: DataTypes.TEXT, h_t: DataTypes.STRING, muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING, est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
}, { timestamps: true });

const opts = {
  oficina: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  puertos: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO COMPAS CCTO', 'PUERTO BAHÍA', 'S.P.R.C', 'SPIA - AGUADULCE', 'ESENTTIA KM 8', 'YARA MAMONAL', 'N/A'],
  clientes: ['GEODIS', 'MAERSK', 'SAMSUNG SDS', 'ENVAECOL', 'SEA CARGO', 'YARA', 'ESENTTIA', 'BRINSA', 'PAZ DEL RIO', 'TERNIUM', 'PLASTICOS ESP', 'MAYAGUEZ', 'TENARIS', 'LUKER', 'CORONA', 'NOMOS', 'POLAR', 'PLEXA', 'FAJOBE'],
  modalidades: ['NACIONALIZADO', 'OTM', 'DTA', 'TRASLADO', 'ITR', 'VACÍO'],
  lcl_fcl: ['CARGA SUELTA', 'CONT 40', 'CONT 20', 'REFER 40', 'REFER 20', 'FLAT RACK'],
  esquemas: ['1 ESCOLTA', '2 ESCOLTAS', 'SELLO', 'NO REQUIERE', 'INSPECTORES'],
  vehiculos: ['TURBO', 'SENCILLO', 'PATINETA', 'TRACTOMULA', 'CAMA BAJA', 'DOBLE TROQUE'],
  ciudades: ['BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUENAVENTURA', 'SIBERIA', 'FUNZA', 'MOSQUERA', 'TOCANCIPÁ'],
  subclientes: ['HIKVISION', 'PAYLESS', 'DONSSON', 'SAMSUNG', 'ÉXITO', 'ALKOSTO', 'FALABELLA', 'SODIMAC', 'ENVAECOL', 'ALPLA', 'AMCOR', 'MEXICHEM', 'D1', 'TERNIUM', 'BRINSA', 'TENARIS', 'CORONA', 'FAJOBE'],
  estados: ['ASIGNADO', 'PENDIENTE CITA', 'CON CITA', 'CANCELADO', 'INSPECCION', 'DESPACHADO', 'EN RUTA', 'FINALIZADO'],
  despachadores: ['ABNNER M.', 'CAMILO T.', 'FREDY C.', 'RAUL L.', 'EDDIER R.']
};

const css = `<style>body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}.sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}table{border-collapse:collapse;width:max-content;font-size:10px}th{background:#1e40af;padding:10px;position:sticky;top:0;white-space:nowrap;border-right:1px solid #3b82f6}td{padding:8px;border:1px solid #334155;white-space:nowrap;text-align:center}.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:20px;background:#1e293b;padding:15px;border-radius:8px}.fg{display:flex;flex-direction:column;gap:2px}label{font-size:9px;color:#94a3b8;font-weight:700}input,select{padding:6px;border-radius:4px;border:none;font-size:11px}.btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:12px;cursor:pointer;border:none;font-weight:700;border-radius:6px}.btn-xl{background:#10b981;color:white;padding:10px;border-radius:6px;cursor:pointer;border:none;font-weight:bold;margin:10px 0}#search{padding:10px;width:250px;border-radius:6px;border:none;margin-bottom:10px}</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => `<tr><td>${c.id}</td><td>${c.oficina}</td><td>${c.pto}</td><td>${c.do_bl}</td><td>${c.cli}</td><td>${c.subc}</td><td>${c.cont}</td><td>${c.prod}</td><td>${c.orig}</td><td>${c.dest}</td><td><form action="/u/${c.id}" method="POST" style="margin:0"><input name="placa" value="${c.placa||''}" style="width:60px"><button>OK</button></form></td><td>${c.obs_e}</td><td>${c.est_real}</td><td>${c.f_fin||'--'}</td><td><a href="/finish/${c.id}" style="color:#10b981">FIN</a> | <a href="/d/${c.id}" style="color:#f87171">X</a></td></tr>`).join('');
  res.send(`<html><head><meta charset="UTF-8">${css}</head><body>
    <h2>LOGÍSTICA V20</h2>
    <form action="/add" method="POST" class="form">
      <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option>${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Puerto</label><select name="pto">${opts.puertos.map(o=>`<option>${o}</option>`).join('')}</select></div>
      <div class="fg"><label>DO/BL</label><input name="do_bl"></div>
      <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option>${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Subcliente</label><select name="subc">${opts.subclientes.map(o=>`<option>${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Contenedor</label><input name="cont"></div>
      <div class="fg"><label>Producto</label><input name="prod"></div>
      <div class="fg"><label>Origen</label><input name="orig" list="l_c"></div>
      <div class="fg"><label>Destino</label><input name="dest" list="l_c"></div>
      <datalist id="l_c">${opts.ciudades.map(c=>`<option value="${c}">`).join('')}</datalist>
      <button class="btn">💾 REGISTRAR</button>
    </form>
    <input type="text" id="search" onkeyup="f()" placeholder="🔍 Buscar...">
    <button class="btn-xl" onclick="ex()">📥 EXCEL</button>
    <div class="sc"><table id="t"><thead><tr><th>ID</th><th>OFICINA</th><th>PUERTO</th><th>DO/BL</th><th>CLI</th><th>SUBC</th><th>CONT</th><th>PROD</th><th>ORI</th><th>DES</th><th>PLACA</th><th>LOG</th><th>REAL</th><th>FIN</th><th>ACC</th></tr></thead><tbody>${rows}</tbody></table></div>
    <script>
      function f(){let v=document.getElementById("search").value.toUpperCase(),r=document.getElementById("t").rows;for(let i=1;i<r.length;i++)r[i].style.display=r[i].innerText.toUpperCase().includes(v)?"":"none"}
      function ex(){let c="sep=;\\n";const r=document.querySelectorAll("tr");r.forEach(row=>{let d=[];row.querySelectorAll("th,td").forEach(td=>d.push('"'+td.innerText.replace(/\\n/g," ")+'"'));c+=d.join(";")+"\\n"});const b=new Blob(["\\ufeff"+c],{type:"text/csv;charset=utf-8;"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="Reporte.csv";a.click()}
    </script>
  </body></html>`);
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO' }, { where: { id: req.params.id } }); res.redirect('/'); });
app.get('/finish/:id', async (req, res) => { await C.update({ f_fin: new Date().toLocaleString('es-CO'), est_real: 'FINALIZADO' }, { where: { id: req.params.id } }); res.redirect('/'); });
db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

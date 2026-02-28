const express = require('express'), { Sequelize, DataTypes } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());
const db = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } });

const C = db.define('Carga', {
  oficina: DataTypes.STRING, emp_gen: DataTypes.STRING, comercial: DataTypes.STRING, pto: DataTypes.STRING, refleja: DataTypes.STRING, f_doc: DataTypes.STRING, h_doc: DataTypes.STRING, do_bl: DataTypes.STRING, cli: DataTypes.STRING, subc: DataTypes.STRING, mod: DataTypes.STRING, lcl: DataTypes.STRING, cont: DataTypes.STRING, peso: DataTypes.STRING, unid: DataTypes.STRING, prod: DataTypes.STRING, esq: DataTypes.STRING, vence: DataTypes.STRING, orig: DataTypes.STRING, dest: DataTypes.STRING, t_v: DataTypes.STRING, ped: DataTypes.STRING, f_c: DataTypes.STRING, h_c: DataTypes.STRING, f_d: DataTypes.STRING, h_d: DataTypes.STRING, placa: DataTypes.STRING, f_p: DataTypes.STRING, f_f: DataTypes.STRING, obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }, f_act: DataTypes.STRING, obs: DataTypes.TEXT, cond: DataTypes.TEXT, h_t: DataTypes.STRING, muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING, est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
}, { timestamps: true });

const opts = {
  oficina: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  puertos: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO BAHÍA', 'N/A'],
  clientes: ['GEODIS', 'MAERSK', 'SAMSUNG', 'ENVAECOL', 'YARA', 'ESENTTIA', 'BRINSA', 'TENARIS', 'CORONA', 'FAJOBE'],
};

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  /* AJUSTE DINÁMICO DE TABLA */
  .sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  table{border-collapse:collapse; width: max-content; min-width: 100%; font-size:10px}
  th{background:#1e40af;padding:10px 15px;position:sticky;top:0;white-space:nowrap;border-right:1px solid #3b82f6;z-index:10}
  td{padding:8px 12px;border:1px solid #334155;white-space:nowrap;text-align:center}
  
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:4px}
  label{font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase}
  input,select{padding:8px;border-radius:4px;border:none;font-size:11px}
  .btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:15px;cursor:pointer;border:none;font-weight:700;border-radius:6px}
  .btn-xl{background:#10b981;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;margin-bottom:10px;display:inline-block;border:none;cursor:pointer}
  .btn-fin{background:#10b981;color:white;padding:4px 8px;border-radius:4px;text-decoration:none;font-weight:bold}
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => {
    const acc = c.f_fin ? `<b style="color:#10b981">✓</b>` : (c.placa ? `<a href="/finish/${c.id}" class="btn-fin">FINALIZAR</a>` : `<span style="color:#f87171;font-size:9px">REQ. PLACA</span>`);
    return `<tr><td>${c.id}</td><td>${c.oficina}</td><td>${c.pto}</td><td>${c.do_bl}</td><td>${c.cli}</td><td>${c.subc}</td><td>${c.cont}</td><td>${c.prod}</td><td>${c.orig}</td><td>${c.dest}</td><td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:2px"><input name="placa" value="${c.placa||''}" style="width:65px" oninput="this.value=this.value.toUpperCase()"><button>OK</button></form></td><td>${c.obs_e}</td><td>${c.est_real}</td><td>${acc}</td><td>${c.f_fin||'--'}</td><td><a href="/d/${c.id}" style="color:#f87171">X</a></td></tr>`;
  }).join('');

  res.send(`<html><head><meta charset="UTF-8"><title>V20 Compact</title>${css}</head><body>
    <h2 style="color:#3b82f6;margin-top:0">LOGÍSTICA V20</h2>
    <form action="/add" method="POST" class="form">
      <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option>${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Puerto</label><select name="pto">${opts.puertos.map(o=>`<option>${o}</option>`).join('')}</select></div>
      <div class="fg"><label>DO/BL/OC</label><input name="do_bl"></div>
      <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option>${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Subcliente</label><input name="subc"></div>
      <div class="fg"><label>Contenedor</label><input name="cont"></div>
      <div class="fg"><label>Producto</label><input name="prod"></div>
      <div class="fg"><label>Origen</label><input name="orig"></div>
      <div class="fg"><label>Destino</label><input name="dest"></div>
      <button class="btn">💾 REGISTRAR CARGA</button>
    </form>
    <button class="btn-xl" onclick="exportExcel()">📥 DESCARGAR EXCEL</button>
    <div class="sc">
      <table>
        <thead><tr><th>ID</th><th>OFICINA</th><th>PUERTO</th><th>DO/BL</th><th>CLIENTE</th><th>SUBCLIENTE</th><th>CONT</th><th>PROD</th><th>ORIGEN</th><th>DESTINO</th><th>PLACA</th><th>LOGÍSTICA</th><th>ESTADO REAL</th><th>ACCIÓN</th><th>FINALIZACIÓN</th><th>DEL</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <script>
      function exportExcel(){
        let csv = [];
        const rows = document.querySelectorAll("table tr");
        for (const row of rows) {
          const cols = Array.from(row.querySelectorAll("td, th")).map(c => '"' + c.innerText.replace(/\\n/g, ' ') + '"');
          csv.push(cols.join(","));
        }
        const blob = new Blob(["\\ufeff" + csv.join("\\n")], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "Reporte_V20.csv"; a.click();
      }
    </script>
  </body></html>`);
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO' }, { where: { id: req.params.id } }); res.redirect('/'); });
app.get('/finish/:id', async (req, res) => {
  const ahora = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  await C.update({ f_fin: ahora, est_real: 'FINALIZADO', obs_e: 'FINALIZADO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

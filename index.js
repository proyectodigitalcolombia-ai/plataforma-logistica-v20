const express = require('express'),
  { Sequelize, DataTypes } = require('sequelize'),
  app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Conexión a Base de Datos
const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. Modelo
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

// 3. Listas
const opts = {
  despachadores: ['ABNNER MARTINEZ', 'CAMILO TRIANA', 'FREDY CARRILLO', 'RAUL LOPEZ', 'EDDIER RIVAS'],
  estados: ['ASIGNADO', 'CANCELADO', 'CONTENEDOR', 'DESPACHADO', 'EN CONSECUTIVO', 'EN PROGRAMACIÓN', 'EN SITIO de CARGUE', 'FINALIZADO', 'HOJA DE VIDA', 'MERCANCÍA', 'NOVEDAD', 'PENDIENTE', 'PRE ASIGNADO', 'RETIRADO', 'VEHÍCULO EN PLANTA']
};

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  .sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  .fs{height:12px;margin-bottom:5px}
  .fc{width:5600px;height:1px}
  table{border-collapse:collapse;min-width:5600px;font-size:10px;table-layout: fixed}
  th{background:#1e40af;padding:12px;text-align:center;position:sticky;top:0;white-space:nowrap;border-right:1px solid #3b82f6}
  td{padding:10px;border:1px solid #334155;white-space:nowrap;text-align:center} /* AQUÍ CENTRAMOS TODO */
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:4px}
  label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
  input,select{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}
  .btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:15px;cursor:pointer;border:none;font-weight:700;border-radius:6px}
  .btn-fin{background:#10b981;color:white;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;font-weight:bold;text-decoration:none;font-size:10px}
</style>`;

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    const rows = d.map(c => `<tr>
        <td><b>${c.id}</b></td>
        <td>${new Date(c.createdAt).toLocaleString()}</td>
        <td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td><td>${c.cont||''}</td><td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td><td>${c.vence||''}</td><td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td><td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td>
        <td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;justify-content:center;gap:3px"><input name="placa" value="${c.placa||''}" style="width:70px;text-align:center" oninput="this.value=this.value.toUpperCase()"><button style="background:#10b981;color:#fff;border:none;padding:4px;border-radius:3px;cursor:pointer">OK</button></form></td>
        <td>${c.f_p||''}</td><td>${c.f_f||''}</td><td><span style="background:#475569;padding:4px;border-radius:4px">${c.obs_e||'PENDIENTE'}</span></td><td>${c.f_act||''}</td><td>${c.obs||''}</td><td>${c.cond||''}</td><td>${c.h_t||''}</td><td>${c.muc||''}</td><td>${c.desp||''}</td>
        <td>${c.f_fin ? `<span style="color:#10b981;font-weight:bold">FINALIZADO</span>` : `<a href="/finish/${c.id}" class="btn-fin" onclick="return confirm('¿Finalizar despacho?')">🏁 FINALIZAR</a>`}</td>
        <td><b style="color:#3b82f6">${c.f_fin||'--:--'}</b></td>
        <td><a href="/d/${c.id}" style="color:#f87171;text-decoration:none" onclick="return confirm('¿Borrar?')">X</a></td>
      </tr>`).join('');

    res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>
      <h2 style="color:#3b82f6">SISTEMA LOGÍSTICO V20</h2>
      <form action="/add" method="POST" class="form">
        <div class="fg"><label>Oficina</label><input name="oficina"></div>
        <div class="fg"><label>Generadora</label><input name="emp_gen" value="YEGO ECO-T SAS"></div>
        <div class="fg"><label>Comercial</label><input name="comercial"></div>
        <div class="fg"><label>Pto Cargue</label><input name="pto"></div>
        <div class="fg"><label>Refleja</label><select name="refleja"><option value="SI">SI</option><option value="NO">NO</option></select></div>
        <div class="fg"><label>F.Doc</label><input name="f_doc" type="date"></div>
        <div class="fg"><label>H.Doc</label><input name="h_doc" type="time"></div>
        <div class="fg"><label>DO/BL/OC</label><input name="do_bl"></div>
        <div class="fg"><label>Cliente</label><input name="cli"></div>
        <div class="fg"><label>Subcliente</label><input name="subc"></div>
        <div class="fg"><label>Modalidad</label><input name="mod"></div>
        <div class="fg"><label>LCL/FCL</label><input name="lcl"></div>
        <div class="fg"><label>Contenedor</label><input name="cont"></div>
        <div class="fg"><label>Peso</label><input name="peso"></div>
        <div class="fg"><label>Unidades</label><input name="unid"></div>
        <div class="fg"><label>Producto</label><input name="prod"></div>
        <div class="fg"><label>Seguridad</label><input name="esq"></div>
        <div class="fg"><label>Vence</label><input name="vence" type="date"></div>
        <div class="fg"><label>Origen</label><input name="orig"></div>
        <div class="fg"><label>Destino</label><input name="dest"></div>
        <div class="fg"><label>Tipo Veh</label><input name="t_v"></div>
        <div class="fg"><label>Pedido</label><input name="ped"></div>
        <div class="fg"><label>F.Cargue</label><input name="f_c" type="date"></div>
        <div class="fg"><label>H.Cargue</label><input name="h_c" type="time"></div>
        <div class="fg"><label>F.Desc</label><input name="f_d" type="date"></div>
        <div class="fg"><label>H.Desc</label><input name="h_d" type="time"></div>
        <div class="fg"><label>Flete Pagar</label><input name="f_p"></div>
        <div class="fg"><label>Flete Fact</label><input name="f_f"></div>
        <div class="fg"><label>Estado</label><select name="obs_e">${opts.estados.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Horario</label><input name="h_t"></div>
        <div class="fg"><label>MUC</label><input name="muc"></div>
        <div class="fg"><label>Despachador</label><select name="desp">${opts.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <button class="btn">💾 REGISTRAR NUEVA CARGA</button>
      </form>
      <div class="sc fs" id="st"><div class="fc"></div></div>
      <div class="sc" id="sm">
        <table>
          <thead>
            <tr>
              <th>ITEM</th><th>REGISTRO</th><th>OFICINA</th><th>GEN</th><th>COM</th><th>PTO</th><th>REFL</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL/OC</th><th>CLI</th><th>SUB</th><th>MOD</th><th>LCL</th><th>CONT</th><th>PESO</th><th>UNID</th><th>PROD</th><th>SEG</th><th>VENCE</th><th>ORIG</th><th>DEST</th><th>T.VEH</th><th>PED</th><th>F.CAR</th><th>H.CAR</th><th>F.DESC</th><th>H.DESC</th><th>PLACA</th><th>F.PAG</th><th>F.FAC</th><th>EST</th><th>ACT</th><th>OBS</th><th>COND</th><th>HORA</th><th>MUC</th><th>DESP</th><th>ESTADO FINAL</th><th>HORA EXACTA</th><th>DEL</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <script>
        const t=document.getElementById('st'),m=document.getElementById('sm');
        t.onscroll=()=>m.scrollLeft=t.scrollLeft;
        m.onscroll=()=>t.scrollLeft=m.scrollLeft;
      </script>
    </body></html>`);
  } catch (e) { res.send(e.message); }
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase() }, { where: { id: req.params.id } }); res.redirect('/'); });
app.get('/finish/:id', async (req, res) => {
  const ahora = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  await C.update({ f_fin: ahora, obs_e: 'FINALIZADO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

db.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT || 3000, () => console.log('Server OK'));
});

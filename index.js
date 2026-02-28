const express = require('express'), { Sequelize, DataTypes, Op } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, { 
  dialect: 'postgres', 
  logging: false, 
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
});

// MODELO INTEGRAL - NO SE TOCA PARA NO PERDER DATOS
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
  oficina: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  puertos: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO COMPAS CCTO', 'PUERTO BAHÍA', 'SOCIEDAD PORTUARIA REGIONAL DE CARTAGENA', 'SPIA - AGUADULCE', 'PLANTA ESENTTIA KM 8 VIA MAMONAL', 'PLANTA YARA CARTAGENA MAMONAL', 'N/A'],
  clientes: ['GEODIS COLOMBIA LTDA', 'MAERSK LOGISTICS SERVICES LTDA', 'SAMSUNG SDS COLOMBIA GLOBAL', 'ENVAECOL', 'SEA CARGO COLOMBIA LTDA', 'YARA COLOMBIA', 'ESENTTIA SA', 'BRINSA SA', 'ACERIAS PAZ DEL RIO', 'TERNIUM DEL ATLANTICO', 'PLASTICOS ESPECIALES SAS', 'INGENIO MAYAGUEZ', 'TENARIS', 'CASA LUKER', 'CORONA', 'EDITORIAL NOMOS', 'ALIMENTOS POLAR', 'PLEXA SAS ESP', 'FAJOBE'],
  modalidades: ['NACIONALIZADO', 'OTM', 'DTA', 'TRASLADO', 'NACIONALIZADO EXP', 'ITR', 'VACÍO EN EXPRESO', 'VACÍO CONSOLIDADO', 'NACIONALIZADO IMP'],
  lcl_fcl: ['CARGA SUELTA', 'CONTENEDOR 40', 'CONTENEDOR 20', 'REFER 40', 'REFER 20', 'FLAT RACK 20', 'FLAT RACK 40'],
  esquemas: ['1 ESCOLTA - SELLO', '2 ESCOLTAS SELLO - SPIA', 'SELLO', '1 ESCOLTA', '2 ESCOLTA', 'NO REQUIERE', '2 ESCOLTAS SELLO', 'INSPECTORES VIALES'],
  vehiculos: ['TURBO 2.5 TN', 'TURBO 4.5 TN', 'TURBO SENCILLO', 'SENCILLO 9 TN', 'PATINETA 2S3', 'TRACTOMULA 3S2', 'TRACTOMULA 3S3', 'CAMA BAJA', 'DOBLE TROQUE'],
  ciudades: ['BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUENAVENTURA', 'SANTA MARTA', 'CÚCUTA', 'IBAGUÉ', 'PEREIRA', 'MANIZALES', 'NEIVA', 'VILLAVICENCIO', 'YOPAL', 'SIBERIA', 'FUNZA', 'MOSQUERA', 'MADRID', 'FACATATIVÁ', 'TOCANCIPÁ', 'CHÍA', 'CAJICÁ'],
  subclientes: ['HIKVISION', 'PAYLESS COLOMBIA', 'INDUSTRIAS DONSSON', 'SAMSUNG SDS', 'ÉXITO', 'ALKOSTO', 'FALABELLA', 'SODIMAC', 'ENVAECOL', 'ALPLA', 'AMCOR', 'MEXICHEM', 'KOBA D1', 'JERONIMO MARTINS', 'TERNIUM', 'BRINSA', 'TENARIS', 'CORONA', 'FAJOBE'],
  estados: ['ASIGNADO VEHÍCULO', 'PENDIENTE CITA ASIGNADO', 'VEHÍCULO CON CITA', 'CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 'CONTENEDOR EN INSPECCIÓN', 'CONTENEDOR RETIRADO PARA ITR', 'DESPACHADO', 'DESPACHADO CON NOVEDAD', 'EN CONSECUCIÓN', 'EN PROGRAMACIÓN', 'EN SITIO de CARGUE', 'FINALIZADO CON NOVEDAD', 'FINALIZADO SIN NOVEDAD', 'HOJA DE VIDA EN ESTUDIO', 'MERCANCÍA EN INSPECCIÓN', 'NOVEDAD', 'PENDIENTE BAJAR A PATIO', 'PENDIENTE INSTRUCCIONES', 'PRE ASIGNADO', 'RETIRADO DE PUERTO PENDIENTE CONSOLIDADO', 'CANCELADO POR GERENCIA', 'VEHICULO EN RUTA'],
  despachadores: ['ABNNER MARTINEZ', 'CAMILO TRIANA', 'FREDY CARRILLO', 'RAUL LOPEZ', 'EDDIER RIVAS']
};

const getNow = () => new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\//g, '-');

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  .sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  .fs{height:12px;margin-bottom:5px}
  .fc{width:8600px;height:1px}
  table{border-collapse:collapse;min-width:8600px;font-size:10px;table-layout: fixed;}
  th{background:#1e40af;padding:10px 5px;text-align:center;position:sticky;top:0;border-right:1px solid #3b82f6;}
  td{padding:6px;border:1px solid #334155;white-space:nowrap;text-align:center; overflow: hidden; text-overflow: ellipsis;}
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:20px;background:#1e293b;padding:15px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:2px}
  label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
  input,select,textarea{padding:6px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}
  .btn-submit-serious{grid-column:1/-1; background:#1e40af; color:#fff; padding:10px; cursor:pointer; border:none; font-weight:700; border-radius:6px;}
  .vence-rojo{background:#dc2626 !important;color:#fff !important;font-weight:bold;animation: blink 2s infinite;}
  .vence-amarillo{background:#fbbf24 !important;color:#000 !important;font-weight:bold}
  .duplicado-ui { background: #431407 !important; color: #fb923c !important; }
  @keyframes blink { 0% {opacity:1} 50% {opacity:0.6} 100% {opacity:1} }
</style>`;

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    const contMap = {}; d.forEach(x => { if(x.cont) contMap[x.cont] = (contMap[x.cont] || 0) + 1; });
    
    let rows = '';
    const hoy = new Date(); hoy.setHours(0,0,0,0);

    d.forEach((c, i) => {
      const isFin = c.f_fin ? 'disabled' : '';
      const stColor = c.f_fin ? 'background:#1e40af' : (c.placa ? 'background:#065f46' : 'background:#475569');
      
      let vStyle = '';
      if (c.vence && !c.f_fin) {
        const diff = Math.ceil((new Date(c.vence) - hoy) / 864e5);
        if (diff <= 2) vStyle = 'vence-rojo'; else if (diff <= 6) vStyle = 'vence-amarillo';
      }

      rows += `<tr class="fila-datos">
        <td>${i+1}</td><td style="font-weight:bold">${c.id.toString().padStart(4, '0')}</td>
        <td style="font-size:9px">${new Date(c.createdAt).toLocaleString('es-CO')}</td>
        <td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td>
        <td class="${(c.cont && contMap[c.cont]>1)?'duplicado-ui':''}">${c.cont||''}</td>
        <td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td>
        <td class="${vStyle}">${c.vence||''}</td>
        <td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td><td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td>
        <td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:2px"><input name="placa" value="${c.placa||''}" ${isFin} style="width:60px" oninput="this.value=this.value.toUpperCase()"><button ${isFin}>OK</button></form></td>
        <td>${c.f_p||''}</td><td>${c.f_f||''}</td>
        <td><select onchange="updState(${c.id}, this.value)" ${isFin} style="width:100%;background:#334155;color:#fff">${opts.estados.map(st=>`<option value="${st}" ${c.obs_e===st?'selected':''}>${st}</option>`).join('')}</select></td>
        <td style="color:#fbbf24">${c.f_act||''}</td>
        <td><span style="padding:2px 6px;border-radius:10px;font-size:8px;font-weight:bold;${stColor}">${c.f_fin?'FINALIZADO':(c.placa?'DESPACHADO':'PENDIENTE')}</span></td>
        <td style="text-align:left">${c.obs||''}</td><td style="text-align:left">${c.cond||''}</td><td>${c.h_t||''}</td><td>${c.muc||''}</td><td><b>${c.desp||''}</b></td>
        <td>${c.f_fin?'✓':(c.placa?`<a href="/finish/${c.id}" style="color:#10b981">FIN</a>`:'...')}</td><td>${c.f_fin||'--'}</td>
        <td><a href="/d/${c.id}" style="color:#f87171" onclick="return confirm('¿Borrar?')">🗑️</a></td>
      </tr>`;
    });

    res.send(`<html><head><meta charset="UTF-8">${css}</head><body>
      <h2 style="color:#3b82f6">LOGISV20 - PANEL OPERATIVO</h2>
      <div style="display:flex;gap:10px;margin-bottom:15px;">
        <input type="text" id="busq" onkeyup="buscar()" placeholder="Filtrar..." style="padding:10px;width:200px;background:#1e293b;color:#fff;border:1px solid #3b82f6">
        <a href="/stats" style="background:#4c1d95;color:white;padding:10px;border-radius:6px;text-decoration:none;font-weight:bold">📈 Indicadores y Semáforos</a>
      </div>

      <form action="/add" method="POST" class="form">
        <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Puerto</label><select name="pto">${opts.puertos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><label>Placa</label><input name="placa" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><label>Despachador</label><select name="desp">${opts.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg" style="grid-column:span 2"><label>Obs</label><input name="obs"></div>
        <button class="btn-submit-serious">REGISTRAR SERVICIO</button>
      </form>

      <div class="sc fs" id="st"><div class="fc"></div></div>
      <div class="sc" id="sm"><table><thead><tr><th>#</th><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>EMPRESA</th><th>COMERCIAL</th><th>PUERTO</th><th>REFLEJA</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLIENTE</th><th>SUBC</th><th>MOD</th><th>LCL</th><th>CONT</th><th>PESO</th><th>UNID</th><th>PROD</th><th>ESQ</th><th>VENCE</th><th>ORIG</th><th>DEST</th><th>VEH</th><th>PED</th><th>F.C</th><th>H.C</th><th>F.D</th><th>H.D</th><th>PLACA</th><th>PAGAR</th><th>FACT</th><th>ESTADO</th><th>ACT</th><th>FINAL</th><th>OBS</th><th>COND</th><th>HORA</th><th>MUC</th><th>DESPACHADOR</th><th>FIN</th><th>H.FIN</th><th>ACC</th></tr></thead><tbody>${rows}</tbody></table></div>
      
      <script>
        const t=document.getElementById('st'),m=document.getElementById('sm');
        t.onscroll=()=>m.scrollLeft=t.scrollLeft; m.onscroll=()=>t.scrollLeft=m.scrollLeft;
        function buscar(){ let f=document.getElementById("busq").value.toUpperCase(); document.querySelectorAll(".fila-datos").forEach(r=>r.style.display=r.innerText.toUpperCase().includes(f)?"":"none"); }
        function updState(id,v){ fetch('/state/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obs_e:v})}).then(()=>location.reload()); }
      </script></body></html>`);
  } catch (e) { res.send(e.message); }
});

app.get('/stats', async (req, res) => {
  const d = await C.findAll();
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const mes = hoy.substring(0, 7);
  const perd = d.filter(c => c.obs_e.includes('CANCELADO'));
  const prod = {}; d.forEach(c => { 
    const n = c.desp || 'SIN ASIGNAR'; const f = new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    if(!prod[n]) prod[n] = { h:0, m:0 }; if(f===hoy) prod[n].h++; if(f.startsWith(mes)) prod[n].m++;
  });

  res.send(`<html><head><meta charset="UTF-8"><style>
    body{background:#0f172a;color:#fff;font-family:sans-serif;padding:20px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:20px}
    .card{background:#1e293b;padding:20px;border-radius:10px;text-align:center;border:1px solid #334155}
    table{width:100%;border-collapse:collapse;background:#1e293b}
    th,td{padding:12px;border:1px solid #334155;text-align:center}
    .semaforo{padding:5px 10px;border-radius:15px;font-weight:bold}
  </style></head><body>
    <a href="/" style="color:#3b82f6">← VOLVER</a>
    <h1>KPI LOGISV20</h1>
    <div class="grid">
      <div class="card" style="border-left:8px solid #ef4444"><h3>PÉRDIDA HOY</h3><h2>${perd.filter(c => new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })===hoy).length}</h2></div>
      <div class="card" style="border-left:8px solid #f87171"><h3>PÉRDIDA MES</h3><h2>${perd.filter(c => new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }).startsWith(mes)).length}</h2></div>
    </div>
    <h3>SEMÁFORO DE PRODUCTIVIDAD</h3>
    <table><thead><tr><th>DESPACHADOR</th><th>HOY</th><th>MES</th><th>ESTADO</th></tr></thead>
    <tbody>${Object.entries(prod).map(([n,s]) => `<tr><td>${n}</td><td>${s.h}</td><td>${s.m}</td><td><span class="semaforo" style="background:${s.h>=5?'#065f46':(s.h>0?'#92400e':'#7f1d1d')}">${s.h>=5?'🟢 ALTA':(s.h>0?'🟡 MEDIA':'🔴 BAJA')}</span></td></tr>`).join('')}</tbody></table>
  </body></html>`);
});

app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), f_act: getNow() }, { where: { id: req.params.id } }); res.redirect('/'); });
app.post('/state/:id', async (req, res) => { await C.update({ obs_e: req.body.obs_e, f_act: getNow() }, { where: { id: req.params.id } }); res.sendStatus(200); });
app.get('/finish/:id', async (req, res) => { const a=getNow(); await C.update({ f_fin:a, obs_e:'FINALIZADO SIN NOVEDAD', f_act:a }, { where:{id:req.params.id}}); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });

db.sync().then(() => app.listen(process.env.PORT || 3000));

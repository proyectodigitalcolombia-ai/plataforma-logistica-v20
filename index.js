const express = require('express'), { Sequelize, DataTypes, Op } = require('sequelize'), app = express();

// --- GPS ELIMINADO SEGÚN INSTRUCCIÓN ---

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, { 
 dialect: 'postgres', 
 logging: false, 
 dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
});

// MODELO DE DATOS COMPLETO (V20)
const C = db.define('Carga', {
 oficina: DataTypes.STRING,
 emp_gen: DataTypes.STRING,
 comercial: DataTypes.STRING,
 pto: DataTypes.STRING,
 refleja: DataTypes.STRING,
 f_doc: DataTypes.STRING,
 h_doc: DataTypes.STRING,
 do_bl: DataTypes.STRING,
 cli: DataTypes.STRING,
 subc: DataTypes.STRING,
 mod: DataTypes.STRING,
 lcl: DataTypes.STRING,
 cont: DataTypes.STRING,
 peso: DataTypes.STRING,
 unid: DataTypes.STRING,
 prod: DataTypes.STRING,
 esq: DataTypes.STRING,
 vence: DataTypes.STRING,
 orig: DataTypes.STRING,
 dest: DataTypes.STRING,
 t_v: DataTypes.STRING,
 ped: DataTypes.STRING,
 f_c: DataTypes.STRING,
 h_c: DataTypes.STRING,
 f_d: DataTypes.STRING,
 h_d: DataTypes.STRING,
 placa: DataTypes.STRING,
 f_p: DataTypes.STRING,
 f_f: DataTypes.STRING,
 obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE INSTRUCCIONES' },
 f_act: DataTypes.STRING,
 obs: DataTypes.TEXT,
 cond: DataTypes.TEXT,
 h_t: DataTypes.STRING,
 muc: DataTypes.STRING,
 desp: DataTypes.STRING,
 f_fin: DataTypes.STRING,
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
 estados: ['ASIGNADO VEHÍCULO', 'PENDIENTE CITA ASIGNADO', 'VEHÍCULO CON CITA', 'CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 'CONTENEDOR EN INSPECCIÓN', 'CONTENEDOR RETIRADO PARA ITR', 'DESPACHADO', 'DESPACHADO CON NOVEDAD', 'EN CONSECUCIÓN', 'EN PROGRAMACIÓN', 'EN SITIO DE CARGUE', 'FINALIZADO CON NOVEDAD', 'FINALIZADO SIN NOVEDAD', 'HOJA DE VIDA EN ESTUDIO', 'MERCANCÍA EN INSPECCIÓN', 'NOVEDAD', 'PENDIENTE BAJAR A PATIO', 'PENDIENTE INSTRUCCIONES', 'PRE ASIGNADO', 'RETIRADO DE PUERTO PENDIENTE CONSOLIDADO', 'CANCELADO POR GERENCIA', 'VEHICULO EN RUTA'],
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
 
 .editable-cell {
    background: transparent !important;
    color: #10b981 !important; 
    border: none !important;
    width: 100%;
    text-align: center;
    font-size: 11px;
    font-weight: bold;
    cursor: pointer;
 }
 .editable-cell:focus {
    background: #fff !important;
    color: #000 !important;
    outline: 2px solid #3b82f6 !important;
 }

 .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
 .fg{display:flex;flex-direction:column;gap:4px}
 label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
 input,select,textarea{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}
 .btn-submit-serious{grid-column:1/-1; background:#1e40af; color:#fff; padding:12px; cursor:pointer; border:none; font-weight:700; border-radius:6px;}
 .vence-rojo{background:#dc2626 !important;color:#fff !important;font-weight:bold;}
 .vence-amarillo{background:#fbbf24 !important;color:#000 !important;font-weight:bold}
 .sel-est { background:#334155; color:#fff; border:none; padding:4px; font-size:9px; width:100%; cursor:pointer; }
</style>`;

app.get('/', async (req, res) => {
 try {
 const d = await C.findAll({ order: [['id', 'DESC']] });
 let rows = '';
 const hoy = new Date(); hoy.setHours(0,0,0,0);
 let index = 1;

 for (let c of d) {
 const isLocked = c.f_fin ? 'disabled' : '';
 let displayReal = 'PENDIENTE', stClass = 'background:#475569;color:#cbd5e1'; 
 if (c.f_fin) { displayReal = 'FINALIZADO'; stClass = 'background:#1e40af;color:#bfdbfe'; } 
 else if (c.placa) { displayReal = 'DESPACHADO'; stClass = 'background:#065f46;color:#34d399'; }

 let vStyle = '';
 if (c.vence && !c.f_fin) {
  const fV = new Date(c.vence);
  const diff = Math.ceil((fV - hoy) / 864e5);
  if (diff <= 2) vStyle = 'vence-rojo';
  else if (diff <= 6) vStyle = 'vence-amarillo';
 }

 rows += `<tr class="fila-datos">
 <td>${index++}</td>
 <td><b>${c.id.toString().padStart(4, '0')}</b></td>
 <td style="font-size:9px">${new Date(c.createdAt).toLocaleString('es-CO')}</td>
 <td>${c.oficina||''}</td>
 <td>${c.emp_gen||''}</td>
 <td>${c.comercial||'RAÚL LÓPEZ'}</td>
 <td>${c.pto||''}</td>
 <td>${c.refleja||''}</td>
 <td>${c.f_doc||''}</td>
 <td>${c.h_doc||''}</td>
 <td>${c.do_bl||''}</td>
 <td>${c.cli||''}</td>
 <td>${c.subc||''}</td>
 <td>${c.mod||''}</td>
 <td>${c.lcl||''}</td>

 <td>
    <form action="/edit-live/${c.id}" method="POST" style="margin:0">
        <input name="cont" value="${c.cont||''}" class="editable-cell" onchange="this.form.submit()" ${isLocked} oninput="this.value=this.value.toUpperCase()">
    </form>
 </td>

 <td>${c.peso||''}</td>
 <td>${c.unid||''}</td>
 <td>${c.prod||''}</td>
 <td>${c.esq||''}</td>
 <td class="${vStyle}">${c.vence||''}</td>
 <td>${c.orig||''}</td>
 <td>${c.dest||''}</td>
 <td>${c.t_v||''}</td>

 <td>
    <form action="/edit-live/${c.id}" method="POST" style="margin:0">
        <input name="ped" value="${c.ped||''}" class="editable-cell" onchange="this.form.submit()" ${isLocked} oninput="this.value=this.value.toUpperCase()">
    </form>
 </td>

 <td>${c.f_c||''}</td>
 <td>${c.h_c||''}</td>
 <td>${c.f_d||''}</td>
 <td>${c.h_d||''}</td>
 
 <td style="width:120px">
    <form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:4px;justify-content:center;align-items:center">
        <input name="placa" value="${c.placa||''}" ${isLocked} placeholder="PLACA" style="width:70px" oninput="this.value=this.value.toUpperCase()">
        <button ${isLocked} style="background:#10b981;color:#fff;border:none;padding:5px;border-radius:3px;">OK</button>
    </form>
 </td>

 <td>${c.f_p||''}</td>
 <td>${c.f_f||''}</td>
 <td style="width:210px;padding:0">
    <select class="sel-est" ${isLocked} onchange="updState(${c.id}, this.value)">
        ${opts.estados.map(st => `<option value="${st}" ${c.obs_e === st ? 'selected' : ''}>${st}</option>`).join('')}
    </select>
 </td>
 <td style="width:115px;color:#fbbf24">${c.f_act||''}</td>
 <td style="width:100px"><span style="padding:2px 6px;border-radius:10px;font-weight:bold;font-size:8px;${stClass}">${displayReal}</span></td>
 <td style="white-space:normal;min-width:250px;text-align:left">${c.obs||''}</td>
 <td style="white-space:normal;min-width:250px;text-align:left">${c.cond||''}</td>
 <td>${c.h_t||''}</td>

 <td>
    <form action="/edit-live/${c.id}" method="POST" style="margin:0">
        <input name="muc" value="${c.muc||''}" class="editable-cell" onchange="this.form.submit()" ${isLocked} oninput="this.value=this.value.toUpperCase()">
    </form>
 </td>

 <td>${c.desp||''}</td>
 <td>${c.f_fin ? '✓' : (c.placa ? `<a href="/finish/${c.id}" style="background:#10b981;color:white;padding:3px 6px;border-radius:4px;text-decoration:none;">FIN</a>` : '...')}</td>
 <td><b style="color:#3b82f6">${c.f_fin||'--'}</b></td>
 <td><a href="#" style="color:#f87171;text-decoration:none;" onclick="eliminarConClave(${c.id})">🗑️</a></td>
 </tr>`;
 }

 res.send(`<html><head><meta charset="UTF-8"><title>LOGIS V20</title>${css}</head><body>
 <h2 style="color:#3b82f6; margin:0 0 10px 0;">SISTEMA LOGISTICO YEGO ECO T S.A.S</h2>
 
 <div style="display:flex;gap:10px;margin-bottom:10px;align-items:center;">
 <input type="text" id="busq" onkeyup="buscar()" placeholder="🔍 Filtrar registros...">
 <button onclick="exportExcel()" style="background:#16a34a;color:white;padding:10px;border-radius:6px;border:none;cursor:pointer;font-weight:bold;">Excel</button>
 <a href="/stats" style="background:#4c1d95;color:white;padding:10px;border-radius:6px;text-decoration:none;font-weight:bold;">📈 KPI</a>
 </div>

 <form action="/add" method="POST" class="form">
 <datalist id="l_c">${opts.ciudades.map(c=>`<option value="${c}">`).join('')}</datalist>
 <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
 <div class="fg"><label>Puerto</label><select name="pto">${opts.puertos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
 <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
 <div class="fg"><label>Modalidad</label><select name="mod">${opts.modalidades.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
 <div class="fg"><label>DO/BL</label><input name="do_bl"></div>
 <div class="fg"><label>Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
 <div class="fg"><label>Vence</label><input name="vence" type="date"></div>
 <div class="fg"><label>Origen</label><input name="orig" list="l_c"></div>
 <div class="fg"><label>Destino</label><input name="dest" list="l_c"></div>
 <div class="fg"><label>Pedido</label><input name="ped"></div>
 <div class="fg"><label>MUC</label><input name="muc"></div>
 <div class="fg"><label>Despachador</label><select name="desp">${opts.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
 <button class="btn-submit-serious">REGISTRAR CARGA</button>
 </form>

 <div class="sc fs" id="st"><div class="fc"></div></div>
 <div class="sc" id="sm">
 <table id="tabla">
 <thead><tr><th>#</th><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>EMPRESA</th><th>COMERCIAL</th><th>PUERTO</th><th>REFLEJA</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLIENTE</th><th>SUBCLIENTE</th><th>MODALIDAD</th><th>LCL/FCL</th><th>CONTENEDOR</th><th>PESO</th><th>UNID</th><th>PRODUCTO</th><th>ESQUEMA</th><th>VENCE</th><th>ORIGEN</th><th>DESTINO</th><th>VEHICULO</th><th>PEDIDO</th><th>F.C</th><th>H.C</th><th>F.D</th><th>H.D</th><th>PLACA</th><th>PAGAR</th><th>FACTURA</th><th>ESTADO</th><th>ACTUALIZACIÓN</th><th>ESTADO FINAL</th><th>OBSERVACIONES</th><th>CONDICIONES</th><th>HORA</th><th>MUC</th><th>DESPACHADOR</th><th>FIN</th><th>H.FIN</th><th>ACC</th></tr></thead>
 <tbody>${rows}</tbody>
 </table>
 </div>

 <script>
 const t=document.getElementById('st'),m=document.getElementById('sm');
 t.onscroll=()=>m.scrollLeft=t.scrollLeft;
 m.onscroll=()=>t.scrollLeft=m.scrollLeft;

 function updState(id,v){
 fetch('/state/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obs_e:v})}).then(()=>location.reload());
 }

 function eliminarConClave(id){
 if(prompt("Clave:") === "ADMIN123") window.location.href="/d/"+id;
 }

 function buscar(){
 let f = document.getElementById("busq").value.toUpperCase();
 document.querySelectorAll(".fila-datos").forEach(row => {
 row.style.display = row.innerText.toUpperCase().includes(f) ? "" : "none";
 });
 }

 function exportExcel(){
 let csv="sep=;\\n";
 document.querySelectorAll("#tabla tr").forEach(row=>{
 if(row.style.display!=="none"){
 let cols=Array.from(row.querySelectorAll("td, th")).map(c=>{
 let inp=c.querySelector("input,select,textarea");
 return '"'+(inp?inp.value:c.innerText.split('\\n')[0]).replace(/;/g,",").trim()+'"';
 });
 csv+=cols.slice(0,-1).join(";")+"\\n";
 }
 });
 const b=new Blob(["\\ufeff"+csv],{type:"text/csv;charset=utf-8;"}),u=URL.createObjectURL(b),a=document.createElement("a");
 a.href=u;a.download="Reporte.csv";a.click();
 }
 </script></body></html>`);
 } catch (e) { res.send(e.message); }
});

// RUTAS CRUD
app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });

// RUTA PARA EDICIÓN EN LÍNEA
app.post('/edit-live/:id', async (req, res) => {
    try {
        const updates = {};
        for (let key in req.body) { updates[key] = req.body[key].toUpperCase(); }
        await C.update(updates, { where: { id: req.params.id } });
        res.redirect('/');
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/u/:id', async (req, res) => { 
    await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO', f_act: getNow() }, { where: { id: req.params.id } }); 
    res.redirect('/'); 
});

app.post('/state/:id', async (req, res) => { await C.update({ obs_e: req.body.obs_e, f_act: getNow() }, { where: { id: req.params.id } }); res.sendStatus(200); });

app.get('/finish/:id', async (req, res) => { 
    const ahora = getNow(); 
    await C.update({ f_fin: ahora, obs_e: 'FINALIZADO SIN NOVEDAD', est_real: 'FINALIZADO', f_act: ahora }, { where: { id: req.params.id } }); 
    res.redirect('/'); 
});

app.get('/stats', async (req, res) => {
 try {
 const cargas = await C.findAll();
 res.send(`<h1>KPI</h1><p>Total: ${cargas.length}</p><a href="/">Volver</a>`);
 } catch (e) { res.send(e.message); }
});

db.sync({ alter: true }).then(() => { app.listen(process.env.PORT || 3000); });

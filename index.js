const express = require('express'), { Sequelize, DataTypes, Op } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

// Configuración de DB con la variable de entorno NODE_VERSION 20 sugerida
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
  estados: ['ASIGNADO VEHÍCULO', 'PENDIENTE CITA ASIGNADO', 'VEHÍCULO CON CITA', 'CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 'CONTENEDOR EN INSPECCIÓN', 'CONTENEDOR RETIRADO PARA ITR', 'DESPACHADO', 'DESPACHADO CON NOVEDAD', 'EN CONSECUCIÓN', 'EN PROGRAMACIÓN', 'EN SITIO DE CARGUE', 'FINALIZADO CON NOVEDAD', 'FINALIZADO SIN NOVEDAD', 'HOJA DE VIDA EN ESTUDIO', 'MERCANCÍA EN INSPECCIÓN', 'NOVEDAD', 'PENDIENTE BAJAR A PATIO', 'PENDIENTE INSTRUCCIONES', 'PRE ASIGNADO', 'RETIRADO DE PUERTO PENDIENTE CONSOLIDADO', 'CANCELADO POR GERENCIA', 'VEHICULO EN RUTA'],
  despachadores: ['ABNNER MARTINEZ', 'CAMILO TRIANA', 'FREDY CARRILLO', 'RAUL LOPEZ', 'EDDIER RIVAS']
};

const getNow = () => new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', hour12: false });

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  .sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  .fs{height:12px;margin-bottom:5px}
  .fc{width:8600px;height:1px}
  table{border-collapse:collapse;min-width:8600px;font-size:10px;table-layout: fixed;}
  th{background:#1e40af;padding:10px 5px;text-align:center;position:sticky;top:0;border-right:1px solid #3b82f6; word-wrap: break-word; white-space: normal; vertical-align: middle;}
  td{padding:6px;border:1px solid #334155;white-space:nowrap;text-align:center; overflow: hidden; text-overflow: ellipsis;}
  .col-num { width: 30px; }
  .col-id { width: 40px; font-weight: bold; }
  .col-reg { width: 110px; font-size: 9px; }
  .col-emp { width: 150px; text-align: center !important; }
  .col-placa { width: 120px; }
  .in-placa { width: 75px !important; font-size: 11px !important; font-weight: bold; height: 25px; }
  .col-est { width: 210px; padding: 0 !important; }
  .sel-est { background:#334155; color:#fff; border:none; padding:4px; font-size:9px; width:100%; height: 100%; cursor:pointer; text-align: center; }
  .col-desp { width: 130px; }
  .col-hfin { width: 115px; font-size: 9px; }
  .col-acc { width: 70px; }
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:4px}
  label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
  input,select,textarea{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}
  
  /* Botón con Logo Serio */
  .btn-submit-serious{
    grid-column:1/-1; background:#1e40af; color:#fff; padding:12px; cursor:pointer; border:none; font-weight:700; border-radius:6px;
    display:flex; align-items:center; justify-content:center; gap:10px; transition: background 0.2s;
  }
  .btn-submit-serious:hover{ background:#1d4ed8; }
  .icon-btn{ width:20px; height:20px; fill:#fff; }

  .btn-xls{background:#556b2f;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer;height:38px;}
  .btn-stats{background:#4c1d95;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer;text-decoration:none;font-size:13px;height:38px;display:flex;align-items:center;}
  #busq{padding:10px;width:250px;border-radius:6px;border:1px solid #3b82f6;background:#1e293b;color:white;font-weight:bold;height:38px;}
  .vence-rojo{background:#dc2626 !important;color:#fff !important;font-weight:bold;animation: blink 2s infinite;}
  @keyframes blink { 0% {opacity:1} 50% {opacity:0.6} 100% {opacity:1} }
</style>`;

// RUTA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    let rows = '';
    let index = 1;
    for (let c of d) {
      const isLocked = c.f_fin ? 'disabled' : '';
      const idUnico = c.id.toString().padStart(4, '0');
      const selectEstado = `<select class="sel-est" ${isLocked} onchange="updState(${c.id}, this.value)">${opts.estados.map(st => `<option value="${st}" ${c.obs_e === st ? 'selected' : ''}>${st}</option>`).join('')}</select>`;
      
      rows += `<tr class="fila-datos">
        <td class="col-num">${index++}</td>
        <td class="col-id">${idUnico}</td>
        <td class="col-reg">${new Date(c.createdAt).toLocaleDateString()}</td>
        <td>${c.oficina||''}</td>
        <td class="col-emp">${c.emp_gen||''}</td>
        <td>${c.comercial||''}</td>
        <td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td><td>${c.cont||''}</td><td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td>
        <td>${c.vence||''}</td><td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td><td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td>
        <td class="col-placa">
          <form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:4px;">
            <input name="placa" class="in-placa" value="${c.placa||''}" ${isLocked} oninput="this.value=this.value.toUpperCase()">
            <button ${isLocked} style="background:#10b981;color:#fff;border:none;border-radius:3px;cursor:pointer;">OK</button>
          </form>
        </td>
        <td>${c.f_p||''}</td><td>${c.f_f||''}</td>
        <td class="col-est">${selectEstado}</td>
        <td style="color:#fbbf24">${c.f_act||''}</td>
        <td>${c.est_real}</td>
        <td style="white-space:normal;min-width:200px;">${c.obs||''}</td>
        <td style="white-space:normal;min-width:200px;">${c.cond||''}</td>
        <td>${c.h_t||''}</td><td>${c.muc||''}</td><td class="col-desp">${c.desp||''}</td>
        <td>${c.f_fin ? '✓' : `<a href="/finish/${c.id}">FIN</a>`}</td>
        <td class="col-hfin">${c.f_fin||'--'}</td>
        <td class="col-acc"><a href="/d/${c.id}" onclick="return confirm('¿Eliminar?')">🗑️</a></td>
      </tr>`;
    }

    res.send(`<html><head><meta charset="UTF-8"><title>SISTEMA LOGISTICO</title>${css}</head><body>
      <h2 style="color:#3b82f6;">SISTEMA LOGISTICO DE YEGO ECO T S.A.S</h2>
      <div style="display:flex;gap:10px;margin-bottom:10px;">
          <input type="text" id="busq" onkeyup="buscar()" placeholder="🔍 Filtrar...">
          <button class="btn-xls" onclick="exportExcel()">Excel</button>
          <a href="/stats" class="btn-stats">📈 Indicadores</a>
      </div>
      
      <form action="/add" method="POST" class="form">
        <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Empresa</label><select name="emp_gen"><option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option></select></div>
        <div class="fg"><label>Comercial</label><select name="comercial"><option value="RAÚL LÓPEZ">RAÚL LÓPEZ</option></select></div>
        <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Estado</label><select name="obs_e">${opts.estados.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <button class="btn-submit-serious">
          <svg class="icon-btn" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          REGISTRAR SERVICIO
        </button>
      </form>

      <div class="sc" id="sm">
        <table id="tabla">
          <thead><tr><th>#</th><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>EMPRESA</th><th>COMERCIAL</th><th>PUERTO</th><th>REFLEJA</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLIENTE</th><th>SUBCLIENTE</th><th>MODALIDAD</th><th>LCL/FCL</th><th>CONTENEDOR</th><th>PESO</th><th>UNID</th><th>PRODUCTO</th><th>ESQUEMA</th><th>VENCE</th><th>ORIGEN</th><th>DESTINO</th><th>VEHICULO</th><th>PEDIDO</th><th>F.C</th><th>H.C</th><th>F.D</th><th>H.D</th><th>PLACA</th><th>PAGAR</th><th>FACTURA</th><th>ESTADO</th><th>ACTUALIZACIÓN</th><th>ESTADO FINAL</th><th>OBSERVACIONES</th><th>CONDICIONES</th><th>HORA</th><th>MUC</th><th>DESPACHADOR</th><th>FIN</th><th>H.FIN</th><th>ACCIONES</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <script>
        function updState(id,v){fetch('/state/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obs_e:v})}).then(()=>location.reload());}
        function buscar(){/* Lógica de búsqueda */}
        function exportExcel(){/* Lógica de excel */}
      </script>
    </body></html>`);
  } catch (e) { res.send(e.message); }
});

// RUTA DE INDICADORES (KPIs)
app.get('/stats', async (req, res) => {
  try {
    const cargas = await C.findAll();
    const ahora = new Date();
    const hoyStr = ahora.toLocaleDateString('en-CA');
    const mesActualStr = hoyStr.substring(0, 7);
    const cancelTags = ['CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 'CANCELADO POR GERENCIA'];

    const serviciosHoy = cargas.filter(c => new Date(c.createdAt).toLocaleDateString('en-CA') === hoyStr);
    const serviciosMes = cargas.filter(c => new Date(c.createdAt).toISOString().substring(0, 7) === mesActualStr);
    
    const porcPerdHoy = serviciosHoy.length ? ((serviciosHoy.filter(c => cancelTags.includes(c.obs_e)).length / serviciosHoy.length) * 100).toFixed(1) : 0;
    const porcPerdMes = serviciosMes.length ? ((serviciosMes.filter(c => cancelTags.includes(c.obs_e)).length / serviciosMes.length) * 100).toFixed(1) : 0;

    res.send(`<html><head><meta charset="UTF-8"><title>INDICADORES GERENCIALES</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body{background:#0f172a;color:#fff;font-family:sans-serif;padding:25px;}
      .card{background:#1e293b;padding:20px;border-radius:10px;border-left:5px solid #3b82f6;margin-bottom:15px;text-align:center;}
      .card.alert{border-left-color:#ef4444;}
      .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;}
    </style></head><body>
      <div style="display:flex; align-items:center; gap:15px; margin-bottom:30px;">
        <svg style="width:40px;fill:#3b82f6" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
        <h2>TABLERO DE INDICADORES GERENCIALES</h2>
      </div>
      
      <div class="grid">
        <div class="card alert"><h3>Pérdida Emergente Hoy</h3><p style="font-size:35px;color:#f87171">${porcPerdHoy}%</p></div>
        <div class="card alert"><h3>Pérdida Mes en Curso</h3><p style="font-size:35px;color:#f87171">${porcPerdMes}%</p></div>
        <div class="card"><h3>Total Servicios Mes</h3><p style="font-size:35px;">${serviciosMes.length}</p></div>
      </div>
      <a href="/" style="color:#fff;text-decoration:none;background:#2563eb;padding:10px 20px;border-radius:5px;display:inline-block;margin-top:20px;">Volver</a>
    </body></html>`);
  } catch (e) { res.send(e.message); }
});

// ACCIONES DB
app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO', f_act: getNow() }, { where: { id: req.params.id } }); res.redirect('/'); });
app.post('/state/:id', async (req, res) => { await C.update({ obs_e: req.body.obs_e, f_act: getNow() }, { where: { id: req.params.id } }); res.sendStatus(200); });
app.get('/finish/:id', async (req, res) => { const ahora = getNow(); await C.update({ f_fin: ahora, est_real: 'FINALIZADO', f_act: ahora }, { where: { id: req.params.id } }); res.redirect('/'); });

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

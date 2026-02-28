const express = require('express'), 
      { Sequelize, DataTypes, Op } = require('sequelize'), 
      app = express();

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

// CONFIGURACIÓN DE BASE DE DATOS
const db = new Sequelize(process.env.DATABASE_URL, { 
  dialect: 'postgres', 
  logging: false, 
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
});

// MODELO DE DATOS (TABLA CARGAS)
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

// OPCIONES DE LOS SELECTS
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

// FUNCIÓN PARA HORA COLOMBIA
const getNow = () => {
  return new Date().toLocaleString('es-CO', { 
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  }).replace(/\//g, '-');
};

// ESTILOS CSS
const css = `
<style>
  body { background:#0f172a; color:#fff; font-family:sans-serif; margin:0; padding:20px; }
  .sc { width:100%; overflow-x:auto; background:#1e293b; border:1px solid #334155; border-radius:8px; }
  .fs { height:12px; margin-bottom:5px; }
  .fc { width:8600px; height:1px; }
  table { border-collapse:collapse; min-width:8600px; font-size:10px; table-layout: fixed; }
  th { background:#1e40af; padding:10px 5px; text-align:center; position:sticky; top:0; border-right:1px solid #3b82f6; }
  td { padding:6px; border:1px solid #334155; white-space:nowrap; text-align:center; overflow: hidden; text-overflow: ellipsis; }
  .col-num { width: 30px; }
  .col-id { width: 40px; font-weight: bold; }
  .col-reg { width: 110px; font-size: 9px; }
  .col-placa { width: 120px; }
  .in-placa { width: 75px !important; font-size: 11px !important; font-weight: bold; height: 25px; }
  .col-est { width: 210px; padding: 0 !important; }
  .sel-est { background:#334155; color:#fff; border:none; padding:4px; font-size:9px; width:100%; height: 100%; cursor:pointer; }
  .form { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin-bottom:25px; background:#1e293b; padding:20px; border-radius:8px; border:1px solid #2563eb; }
  .fg { display:flex; flex-direction:column; gap:4px; }
  label { font-size:9px; color:#94a3b8; text-transform:uppercase; font-weight:700; }
  input, select, textarea { padding:8px; border-radius:4px; border:none; font-size:11px; color:#000; text-align:center; }
  .btn-submit-serious { grid-column:1/-1; background:#1e40af; color:#fff; padding:12px; cursor:pointer; border:none; font-weight:700; border-radius:6px; }
  .btn-xls { background:#556b2f; color:white; padding:10px 15px; border-radius:6px; font-weight:bold; border:none; cursor:pointer; height:38px; }
  .btn-stats { background:#4c1d95; color:white; padding:10px 15px; border-radius:6px; font-weight:bold; border:none; cursor:pointer; text-decoration:none; font-size:13px; height:38px; display:flex; align-items:center; }
  #busq { padding:10px; width:250px; border-radius:6px; border:1px solid #3b82f6; background:#1e293b; color:white; font-weight:bold; height:38px; }
  .vence-rojo { background:#dc2626 !important; animation: blink 2s infinite; }
  @keyframes blink { 0% {opacity:1} 50% {opacity:0.6} 100% {opacity:1} }
</style>`;

// RUTA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    let rows = '';
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    let index = 1;

    for (let c of d) {
      const isLocked = c.f_fin ? 'disabled' : '';
      let displayReal = 'PENDIENTE';
      let stClass = 'background:#475569;color:#cbd5e1'; 
      if (c.f_fin) { displayReal = 'FINALIZADO'; stClass = 'background:#1e40af;color:#bfdbfe'; } 
      else if (c.placa) { displayReal = 'DESPACHADO'; stClass = 'background:#065f46;color:#34d399'; }
      
      let venceStyle = '';
      if (c.vence && !c.f_fin) {
        const fVence = new Date(c.vence);
        const diffDays = Math.ceil((fVence - hoy) / 864e5);
        if (diffDays <= 2) venceStyle = 'vence-rojo';
      }

      const selectEstado = `<select class="sel-est" ${isLocked} onchange="updState(${c.id}, this.value)">${opts.estados.map(st => `<option value="${st}" ${c.obs_e === st ? 'selected' : ''}>${st}</option>`).join('')}</select>`;
      const fechaLocal = new Date(c.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' });

      rows += `<tr class="fila-datos">
        <td class="col-num">${index++}</td>
        <td class="col-id">${c.id.toString().padStart(4, '0')}</td>
        <td class="col-reg">${fechaLocal}</td>
        <td>${c.oficina||''}</td>
        <td title="${c.emp_gen||''}">${c.emp_gen||''}</td>
        <td>${c.comercial||''}</td>
        <td>${c.pto||''}</td>
        <td>${c.refleja||''}</td>
        <td>${c.f_doc||''}</td>
        <td>${c.h_doc||''}</td>
        <td>${c.do_bl||''}</td>
        <td>${c.cli||''}</td>
        <td>${c.subc||''}</td>
        <td>${c.mod||''}</td>
        <td>${c.lcl||''}</td>
        <td>${c.cont||''}</td>
        <td>${c.peso||''}</td>
        <td>${c.unid||''}</td>
        <td>${c.prod||''}</td>
        <td>${c.esq||''}</td>
        <td class="${venceStyle}">${c.vence||''}</td>
        <td>${c.orig||''}</td>
        <td>${c.dest||''}</td>
        <td>${c.t_v||''}</td>
        <td>${c.ped||''}</td>
        <td>${c.f_c||''}</td>
        <td>${c.h_c||''}</td>
        <td>${c.f_d||''}</td>
        <td>${c.h_d||''}</td>
        <td class="col-placa">
          <form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:4px;">
            <input name="placa" class="in-placa" value="${c.placa||''}" ${isLocked} oninput="this.value=this.value.toUpperCase()">
            <button ${isLocked} style="background:#10b981;color:#fff;border:none;cursor:pointer;">OK</button>
          </form>
        </td>
        <td>${c.f_p||''}</td>
        <td>${c.f_f||''}</td>
        <td class="col-est">${selectEstado}</td>
        <td style="width:115px;color:#fbbf24">${c.f_act||''}</td>
        <td style="width:100px"><span style="padding:2px 6px;border-radius:10px;font-weight:bold;font-size:8px;${stClass}">${displayReal}</span></td>
        <td style="white-space:normal;min-width:250px;text-align:left">${c.obs||''}</td>
        <td style="white-space:normal;min-width:250px;text-align:left">${c.cond||''}</td>
        <td>${c.h_t||''}</td>
        <td>${c.muc||''}</td>
        <td>${c.desp||''}</td>
        <td>${c.f_fin ? '✓' : `<a href="/finish/${c.id}">FIN</a>`}</td>
        <td class="col-hfin"><b>${c.f_fin||'--'}</b></td>
        <td class="col-acc"><a href="#" onclick="eliminarConClave(${c.id})">🗑️</a><input type="checkbox" class="row-check" value="${c.id}" onclick="toggleDelBtn()"></td>
      </tr>`;
    }
    res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>...contenido front-end...</body></html>`);
  } catch (e) { res.send(e.message); }
});

// RUTAS DE ACCIÓN
app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO', f_act: getNow() }, { where: { id: req.params.id } }); res.redirect('/'); });

// INDICADORES (STATS) - LOGICA COMPLETA DE FALTANTES
app.get('/stats', async (req, res) => {
  try {
    const cargas = await C.findAll();
    const faltantes = cargas.filter(c => !c.placa || c.placa.trim() === '');
    
    // Agrupación para la tabla y el gráfico
    const porCiudad = {};
    const consolidadoTipo = {};
    
    faltantes.forEach(c => {
      const ciudad = (c.orig || 'SIN ORIGEN').toUpperCase();
      const tipo = (c.t_v || 'SIN ESPECIFICAR').toUpperCase();
      if(!porCiudad[ciudad]) porCiudad[ciudad] = {};
      porCiudad[ciudad][tipo] = (porCiudad[ciudad][tipo] || 0) + 1;
      consolidadoTipo[tipo] = (consolidadoTipo[tipo] || 0) + 1;
    });

    const total = cargas.length;
    const fin = cargas.filter(c => c.f_fin).length;
    const desp = cargas.filter(c => c.placa && !c.f_fin).length;

    res.send(`...diseño de indicadores...`);
  } catch (e) { res.send(e.message); }
});

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

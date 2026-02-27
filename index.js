const express = require('express'),
  { Sequelize, DataTypes } = require('sequelize'),
  app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de la Base de Datos
const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// Modelo de la Tabla
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

// Listas de Opciones
const opts = {
  oficina: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  comerciales: ['RAÚL LÓPEZ', 'ZULEIMA RIASCOS', 'FREDY CARRILLO', 'ANDRES DIAZ'],
  puertos: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO COMPAS CCTO', 'PUERTO BAHÍA', 'SEGÚN REMISIÓN DEL CLIENTE', 'SOCIEDAD PORTUARIA REGIONAL DE CARTAGENA', 'SPIA - AGUADULCE', 'PLANTA ESENTTIA KM 8 VIA MAMONAL', 'PLANTA YARA CARTAGENA MAMONAL', 'TURBACO PLANTA TENERIS TUBOCARIBE', 'N/A', 'PLANTA BRINSA CAJICA'],
  clientes: ['GEODIS COLOMBIA LTDA', 'MAERSK LOGISTICS SERVICES LTDA', 'SAMSUNG SDS COLOMBIA GLOBAL', 'ENVAECOL', 'SEA CARGO COLOMBIA LTDA', 'YARA COLOMBIA', 'ESENTTIA SA', 'BRINSA SA', 'ACERIAS PAZ DEL RIO', 'TERNIUM DEL ATLANTICO', 'PLASTICOS ESPECIALES SAS', 'INGENIO MAYAGUEZ', 'TENARIS', 'CASA LUKER', 'CORONA', 'EDITORIAL NOMOS', 'ALIMENTOS POLAR', 'PLEXA SAS ESP', 'FAJOBE'],
  modalidades: ['NACIONALIZADO', 'OTM', 'DTA', 'TRASLADO', 'NACIONALIZADO EXP', 'NACIONALIZADO INTERCOMPAÑÍAS', 'ITR', 'VACÍO EN EXPRESO', 'VACÍO CONSOLIDADO', 'VACÍO SEMI EXPRESO', 'PENDIENTE INSTRUCCIÓN COMERCIAL', 'NACIONALIZADO IMP'],
  lcl_fcl: ['CARGA SUELTA', 'CONTENEDOR 40', 'CONTENEDOR 20', 'REFER 40', 'REFER 20', 'FLAT RACK 20', 'FLAT RACK 40'],
  esquemas: ['1 ESCOLTA - SELLO', '2 ESCOLTAS SELLO - SPIA', 'SELLO', '1 ESCOLTA', '2 ESCOLTA', 'NO REQUIERE', '2 ESCOLTAS SELLO', 'PENDIENTE INSTRUCCIÓN', 'INSPECTORES VIALES'],
  vehiculos: ['TURBO 2.5 TN', 'TURBO 3.5 A 4.5 TN', 'TURBO SENCILLO', 'SENCILLO 7.5 A 9 TN', 'SENCILLO > 10 TN', 'PATINETA 2S2', 'PATINETA 2S3', 'TRACTOMULA 3S2', 'TRACTOMULA 3S3', 'CAMA BAJA', 'DOBLE TROQUE'],
  ciudades: ['BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUENAVENTURA', 'SANTA MARTA', 'CÚCUTA', 'BUCARAMANGA', 'PEREIRA', 'IBAGUÉ', 'PASTO', 'MANIZALES', 'NEIVA', 'VILLAVICENCIO', 'ARMENIA', 'VALLEDUPAR', 'MONTERÍA', 'SINCELEJO', 'POPAYÁN', 'TUNJA', 'RIOHACHA', 'QUIBDÓ', 'FLORENCIA', 'YOPAL', 'IPIALES', 'SIBERIA', 'FUNZA', 'MOSQUERA', 'MADRID', 'FACATATIVÁ', 'TOCANCIPÁ', 'GACHANCIPÁ', 'CHÍA', 'CAJICÁ', 'GIRARDOT', 'FUSAGASUGÁ', 'ZIPAQUIRÁ', 'SOPÓ', 'SOACHA', 'ENVIGADO', 'ITAGÜÍ', 'BELLO', 'LA ESTRELLA', 'RIONEGRO', 'TURBACO', 'MAMONAL', 'MALAMBO', 'SOLEDAD', 'YUMBO', 'PALMIRA'],
  subclientes: ['NO APLICA', 'HIKVISION', 'PAYLESS COLOMBIA', 'SAMSUNG SDS', 'ÉXITO', 'ALKOSTO', 'FALABELLA', 'SODIMAC', 'ENVAECOL', 'YARA', 'ESENTTIA', 'TENARIS', 'CASA LUKER', 'POLAR', 'FAJOBE'],
  estados: ['ASIGNADO', 'CANCELADO', 'CONTENEDOR', 'DESPACHADO', 'EN CONSECUTIVO', 'EN PROGRAMACIÓN', 'EN SITIO DE CARGUE', 'FINALIZADO', 'HOJA DE VIDA', 'MERCANCÍA', 'NOVEDAD', 'PENDIENTE', 'PRE ASIGNADO', 'RETIRADO', 'VEHÍCULO EN PLANTA'],
  despachadores: ['ZULEIMA RIASCOS', 'ABNNER MARTINEZ', 'OSCAR CHACON', 'CAMILO TRIANA', 'FREDY CARRILLO', 'RAUL LOPEZ']
};

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  .sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  .fs{height:12px;margin-bottom:5px}
  .fc{width:5200px;height:1px}
  table{border-collapse:collapse;min-width:5200px;font-size:10px}
  th{background:#1e40af;padding:12px;text-align:left;position:sticky;top:0;white-space:nowrap;border-right:1px solid #3b82f6}
  td{padding:8px;border:1px solid #334155;white-space:nowrap}
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:4px}
  label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
  input,select{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000}
  .btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:15px;cursor:pointer;border:none;font-weight:700;border-radius:6px}
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => `<tr>
    <td><b>${c.id}</b></td><td>${new Date(c.createdAt).toLocaleString()}</td><td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td><td>${c.cont||''}</td><td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td><td>${c.vence||''}</td><td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td><td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td>
    <td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:3px"><input name="placa" value="${c.placa||''}" style="width:70px" oninput="this.value=this.value.toUpperCase()"><button style="background:#10b981;color:#fff;border:none;padding:4px;border-radius:3px">OK</button></form></td>
    <td>${c.f_p||''}</td><td>${c.f_f||''}</td><td><span style="background:#475569;padding:4px;border-radius:4px">${c.obs_e||'PENDIENTE'}</span></td><td>${c.f_act||''}</td><td>${c.obs||''}</td><td>${c.cond||''}</td><td>${c.h_t||''}</td><td>${c.muc||''}</td><td>${c.desp||''}</td><td>${c.f_fin||''}</td>
    <td><a href="/d/${c.id}" style="color:#f87171" onclick="return confirm('¿Borrar?')">X</a></td>
  </tr>`).join('');

  res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>
    <h2 style="color:#3b82f6">SISTEMA LOGÍSTICO V20</h2>
    <form action="/add" method="POST" class="form">
      <datalist id="list_ciud">${opts.ciudades.map(c => `<option value="${c}">`).join('')}</datalist>
      <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Empresa Generadora</label><select name="emp_gen"><option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option></select></div>
      <div class="fg"><label>Comercial</label><select name="comercial">${opts.comerciales.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Pto Cargue</label><select name="pto">${opts.puertos.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Refleja</label><input name="refleja"></div>
      <div class="fg"><label>F.Doc</label><input name="f_doc" type="date"></div>
      <div class="fg"><label>H.Doc</label><input name="h_doc" type="time"></div>
      <div class="fg"><label>DO/BL/OC</label><input name="do_bl"></div>
      <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Subcliente</label><select name="subc">${opts.subclientes.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Modalidad</label><select name="mod">${opts.modalidades.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>LCL / FCL</label><select name="lcl">${opts.lcl_fcl.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>N.Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><label>Peso Kg</label><input name="peso"></div>
      <div class="fg"><label>Unidades</label><input name="unid"></div>
      <div class="fg"><label>Producto</label><input name="prod"></div>
      <div class="fg"><label>Esq.Seguridad</label><select name="esq">${opts.esquemas.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Vence Pto</label><input name="vence" type="date"></div>
      <div class="fg"><label>Origen</label><input name="orig" list="list_ciud" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><label>Destino</label><input name="dest" list="list_ciud" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><label>Tipo Vehículo</label><select name="t_v">${opts.vehiculos.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
      <div class="fg"><label>Pedido</label><input name="ped"></div>
      <div class="fg"><label>F.Cargue</label><input name="

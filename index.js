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

// 2. Definición del Modelo
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

// 3. Opciones de Listas
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
    <td><b>${c.id}</b></td><td>${new Date(c.createdAt).toLocaleString()}</td><td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>

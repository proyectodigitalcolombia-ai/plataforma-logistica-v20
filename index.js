const express = require('express'), { Sequelize, DataTypes } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false,
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
  f_f: DataTypes.STRING, obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  f_act: DataTypes.STRING, obs: DataTypes.TEXT, cond: DataTypes.TEXT, h_t: DataTypes.STRING,
  muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING,
  est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
}, { timestamps: true });

const opts = {
  ofic: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  ptos: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO BAHÍA', 'N/A'],
  clis: ['GEODIS COLOMBIA', 'MAERSK', 'SAMSUNG SDS', 'ENVAECOL', 'SEA CARGO', 'YARA COLOMBIA', 'ESENTTIA', 'BRINSA', 'ACERIAS PAZ DEL RIO', 'TENARIS', 'CORONA'],
  mods: ['NACIONALIZADO', 'OTM', 'DTA', 'TRASLADO', 'ITR', 'VACÍO'],
  lcls: ['CARGA SUELTA', 'CONT 40', 'CONT 20', 'REFER 40', 'REFER 20'],
  esqs: ['1 ESCOLTA - SELLO', 'SELLO', 'NO REQUIERE', 'INSPECTORES VIALES'],
  vehs: ['TURBO', 'SENCILLO', 'PATINETA', 'TRACTOMULA 3S2', 'TRACTOMULA 3S3', 'CAMA BAJA'],
  ciud: ['BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUENAVENTURA', 'SANTA MARTA', 'SIBERIA', 'FUNZA'],
  ests: ['ASIGNADO VEHÍCULO', 'PENDIENTE CITA', 'DESPACHADO', 'VEHICULO EN RUTA', 'CANCELADO']
};

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:20px;background:#1e293b;padding:15px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:3px}
  label{font-size:8px;color:#94a3b8;text-transform:uppercase;font-weight:700}
  input,select{padding:6px;border-radius:4px;border:none;font-size:10px;color:#000}
  .btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:12px;cursor:pointer;border:none;font-weight:700;border-radius:6px}
  
  /* ESTO ES LO QUE INMOVILIZA LOS NOMBRES */
  .sc-container{height:65vh;overflow:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  table{border-collapse:separate;border-spacing:0;min-width:6000px}
  thead{position:sticky;top:0;z-index:99}
  th{background:#1e40af;color:white;padding:12px;font-size:10px;border-bottom:2px solid #3b82f6;border-right:1px solid #334155;text-align:center}
  td{padding:8px;border-bottom:1px solid #334155;border-right:1px solid #334155;text-align:center;font-size:10px;background:#1e293b}
  
  .st-real{padding:4px 8px;border-radius:15px;font-weight:bold;font-

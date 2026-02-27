const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

const C = db.define('Carga', {
  oficina: DataTypes.STRING, empresa_gen: DataTypes.STRING, comercial: DataTypes.STRING,
  puerto: DataTypes.STRING, refleja_en: DataTypes.STRING, fecha_doc: DataTypes.STRING,
  hora_doc: DataTypes.STRING, do_bl_oc: DataTypes.STRING, cliente: DataTypes.STRING,
  subcliente: DataTypes.STRING, modalidad: DataTypes.STRING, lcl_fcl: DataTypes.STRING,
  n_contenedor: DataTypes.STRING, peso: DataTypes.STRING, unidades: DataTypes.STRING,
  producto: DataTypes.STRING, esquema_seg: DataTypes.STRING, fecha_vence_pto: DataTypes.STRING,
  origen: DataTypes.STRING, destino: DataTypes.STRING, tipo_v: DataTypes.STRING,
  pedido: DataTypes.STRING, fecha_cita_cargue: DataTypes.STRING, hora_cita_cargue: DataTypes.STRING,
  fecha_cita_descargue: DataTypes.STRING, hora_cita_descargue: DataTypes.STRING,
  placa: DataTypes.STRING, flete_pagar: DataTypes.STRING, flete_facturar: DataTypes.STRING,
  obs_estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  fecha_act_estado: DataTypes.STRING, observaciones: DataTypes.TEXT,
  condiciones: DataTypes.TEXT, horario_transito: DataTypes.STRING,
  muc: DataTypes.STRING, despachador: DataTypes.STRING, fecha_fin_despacho: DataTypes.STRING
}, { timestamps: true });

const css = `<style>
  body { background: #0f172a; color: #f1f5f9; font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
  .scroll-container { width: 100%; overflow-x: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; }
  .fake-scroll { height: 12px; margin-bottom: 5px; }
  .fake-content { width: 4500px; height: 1px; }
  table { border-collapse: collapse; min-width: 4500px; font-size: 11px; }
  th { background: #1e40af; color: white; padding: 12px; text-align: left; position: sticky; top: 0; white-space: nowrap; border-right: 1px solid #3b82f6; font-size: 10px; }
  td { padding: 8px; border: 1px solid #334155; white-space: nowrap; }
  tr:nth-child(even) { background: #1e293b; } tr:hover { background: #2d3748; }
  
  /* Formulario con etiquetas visibles */
  .form { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 30px; background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #2563eb; }
  .field-group { display: flex; flex-direction: column; gap: 5px; }
  label { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
  input, select, textarea { background: #fff; border: 1px solid #334155; padding: 10px; border-radius: 4px; font-size: 12px; color: #000; }
  .btn-save { grid-column: 1/-1; background: #2563eb; color: white; border: none; padding: 15px; cursor: pointer; border-radius: 6px; font-weight: bold; font-size: 14px; margin-top: 10px; }
  .btn-ok { background: #10b981; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => {
    const sysDate = new Date(c.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    return `<tr>
      <td><b>${c.id}</b></td><td>${sysDate}</td><td>${c.oficina||''}</td><td>${c.empresa_gen||''}</td>
      <td>${c.comercial||''}</td><td>${c.puerto||''}</td><td>${c.refleja_en||''}</td><td>${c.fecha_doc||''}</td>
      <td>${c.hora_doc||''}</td><td>${c.do_bl_oc||''}</td><td>${c.cliente||''}</td><td>${c.subcliente||''}

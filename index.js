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
  n_cont: DataTypes.STRING, peso: DataTypes.STRING, unid: DataTypes.STRING,
  prod: DataTypes.STRING, esq_seg: DataTypes.STRING, f_vence_pto: DataTypes.STRING,
  orig: DataTypes.STRING, dest: DataTypes.STRING, t_veh: DataTypes.STRING,
  pedido: DataTypes.STRING, f_cargue: DataTypes.STRING, h_cargue: DataTypes.STRING,
  f_descargue: DataTypes.STRING, h_descargue: DataTypes.STRING,
  placa: DataTypes.STRING, f_pagar: DataTypes.STRING, f_facturar: DataTypes.STRING,
  obs_est: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  f_act_est: DataTypes.STRING, obs: DataTypes.TEXT, cond: DataTypes.TEXT,
  h_trans: DataTypes.STRING, muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING
}, { timestamps: true });

const css = `<style>
  body { background: #0f172a; color: #f1f5f9; font-family: sans-serif; margin: 0; padding: 20px; }
  .sc { width: 100%; overflow-x: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; }
  .fs { height: 12px; margin-bottom: 5px; } .fc { width: 4500px; height: 1px; }
  table { border-collapse: collapse; min-width: 4500px; font-size: 11px; }
  th { background: #1e40af; color: white; padding: 12px; text-align: left; position: sticky; top: 0; white-space: nowrap; border-right: 1px solid #3b82f6; }
  td { padding: 8px; border: 1px solid #334155; white-space: nowrap; }
  .form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 25px; background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #2563eb; }
  .fg { display: flex; flex-direction: column; gap: 4px; }
  label { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
  input, select, textarea { background: #fff; border: 1px solid #334155; padding: 8px; border-radius: 4px; font-size: 12px; color: #000; }
  .btn { grid-column: 1/-1; background: #2563eb; color: white; border: none; padding: 15px; cursor: pointer; border-radius: 6px; font-weight: bold; }
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => `<tr>
    <td><b>${c.id}</b></td><td>${new Date(c.createdAt).toLocaleString('es-CO')}</td><td>${c.oficina||''}</td><td>${c.empresa_gen||''}</td>
    <td>${c.comercial||''}</td><td>${c.puerto||''}</td><td>${c.refleja_en||''}</td><td>${c.fecha_doc||''}</td>
    <td>${c.hora_doc||''}</td><td>${c.do_bl_oc||''}</td><td>${c.cliente||''}</td><td>${c.subcliente||''}</td>
    <td>${c.modalidad||''}</td><td>${c.lcl_fcl||''}</td><td>${c.n_cont||''}</td><td>${c.peso||''}</td>
    <td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq_seg||''}</td><td>${c.f_vence_pto||''}</td>
    <td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_veh||''}</td><td>${c.pedido||''}</td>
    <td>${c.f_cargue||''}</td><td>${c.h_cargue||''}</td><td>${c.f_descargue||''}</td><td>${c.h_descargue||''}</td>
    <td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:3px;"><input name="placa" value="${c.placa||''}" style="width:80px"><button style="background:#10b981;border:none;color:white;cursor:pointer;padding:4px">OK</button></form></td>
    <td>${c.f_pagar||''}</td><td>${c.f_facturar||''}</td><td>${c.obs_est||''}</td><td>${c.f_act_est||''}</td>
    <td>${c.obs||''}</td><td>${c.cond||''}</td><td>${c.h_trans||''}</td><td>${c.muc||''}</td><td>${c.desp||''}</td><td>${c.f_fin||''}</td>
    <td><a href="/del/${c.id}" style="color:#f87171" onclick="return confirm('¿Eliminar?')">BORRAR</a></td>
  </tr>`).join('');

  res.send(`<html><head><meta charset="UTF-8"><title>Control Cargas</title>${css}</head><body>
    <h2 style="color:#3b82f6">CONTROL DE CARGAS PENDIENTES</h2>
    <form action="/add" method="POST" class="form">
      <div class="fg"><label>Oficina</label><select name="oficina"><option>CARTAGENA</option><option>BOGOTÁ</option><option>BUENAVENTURA</option></select></div>
      <div class="fg"><label>Empresa Generadora</label><input name="empresa_gen"></div>
      <div class="fg"><label>Comercial</label><input name="comercial"></div>
      <div class="fg"><label>Puerto/Sitio Cargue</label><input name="puerto"></div>
      <div class="fg"><label>Refleja en Puerto</label><input name="refleja_en"></div>
      <div class="fg"><label>Fecha Doc</label><input name="fecha_doc" type="date"></div>
      <div class="fg"><label>Hora Doc</label><input name="hora_doc" type="time"></div>
      <div class="fg"><label>DO / BL / OC</label><input name="do_bl_oc"></div>
      <div class="fg"><label>Cliente</label><input name="cliente"></div>
      <div class="fg"><label>Subcliente</label><input name="subcliente"></div>
      <div class="fg"><label>Modalidad</label><input name="modalidad"></div>
      <div class="fg"><label>LCL / FCL</label><input name="lcl_fcl"></div>
      <div class="fg"><label>N° Contenedor</label><input name="n_cont"></div>
      <div class="fg"><label>Peso Kg</label><input name="peso"></div>
      <div class="fg"><label>Unidades</label><input name="unid"></div>
      <div

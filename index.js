const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

const Carga = db.define('Carga', {
  empresa: DataTypes.STRING, comercial: DataTypes.STRING, cliente: DataTypes.STRING,
  subcliente: DataTypes.STRING, do_bl: DataTypes.STRING, peso: DataTypes.STRING,
  origen: DataTypes.STRING, dest: DataTypes.STRING, tipo_v: DataTypes.STRING,
  despachador: DataTypes.STRING, placa: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
});

const css = `<style>
  :root { --bg: #0f172a; --card: #1e293b; --acc: #3b82f6; --text: #f1f5f9; }
  body { background: var(--bg); color: var(--text); font-family: sans-serif; padding: 20px; margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; background: var(--card); padding: 15px; border-radius: 8px; border: 1px solid var(--acc); }
  input, select { padding: 8px; border-radius: 4px; border: none; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; background: var(--card); border-radius: 8px; overflow: hidden; }
  th { background: var(--acc); color: white; padding: 10px; font-size: 12px; text-align: left; }
  td { padding: 10px; border-bottom: 1px solid #334155; font-size: 12px; }
  .btn { background: var(--acc); color: white; border: none; padding: 10px; cursor: pointer; border-radius: 4px; font-weight: bold; width: 100%; grid-column: 1/-1; }
  .del { color: #f87171; text-decoration: none; font-weight: bold; }
  .badge { background: #10b981; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
</style>`;

app.get('/', async (req, res) => {
  const p = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['id','DESC']] });
  const r = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt','DESC']] });
  
  res.send(`<html><head><meta charset="UTF-8">${css}</head><body>
    <h2 style="color:var(--acc)">LOGISV20 PRO - GESTIÓN DE CARGAS</h2>
    <form action="/add" method="POST" class="grid">
      <select name="empresa"><option>YEGO ECO-T SAS</option><option>PLEXA ESP SAS</option><option>MAERSK</option></select>
      <select name="comercial"><option>RAÚL LÓPEZ</option><option>ZULEIMA RIASCOS</option></select>
      <input name="cliente" placeholder="Cliente" required>
      <input name="subcliente" placeholder="Subcliente">
      <input name="do_bl" placeholder="DO/BL/OC">
      <input name="peso" placeholder="Peso Kg">
      <select name="origen"><option>CARTAGENA</option><option>BUENAVENTURA</option></select>
      <select name="dest"><option>BOGOTÁ</option><option>MEDELLÍN</option><option>CALI</option></select>
      <select name="tipo_v"><option>TURBO</option><option>SENCILLO</option><option>TRACTOMULA 3S3</option></select>
      <input name="despachador" placeholder="Despachador">
      <button type="submit" class="btn">REGISTRAR CARGA</button>
    </form>

    <h3>📦 CARGAS PENDIENTES (${p.length})</h3>
    <table>
      <thead><tr><th>ID</th><th>EMPRESA</th><th>CLIENTE</th><th>RUTA</th><th>ACCIÓN / DESPACHO</th></tr></thead>
      <tbody>${p.map(c => `<tr>
        <td>${c.id}</td><td>${c.empresa}</td><td>${c.cliente}</td><td>${c.origen}-${c.dest}</td>
        <td>
          <form action="/go/${c.id}" method="POST" style="display:inline-flex; gap:5px;">
            <input name="placa" placeholder="PLACA" required style="width:70px">
            <button style="background:#10b981; color:white; border:none; border-radius:3px">GO</button>
          </form>
          <a href="/del/${c.id}" class="del" style="margin-left:10px">BORRAR</a>
        </td>
      </tr>`).join('')}</tbody>
    </table>

    <h3>🚚 EN RUTA (${r.length})</h3>
    <table>
      <thead><tr><th>PLACA</th><th>CLIENTE</th><th>RUTA</th><th>DESPACHADOR</th></tr></thead>
      <tbody>${r.map(c => `<tr><td><b style="color:var(--acc)">${c.placa}</b></td><td>${c.cliente}</td><td>${c.origen}-${c.dest}</td><td><span class="badge">${c.despachador}</span></td></tr>`).join('')}</tbody>
    </table>

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

const Carga = sequelize.define('Carga', {
  empresa: DataTypes.STRING, comercial: DataTypes.STRING, do_bl: DataTypes.STRING,
  cliente: DataTypes.STRING, subcliente: DataTypes.STRING, peso: DataTypes.STRING,
  producto: DataTypes.STRING, origen: DataTypes.STRING, dest: DataTypes.STRING,
  tipo_v: DataTypes.STRING, despachador: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const p = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'DESC']] });
    const r = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });
    const rowP = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.empresa}</b><br>${c.comercial}</td><td><b>${c.cliente}</b><br>${c.subcliente}</td><td>${c.origen}→${c.dest}</td><td>${c.peso}kg</td><td><a href="/del/${c.id}" class="bd">BORRAR</a></td></tr>`;
    const rowD = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b><br>${c.tipo_v}</td><td><form action="/vink/${c.id}" method="POST" class="f"><input name="placa" placeholder="PLACA" required maxlength="7"><button type="submit">GO</button></form></td></tr>`;
    const rowR = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td>${c.origen}→${c.dest}</td><td><span class="l lg"></span> <b>${c.placa}</b><br><small>${c.despachador}</small></td></tr>`;

    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>
      :root { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --acc: #3b82f6; --brd: #334155; }
      body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; }
      .nv { background: #fff; color: #000; padding: 10px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--acc); }
      .ts { display: flex; gap: 8px; padding: 20px 40px; }
      .tb { background: var(--card); color: var(--text); border: 1px solid var(--brd); padding: 12px; border-radius: 8px; cursor: pointer; font-family: 'Rajdhani'; font-weight: bold; }
      .tb.active { background: var(--acc); color: white; }
      .md { display: none; padding: 0 40px; } .md.active { display: block; }
      .tc { background: var(--card); border-radius: 12px; overflow: auto; max-height: 400px; border: 1px solid var(--brd); }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: rgba(0,0,0,0.2); padding: 12px; text-align: left; color: var(--acc); position: sticky; top: 0; }
      td { padding: 10px; border-bottom: 1px solid var(--brd); }
      .form-pro { background: var(--card); padding: 15px; border-radius: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px; border: 1px solid var(--acc); }
      input, select { padding: 8px; border-radius: 4px; border: 1px solid var(--brd); background: #fff; color: #000; font-size: 11px; }
      .btn-add { grid-column: 1/-1; background: var(--acc); color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; }
      .bd { color: #ef4444; text-decoration: none; border: 1px solid #ef4444; padding: 2px 5px; border-radius: 4px; font-size: 10px; }
      .l { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      .lg { background: #10b981; box-shadow: 0 0 5px #10b981; }
      .f input { width: 70px; } .f button { background: var(--acc); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
    </style></head><body>
    <div class="nv"><div style="font-family:'Rajdhani'; font-size:24px;">LOGISV20 <b>PRO</b></div></div>
    <div class="ts">
      <button class="tb active" onclick="s('m1',this)">📦 CARGAS PENDIENTES (${p.length})</button>
      <button class="tb" onclick="s('m2',this)">⚠️ POR DESPACHO (${p.length})</button>
      <button class="tb" onclick="s('m3',this)">🚚 EN RUTA (${r.length})</button>
    </div>
    <div id="m1" class="md active">
      <form action="/add" method="POST" class="form-pro">
        <select name="empresa" required><option value="">EMPRESA...</option><option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option><option value="PLEXA ESP SAS">PLEXA ESP SAS</option><option value="MAERSK">MAERSK</option></select>
        <select name="comercial"><option value="RAÚL LÓPEZ">RAÚL LÓPEZ</option><option value="ZULEIMA RIASCOS">ZULEIMA RIASCOS</option></select>
        <input name="cliente" placeholder="Cliente" required><input name="subcliente" placeholder="Subcliente">
        <input name="do_bl" placeholder="DO/BL/OC"><input name="peso" placeholder="Kg" type="number">
        <select name="origen"><option value="CARTAGENA">CARTAGENA</option><option value="BUENAVENTURA">BUENAVENTURA</option></select>
        <select name="dest"><option value="BOGOTÁ">BOGOTÁ</option><option value="MEDELLÍN">MEDELLÍN</option></select>
        <select name="tipo_v"><option value="TURBO">TURBO</option><option value="SENCILLO">SENCILLO</option><option value="TRACTOMULA">TRACTOMULA</option></select>
        <select name="despachador"><option value="ABNNER MARTINEZ">ABNNER MARTINEZ</option><option value="CAMILO TRIANA">CAMILO TRIANA</option></select>
        <button type="submit" class="btn-add">💾 GUARDAR REGISTRO</button>
      </form>
      <div class="tc"><table><thead><tr><th>ID</th><th>EMPRESA</th><th>CLIENTE</th><th>

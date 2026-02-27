const express = require('express');
const fileUpload = require('express-fileupload');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// Modelo robusto basado en tu Excel "CONTROL DE DESPACHOS"
const Carga = sequelize.define('Carga', {
  empresa: DataTypes.STRING,
  comercial: DataTypes.STRING,
  do_bl: DataTypes.STRING,
  cliente: DataTypes.STRING,
  subcliente: DataTypes.STRING,
  peso: DataTypes.STRING,
  producto: DataTypes.STRING,
  origen: { type: DataTypes.STRING, defaultValue: 'CARTAGENA' },
  dest: { type: DataTypes.STRING, defaultValue: 'BOGOTÁ' },
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const p = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'DESC']] });
    const r = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    // Filas módulo 1 (Vista avanzada)
    const rowP = (c) => `
      <tr class="dr">
        <td style="font-weight:bold; color:var(--acc)">#${c.id}</td>
        <td>${c.empresa}</td>
        <td>${c.cliente}</td>
        <td><small>${c.do_bl || 'N/A'}</small></td>
        <td>${c.origen} → ${c.dest}</td>
        <td><b>${c.peso || '0'} kg</b></td>
        <td><span class="l lr"></span> <small>PENDIENTE</small></td>
      </tr>`;

    // Filas módulo 2 (Gestión rápida)
    const rowD = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td><form action="/vink/${c.id}" method="POST" class="f"><input name="placa" placeholder="PLACA" required maxlength="7"><button type="submit">DESPACHAR</button></form></td></tr>`;

    // Filas módulo 3 (Monitoreo)
    const rowR = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td>${c.origen}→${c.dest}</td><td><span class="l lg"></span> <b class="pt">${c.placa}</b></td></tr>`;

    res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --acc: #2563eb; --brd: #94a3b8; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --acc: #3b82f6; --brd: #334155; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; transition: 0.3s; }
        .nv { background: #fff; padding: 10px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--acc); align-items: center; }
        .ts { display: flex; gap: 8px; padding: 20px 40px; background: rgba(0,0,0,0.05); }
        .tb { background: var(--card); color: var(--text); border: 1px solid var(--brd); padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Rajdhani'; transition: 0.2s; }
        .tb.active { background: var(--acc); color: white; border-color: var(--acc); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .md { display: none; padding: 0 40px; animation: fadeIn 0.3s; } .md.active { display: block; }
        
        /* Estilo Formulario Avanzado */
        .excel-form { background: var(--card); padding: 25px; border-radius: 15px; border: 1px solid var(--acc); margin-bottom: 25px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .excel-form input, .excel-form select { background: white; border: 1px solid var(--brd); padding: 10px; border-radius: 6px; font-size: 13px; }
        .btn-save { grid-column: 1 / -1; background: var(--acc); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }
        
        .tc { background: var(--card); border-radius: 12px; border: 1px solid var(--brd); overflow: auto; max-height: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { background: rgba(0,0,0,0.05); padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase; color: var(--acc); position: sticky; top: 0; z-index: 10; }
        td { padding: 12px 15px; border-bottom: 1px solid var(--brd); font-size: 13px; transition: 0.2s; }
        tr.dr:hover { background: rgba(37,99,235,0.05); }
        
        .l { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .lr { background: #ef4444; box-shadow: 0 0 8px #ef4444; animation: b 1.5s infinite; }
        .lg { background: #10b981; box-shadow: 0 0 8px #10b981; }
        @keyframes b { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .f input { padding: 6px; border-radius: 4px; border: 1px solid var(--brd); width: 80px; font-weight: bold; }
        .f button { background: var(--acc); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: bold; }
        .pt { color: var(--acc); font-family: 'Rajdhani'; font-size: 1.3rem; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      </style></head>
    <body class="dark"><div class="nv">
      <div style="font-family:'Rajdhani'; font-size:24px; font-weight:700;">LOGISV20 <span style="color:var(--acc)">PRO</span></div>
      <button onclick="document.body.classList.toggle('dark')" style="cursor:pointer; padding:8px 15px; border-radius:6px; font-weight:bold;">🌓 MODO</button>
    </div><div class="ts">
      <button class="tb active" onclick="s('m1',this)">📦 CARGAS PENDIENTES (${p.length})</button>
      <button class="tb" onclick="s('m2',this)">⚠️ PENDIENTE POR DESPACHO (${p.length})</button>
      <button class="tb" onclick="s('m3',this)">🚚 VEHÍCULOS EN RUTA (${r.length})</button>
    </div>

    <div id="m1" class="md active">
      <h2 style="font-family:'Rajdhani'">NUEVO REGISTRO DE DESPACHO</h2>
      <form action="/add" method="POST" class="excel-form">
        <select name="empresa" required>
          <option value="">EMPRESA GENERADORA...</option>
          <option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option>
          <option value="PLEXA ESP SAS">PLEXA ESP SAS</option>
          <option value="MAERSK LOGISTICS">MAERSK LOGISTICS</option>
        </select>
        <input name="cliente" placeholder="Nombre Cliente" required>
        <input name="do_bl" placeholder="DO / BL / OC">
        <input name="peso" placeholder="Peso Kg" type="number">
        <select name="origen">
          <option value="CARTAGENA">CARTAGENA</option>
          <option value="BUENAVENTURA">BUENAVENTURA</option>
          <option value="BOGOTÁ">BOGOTÁ</option>
        </select>
        <select name="dest">
          <option value="BOGOTÁ">BOGOTÁ</option>
          <option value="MEDELLÍN">MEDELLÍN</option>
          <option value="CALI">CALI</option>
          <option value="YUMBO">YUMBO</option>
        </select>
        <input name="producto" placeholder="Producto (ej: Polietileno)">
        <button type="submit" class="btn-save">💾 GUARDAR CARGA EN SISTEMA</button>
      </form>

      <div class="tc">
        <table>
          <thead><tr><th>ID</th><th>EMPRESA</th><th>CLIENTE</th><th>REFERENCIA</th><th>RUTA</th><th>PESO</th><th>ESTADO</th></tr></thead>
          <tbody>${p.map(rowP).join('') || '<tr><td colspan="7" style="text-align:center; padding:30px;">SIN REGISTROS</td>

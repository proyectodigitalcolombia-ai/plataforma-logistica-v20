const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  destino: DataTypes.STRING,
  peso: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' },
  gps_password: { type: DataTypes.STRING, defaultValue: '' },
  ultima_latitud: { type: DataTypes.STRING, defaultValue: '4.6097' },
  ultima_longitud: { type: DataTypes.STRING, defaultValue: '-74.0817' },
  fecha_entrega: DataTypes.DATE
});

app.get('/', async (req, res) => {
  try {
    const total = await Carga.count();
    const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });

    let filas = cargas.map(c => `
      <tr class="row-item">
        <td><strong>${c.cliente}</strong></td>
        <td>${c.destino}</td>
        <td><span class="badge ${c.estado.toLowerCase()}">${c.estado}</span></td>
        <td>
          ${c.estado === 'PENDIENTE' ? `
            <form action="/vincular/${c.id}" method="POST" class="form-mini">
              <input name="placa" placeholder="Placa" required>
              <button type="submit">Vincular</button>
            </form>` : `<span class="placa-text">${c.placa}</span>`}
        </td>
      </tr>`).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Logisv20 PRO | Dashboard</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #f0f7ff; --card: #ffffff; --text: #1e293b; --primary: #3b82f6; --border: #e2e8f0; --accent: #60a5fa; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --border: #334155; --primary: #60a5fa; }
        
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; transition: 0.3s; margin: 0; padding: 40px; }
        .container { max-width: 900px; margin: auto; background: var(--card); padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid var(--border); }
        
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .btn-mode { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 14px; }
        
        .stats-bar { background: var(--bg); padding: 15px 25px; border-radius: 15px; display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
        .btn-demo { background: transparent; border: 2px solid var(--primary); color: var(--primary); padding: 8px 15px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 13px; transition: 0.2s; }
        .btn-demo:hover { background: var(--primary); color: white; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; padding: 15px; border-bottom: 2px solid var(--border); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); }
        td { padding: 18px 15px; border-bottom: 1px solid var(--border); }
        
        .badge { padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; color: white; background: #94a3b8; }
        .badge.pendiente { background: #f59e0b; }
        .badge.en-transito { background: #10b981; }

        .form-mini input { border: 1px solid var(--border); background: var(--bg); color: var(--text); padding: 6px 10px; border-radius: 8px; width: 80px; }
        .form-mini button { background: var(--primary); color: white; border: none; padding: 7px 12px; border-radius: 8px; cursor: pointer; margin-left: 5px; }
        
        .placa-text { background: var(--primary); color: white; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0; display:flex; align-items:center; gap:10px;">🚚 Logisv20 PRO</h2>
          <button class="btn-mode" onclick="document.body.classList.toggle('dark')">🌓 Modo Oscuro</button>
        </div>

        <div class="stats-bar">
          <a href="/seed" class="btn-demo">🚀 Cargar Demo</a>
          <span style="font-weight:600; opacity:0.8;">Total Registros: ${total}</span>
        </div>

        <table>
          <thead>
            <tr><th>Cliente</th><th>Destino</th><th>Estado</th><th>Gestión Placa</th></tr>
          </thead>
          <tbody>${filas || '<tr><td colspan="4" style="text-align:center; padding:40px; opacity:0.5;">No hay datos activos

const express = require('express');
const fileUpload = require('express-fileupload');
const { Sequelize, DataTypes } = require('sequelize');

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
  origen: { type: DataTypes.STRING, defaultValue: 'ORIGEN' },
  destino: { type: DataTypes.STRING, defaultValue: 'DESTINO' },
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const pendientes = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'ASC']] });
    const enRuta = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    const rowMapper = (c) => `
      <tr class="data-row">
        <td>#${c.id}</td>
        <td><b>${c.cliente}</b></td>
        <td><div class="route">${c.origen} → ${c.destino}</div></td>
        <td>
          ${c.estado === 'PENDIENTE' ? 
            `<form action="/vincular/${c.id}" method="POST" class="form-mini">
              <input name="placa" placeholder="PLACA" required>
              <button type="submit">DESPACHAR</button>
            </form>` : `<span class="placa-view">🚚 ${c.placa}</span>`}
        </td>
      </tr>`;

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Logisv20 PRO | Terminal</title>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root { 
          --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --accent: #2563eb; --border: #94a3b8; 
        }
        body.dark { 
          --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --accent: #3b82f6; --border: #334155; 
        }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; transition: 0.3s; margin: 0; }
        
        .navbar { background: #fff; padding: 15px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--accent); }
        .nav-buttons { display: flex; gap: 10px; padding: 20px 40px; background: rgba(0,0,0,0.05); }
        
        .tab-btn { 
          background: var(--card); color: var(--text); border: 1px solid var(--border); 
          padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Rajdhani';
          letter-spacing: 1px; transition: 0.2s;
        }
        .tab-btn.active { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

        .module { display: none; padding: 0 40px; animation: fadeIn 0.3s; }
        .module.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .table-container { background: var(--card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th { background: rgba(0,0,0,0.1); padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase; }
        td { padding: 15px; border-bottom: 1px solid var(--border); }
        
        .form-mini input { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 6px; border-radius: 4px; width: 80px; }
        .form-mini button { background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .placa-view { font-family: 'Rajdhani'; font-weight: 700; color: var(--accent); font-size: 1.2rem; }
        .btn-theme { cursor: pointer; padding: 5px 10px; border-radius: 5px; border: 1px solid #000; font-weight: bold; }
      </style>
    </head>
    <body class="dark">
      <div class="navbar">
        <div style="font-family:'Rajdhani'; font-size:24px; font-weight:700;">LOGISV20 <span style="color:var(--accent)">PRO</span></div>
        <button class="btn-theme" onclick="document.body.classList.toggle('dark')">🌓 CAMBIAR MODO</button>
      </div>

      <div class="nav-buttons">
        <button class="tab-btn active" onclick="showModule('pendientes', this)">⚠️ PENDIENTES DE PLACAS</button>
        <button class="tab-btn" onclick="showModule('ruta', this)">🚚 VEHÍCULOS EN RUTA</button>
        <a href="/seed" style="text-decoration:none;" class="tab-btn">➕ CARGAR DATOS DEMO</a>
      </div>

      <div id="

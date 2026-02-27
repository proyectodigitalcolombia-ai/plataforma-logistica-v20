const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');
const axios = require('axios');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN DB (Oregon)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  destino: DataTypes.STRING,
  peso: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: DataTypes.STRING,
  gps_url_api: DataTypes.STRING,
  gps_usuario: DataTypes.STRING,
  gps_password: DataTypes.STRING,
  ultima_latitud: { type: DataTypes.STRING, defaultValue: '4.6097' },
  ultima_longitud: { type: DataTypes.STRING, defaultValue: '-74.0817' },
  ultima_actualizacion: DataTypes.DATE,
  fecha_entrega: DataTypes.DATE
});

// 3. VISTA PROFESIONAL CON DASHBOARD
app.get('/', async (req, res) => {
  const q = req.query.q || ''; // Para el buscador
  
  // Consultas para los indicadores
  const total = await Carga.count();
  const enTransito = await Carga.count({ where: { estado: 'EN TRANSITO' } });
  const entregados = await Carga.count({ where: { estado: 'ENTREGADO' } });

  // Buscador por Placa o Cliente
  const cargas = await Carga.findAll({
    where: {
      [Op.or]: [
        { placa: { [Op.iLike]: `%${q}%` } },
        { cliente: { [Op.iLike]: `%${q}%` } }
      ]
    },
    order: [['createdAt', 'DESC']]
  });

  let filas = cargas.map(c => `
    <tr class="data-row">
      <td><strong>${c.cliente}</strong></td>
      <td>${c.destino}</td>
      <td>${c.peso} Kg</td>
      <td><span class="badge ${c.estado.toLowerCase().replace(/\s/g, '-')}">${c.estado}</span></td>
      <td>
        ${c.estado === 'PENDIENTE' ? `
          <form action="/vincular-gps/${c.id}" method="POST" class="gps-form">
            <input type="text" name="placa" placeholder="Placa" required>
            <input type="password" name="pass" placeholder="Clave GPS" required>
            <button type="submit">Activar</button>
          </form>
        ` : c.estado === 'EN TRANSITO' ? `
          <div class="tracking-box">
            <span class="placa-tag">${c.placa}</span>
            <a href="https://www.google.com/maps?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank" class="map-btn">📍 Mapa</a>
            <form action="/finalizar/${c.id}" method="POST" style="display:inline;">
              <button type="submit" class="btn-finish">Finalizar</button>
            </form>
          </div>
        ` : `<span style="color:#718096; font-size:0.85em;">Finalizado: ${c.fecha_entrega ? c.fecha_entrega.toLocaleDateString() : '-'}</span>`}
      </td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Logisv20 Pro - Dashboard</title>
        <style>
            :root { --bg: #f7fafc; --card: #ffffff; --text: #2d3748; --primary: #3182ce; --border: #e2e8f0; }
            body.dark { --bg: #1a202c; --card: #2d3748; --text: #edf2f7; --border: #4a5568; --primary: #63b3ed; }
            body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; padding: 20px; transition: 0.3s; }
            .container { max-width: 1200px; margin: auto; }
            
            /* Dashboard Stats */
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: var(--card); padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; border-top: 4px solid var(--primary); }
            .stat-card h3 { margin: 0; font-size: 0.9em; opacity: 0.7; }
            .stat-card p { margin: 10px 0 0; font-size: 1.8em; font-weight: bold; color: var(--primary); }

            /* Main Card */
            .main-card { background: var(--card); padding: 25px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            
            .search-bar { width: 100%; max-width: 400px; padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); margin-bottom: 20px; }
            
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 15px; border-bottom: 2px solid var(--border); font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; }
            td { padding: 15px; border-bottom: 1px solid var(--border); }
            
            .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; color: white; }
            .pendiente { background: #ecc94b; } .en-transito { background: #48bb78; } .entregado { background: #a0aec0; }
            
            .btn-report { background: #2f855a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 0.9em; }
            .map-btn { text-decoration: none; background: #ebf8ff; color: #2b6cb0; padding: 4px 8px; border-radius: 5px; font-size: 0.85em; font-weight: bold; }
            .placa-tag { background: #2d3748; color: white; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🚚 Logisv20 <span style="font-weight:300">Control</span></h1>
                <div>
                    <button onclick="document.body.classList.toggle('dark')" style="cursor:pointer; padding:8px; border-radius:5px; border:1px solid var(--border); background:none; color:var(--text);">🌓 Modo</button>
                    <a href="/descargar-reporte" class="btn-report">📊 Reporte Excel</a>
                </div>
            </header>

            <div class="stats-grid">
                <div class="stat-card

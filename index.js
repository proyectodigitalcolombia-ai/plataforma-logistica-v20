const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A BASE DE DATOS
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO DE DATOS
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  origen: { type: DataTypes.STRING, defaultValue: 'POR DEFINIR' },
  destino: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

// 3. VISTA PRINCIPAL (DASHBOARD AGRESIVO)
app.get('/', async (req, res) => {
  try {
    const pendientes = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'ASC']] });
    const enRuta = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    const renderFilas = (lista) => lista.map(c => `
      <tr class="data-row">
        <td class="cell-id">#${c.id}</td>
        <td class="cell-main">
            <div class="client-name"><b>${c.cliente}</b></div>
            <div class="timestamp">Ingreso: ${c.createdAt.toLocaleTimeString()}</div>
        </td>
        <td class="cell-route">
          <div class="route-container">
            <span class="route-point">📍 ${c.origen}</span>
            <span class="route-arrow">→</span>
            <span class="route-point">🏁 ${c.destino}</span>
          </div>
        </td>
        <td>
            ${c.estado === 'PENDIENTE' 
                ? `<span class="status-pill pendiente">ESPERANDO VEHÍCULO</span>` 
                : `<span class="status-pill en-transito">EN MOVIMIENTO</span>`}
        </td>
        <td class="cell-gest">
          ${c.estado === 'PENDIENTE' ? 
            `<form action="/vincular/${c.id}" method="POST" class="action-form">
              <input name="placa" placeholder="PLACA" required maxlength="7">
              <button type="submit" class="btn-activate">DESPACHAR</button>
            </form>` : `<div class="placa-active">🚚 ${c.placa}</div>`}
        </td>
      </tr>`).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Logisv20 | Command Center</title>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #0a0c10; --panel: #151921; --accent: #0070f3; --text: #ffffff; --dim: #94a3b8; --border: #2d3748; --warning: rgba(245, 158, 11, 0.4); }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; padding-bottom: 50px; }
        .top-nav { background: #fff; color: #000; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid var(--accent); }
        .main { padding: 20px 40px; }
        h3 { font-family: 'Rajdhani'; text-transform: uppercase; letter-spacing: 2px; color: var(--accent); margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
        .table-card { background: var(--panel); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden; margin-bottom: 40px; }
        .pending-box { border: 1px solid var(--warning); box-shadow: 0 0 20px rgba(245, 158, 11, 0.15); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e293b; color: var(--dim); padding: 15px; font-size: 11px; text-transform: uppercase; text-align: left; }
        td { padding: 15px; border-bottom: 1px solid var(--border); font-size: 13px; }
        .timestamp { font-size: 10px; color: var(--dim); margin-top: 4px; }
        .route-container { display: flex; align-items: center; gap: 8px; font-family: 'Rajdhani'; font-weight: 600; font-size: 15px; }
        .route-point { background: rgba(255,255,255,0.05); padding: 3px 6px; border-radius: 4px; border: 1px solid var(--border); }
        .status-pill { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid; }
        .pendiente { color: #f59e0b; border-color: #f59e0b; animation: blink 2s infinite; }
        .en-transito { color: #10b981; border-color: #10b981; background: rgba(16,185,129,0.1); }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .action-form input { background: #000; border: 1px solid var(--border); color: #fff; padding: 8px; border-radius: 4px; width: 80px; font-family: 'Rajdhani'; font-weight: bold; }
        .btn-activate { background: var(--accent); color: #fff; border: none; padding: 8px 15px; border-radius: 4px; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 11px; }
        .placa-active { color: #10b981; font-family: 'Rajdhani'; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="top-nav">
        <div style="font-family:'Rajdhani'; font-size:24px; font-weight:700;">LOGISV20 <span style="color:var(--accent)">PRO TERMINAL</span></div>
        <a href="/seed" style="text-decoration:none; color:#000; font-weight:bold; border:2px solid #000; padding:6px 15px; border-radius:6px; font-size:12px;">INJECT TEST DATA</a>
      </div>
      
      <div class="main">
        <h3>⚠️ COLA DE DESPACHO PENDIENTE (${pendientes.length})</h3>
        <div class="table-card pending-box">
          <table>
            <thead>
              <tr><th>REF</th><th>CLIENTE / GENERADOR</th><th>RUTA LOGÍSTICA</th><th>ESTADO CRÍTICO</th><th>GESTIÓN</th></tr>
            </thead>
            <tbody>${renderFilas(pendientes) || '<tr><td colspan="5" style="text-align:center; padding:50px; color:var(--dim);">OPERACIÓN AL DÍA - SIN PENDIENTES</td></tr>'}</tbody>
          </table>
        </div>

        <h3>🚚 MONITOREO EN RUTA (${enRuta.length})</h3>
        <div class="table-card">
          <table>
            <thead>
              <tr><th>REF</th><th>CLIENTE / GENERADOR</th><th>RUTA LOGÍSTICA</th><th>ESTADO</th><th>VEHÍCULO ASIGNADO</th></tr>
            </thead>
            <tbody>${renderFilas(enRuta) || '<tr><td colspan="5" style="text-align:center; padding:50px; color:var(--dim);">ESPERANDO DESPACHOS...</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </body>
    </html>`);
  } catch (e) { res.status(500).send("Error en Terminal: " + e.message); }
});

// 4. ACCIONES
app.get('/seed', async (req, res) => {
  try {
    await Carga.bulkCreate([
      { cliente: 'SARVI LOGÍSTICA', origen: 'CARTAGENA (BOL)', destino: 'FUNZA (CUN)' },
      { cliente: 'DSV AIR & SEA', origen: 'BOGOTA (DC)', destino: 'BUENAVENTURA (VAC)' },
      { cliente: 'ALPINA S.A.', origen: 'SOPÓ (CUN)', destino: 'MEDELLÍN (ANT)' }
    ]);
    res.redirect('/');
  } catch (e) { res.send(e.message); }
});

app.post('/vincular/:id', async (req, res) => {
  try {
    await Carga.update(
      { placa: req.body.placa.toUpperCase(), estado: 'EN TRANSITO' },
      { where: { id: req.params.id } }
    );
    res.redirect('/');
  } catch (e) { res.send(e.message); }
});

// 5. ARRANQUE
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log('🚀 Terminal Pro en línea'));
});

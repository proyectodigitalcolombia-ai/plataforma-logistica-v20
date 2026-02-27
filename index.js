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

// Modelo actualizado con Origen
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  origen: { type: DataTypes.STRING, defaultValue: 'POR DEFINIR' },
  destino: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const total = await Carga.count();
    const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });

    const filas = cargas.map(c => `
      <tr class="data-row">
        <td class="cell-id">#${c.id}</td>
        <td class="cell-main"><b>${c.cliente}</b></td>
        <td class="cell-route">
          <div class="route-container">
            <span class="route-point">📍 ${c.origen}</span>
            <span class="route-arrow">→</span>
            <span class="route-point">🏁 ${c.destino}</span>
          </div>
        </td>
        <td><span class="status-pill ${c.estado.toLowerCase()}">${c.estado}</span></td>
        <td class="cell-gest">
          ${c.estado === 'PENDIENTE' ? 
            `<form action="/vincular/${c.id}" method="POST" class="action-form">
              <input name="placa" placeholder="PLACA" required maxlength="7">
              <button type="submit">ACTIVAR</button>
            </form>` : `<span class="placa-badge">${c.placa}</span>`}
        </td>
      </tr>`).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Logisv20 | Terminal de Control</title>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root { 
          --bg: #0a0c10; --panel: #151921; --accent: #0070f3; 
          --text: #ffffff; --dim: #94a3b8; --border: #2d3748;
        }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; }
        .top-nav { background: #fff; color: #000; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid var(--accent); }
        .main { padding: 30px 40px; }
        .table-card { background: var(--panel); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e293b; color: var(--dim); padding: 15px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
        td { padding: 15px; border-bottom: 1px solid var(--border); font-size: 13px; }
        
        /* Estilo de la Ruta Origen-Destino */
        .route-container { display: flex; align-items: center; gap: 10px; font-family: 'Rajdhani', sans-serif; font-size: 14px; }
        .route-point { background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); }
        .route-arrow { color: var(--accent); font-weight: bold; }

        .status-pill { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; border: 1px solid; }
        .pendiente { color: #f59e0b; border-color: #f59e0b; background: rgba(245,158,11,0.1); }
        .en-transito { color: #10b981; border-color: #10b981; background: rgba(16,185,129,0.1); }
        .placa-badge { background: var(--accent); padding: 4px 10px; border-radius: 4px; font-family: 'Rajdhani'; font-weight: 700; }
        .action-form input { background: #000; border: 1px solid var(--border); color: #fff; padding: 5px; border-radius: 4px; width: 70px; }
        .action-form button { background: var(--accent); color: #fff; border: none; padding: 5px 10px; border-radius: 4px; font-weight: bold; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="top-nav">
        <div style="font-family:'Rajdhani'; font-size:22px; font-weight:700;">LOGISV20 <span style="color:var(--accent)">TERMINAL</span></div>
        <a href="/seed" style="text-decoration:none; color:#000; font-weight:bold; border:1px solid #000; padding:5px 10px; border-radius:4px; font-size:12px;">CARGAR DATOS</a>
      </div>
      <div class="main">
        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>CLIENTE</th>
                <th>RUTA (ORIGEN → DESTINO)</th>
                <th>ESTADO</th>
                <th>GESTIÓN</th>
              </tr>
            </thead>
            <tbody>${filas || '<tr><td colspan="5" style="text-align:center; padding:40px;">SIN ACTIVIDAD REGISTRADA</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </body>
    </html>`);
  } catch (e) { res.status(500).send("Error: " + e.message); }
});

app.get('/seed', async (req, res) => {
  await Carga.bulkCreate([
    { cliente: 'SARVI LOGÍSTICA', origen: 'CARTAGENA (BOL)', destino: 'FUNZA (CUN)' },
    { cliente: 'DSV AIR & SEA', origen: 'BOGOTA (DC)', destino: 'BUENAVENTURA (VAC)' }
  ]);
  res.redirect('/');
});

app.post('/vincular/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa.toUpperCase(), estado: 'EN TRANSITO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => app.listen(PORT));

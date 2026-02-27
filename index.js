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
        <td>${c.destino}</td>
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
      <title>Control Logístico | Pro Terminal</title>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root { 
          --bg-deep: #0a0c10; --panel: #151921; --accent: #0070f3; 
          --text-bright: #ffffff; --text-dim: #94a3b8; --border: #2d3748;
          --success: #10b981; --warning: #f59e0b;
        }
        body { 
          background: var(--bg-deep); color: var(--text-bright); 
          font-family: 'Inter', sans-serif; margin: 0; padding: 0; 
        }
        /* Header estilo Ambipar */
        .top-nav {
          background: #ffffff; color: #000; padding: 10px 40px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 4px solid var(--accent);
        }
        .main-container { padding: 30px 50px; }
        
        /* Dashboard Cards */
        .dash-summary { display: flex; gap: 15px; margin-bottom: 25px; }
        .stat-box { 
          background: var(--panel); padding: 15px 25px; border-radius: 8px;
          border-left: 4px solid var(--accent); min-width: 150px;
        }
        .stat-box small { color: var(--text-dim); text-transform: uppercase; font-size: 11px; font-weight: bold; }
        .stat-box div { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; }

        /* Estilo Tabla Agresivo */
        .table-card { 
          background: var(--panel); border-radius: 12px; 
          overflow: hidden; border: 1px solid var(--border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        table { width: 100%; border-collapse: collapse; }
        th { 
          background: #1e293b; color: var(--text-dim); text-align: left;
          padding: 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;
        }
        td { padding: 15px; border-bottom: 1px solid var(--border); font-size: 14px; }
        .data-row:hover { background: rgba(255,255,255,0.03); }
        
        /* Componentes */
        .status-pill { 
          padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold;
          text-transform: uppercase; border: 1px solid transparent;
        }
        .pendiente { background: rgba(245, 158, 11, 0.1); color: var(--warning); border-color: var(--warning); }
        .placa-badge { 
          background: var(--accent); color: white; padding: 5px 12px; 
          border-radius: 4px; font-family: 'Rajdhani', sans-serif; font-weight: 700;
        }
        .action-form input {
          background: #000; border: 1px solid var(--border); color: white;
          padding: 6px; border-radius: 4px; width: 80px; font-family: 'Rajdhani';
        }
        .action-form button {
          background: var(--accent); color: white; border: none; padding: 6px 12px;
          border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="top-nav">
        <div style="font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700;">
          <span style="color:var(--accent)">LOGISV20</span> TERMINAL PRO
        </div>
        <div>
          <a href="/seed" style="text-decoration:none; font-weight:bold; color:#000; border:1px solid #ccc; padding:5px 15px; border-radius:5px;">TEST DATA</a>
        </div>
      </div>

      <div class="main-container">
        <div class="dash-summary">
          <div class="stat-box"> <small>Vehículos Total</small> <div>${total}</div> </div>
          <div class="stat-box" style="border-color: var(--warning)"> <small>Pendientes</small> <div>${total}</div> </div>
          <div class="stat-box" style="border-color: var(--success)"> <small>En Ruta</small> <div>0</div> </div>
        </div>

        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>CLIENTE / GENERADOR</th>
                <th>DESTINO FINAL</th>
                <th>ESTADO ACTUAL</th>
                <th>GESTIÓN DE TRÁFICO</th>
              </tr>
            </thead>
            <tbody>${filas || '<tr><td colspan="5" style="text-align:center; padding:50px; color:var(--text-dim);">SISTEMA A LA ESPERA DE DATOS...</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </body>
    </html>`);
  } catch (e) { res.status(500).send("Critical Error: " + e.message); }
});

app.get('/seed', async (req, res) => {
  await Carga.bulkCreate([
    { cliente: 'DSV AIR & SEA S.A.S', destino: 'FUNZA (CUN)' },
    { cliente: 'LOGIMPEX OTM SAS', destino: 'BUENAVENTURA (VAC)' },
    { cliente: 'ABC CARGO EXPRESS', destino: 'BOGOTA (DC)' }
  ]);
  res.redirect('/');
});

app.post('/vincular/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa.toUpperCase(), estado: 'EN TRANSITO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => app.listen(PORT));

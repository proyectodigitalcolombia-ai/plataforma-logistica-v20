const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A BD
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  destino: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

// 3. RUTA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    const total = await Carga.count();
    const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });

    const filas = cargas.map(c => {
      return `
      <tr>
        <td><b>${c.cliente}</b></td>
        <td>${c.destino}</td>
        <td><span class="badge ${c.estado.toLowerCase()}">${c.estado}</span></td>
        <td>
          ${c.estado === 'PENDIENTE' ? 
            `<form action="/vincular/${c.id}" method="POST" style="display:inline;">
              <input name="placa" placeholder="Placa" required style="width:70px;">
              <button type="submit">Ir</button>
            </form>` : `<span>${c.placa}</span>`}
        </td>
      </tr>`;
    }).join('');

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Logisv20 PRO</title>
      <style>
        :root { --bg: #f0f7ff; --card: #ffffff; --text: #1e293b; --primary: #3b82f6; --border: #e2e8f0; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --border: #334155; }
        body { background: var(--bg); color: var(--text); font-family: sans-serif; padding: 30px; transition: 0.3s; }
        .container { max-width: 800px; margin: auto; background: var(--card); padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid var(--border); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .btn-mode { background: var(--primary); color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid var(--border); color: var(--primary); font-size: 13px; }
        td { padding: 12px; border-bottom: 1px solid var(--border); }
        .badge { padding: 3px 8px; border-radius: 5px; font-size: 10px; color: white; font-weight: bold; }
        .pendiente { background: #f59e0b; }
        .en-transito { background: #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🚚 Logisv20 PRO</h2>
          <button class="btn-mode" onclick="document.body.classList.toggle('dark')">🌓 Modo</button>
        </div>
        <div style="margin-bottom:20px;">
          <a href="/seed" style="text-decoration:none; color:var(--primary); font-weight:bold;">🚀 Cargar Demo</a>
          <span style="margin-left:20px; opacity:0.7;">Total: ${total}</span>
        </div>
        <table>
          <thead><tr><th>Cliente</th><th>Destino</th><th>Estado</th><th>Gestión</th></tr></thead>
          <tbody>${filas || '<tr><td colspan="4" style="text-align:center; padding:20px;">Sin datos</td></tr>'}</tbody>
        </table>
      </div>
    </body>
    </html>`);
  } catch (e) { res.status(500).send("Error: " + e.message); }
});

// 4. ACCIONES
app.get('/seed', async (req, res) => {
  await Carga.bulkCreate([{ cliente: 'Eurofarma', destino: 'Bogotá' }, { cliente: 'Alpina', destino: 'Cali' }]);
  res.redirect('/');
});

app.post('/vincular/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa, estado: 'EN TRANSITO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

// 5. INICIO
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log('Servidor listo'));
});

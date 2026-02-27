const express = require('express');
const fileUpload = require('express-fileupload');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  origen: { type: DataTypes.STRING, defaultValue: 'ORIGEN' },
  destino: { type: DataTypes.STRING, defaultValue: 'DESTINO' },
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

// 3. RUTA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    const pendientes = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'ASC']] });
    const enRuta = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    const rowMapper = (c) => `
      <tr class="data-row">
        <td>#${c.id}</td>
        <td><b>${c.cliente}</b></td>
        <td><div style="font-family:'Rajdhani'; font-weight:600;">${c.origen} → ${c.destino}</div></td>
        <td>
          ${c.estado === 'PENDIENTE' ? 
            `<form action="/vincular/${c.id}" method="POST" style="display:flex; gap:5px;">
              <input name="placa" placeholder="PLACA" required maxlength="7" style="width:70px; padding:5px; border-radius:4px; border:1px solid #94a3b8; background:white; color:black;">
              <button type="submit" style="background:#2563eb; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:10px;">DESPACHAR</button>
            </form>` : `<span style="font-family:'Rajdhani'; font-weight:700; color:#2563eb; font-size:1.2rem;">🚚 ${c.placa}</span>`}
        </td>
      </tr>`;

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"><title>Logisv20 PRO</title>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --accent: #2563eb; --border: #94a3b8; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --accent: #3b82f6; --border: #334155; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; transition: 0.3s; margin: 0; }
        .nav { background: #fff; padding: 15px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--accent); align-items: center; }
        .tabs { display: flex; gap: 10px; padding: 20px 40px; background: rgba(0,0,0,0.05); }
        .tab-btn { background: var(--card); color: var(--text); border: 1px solid var(--border); padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Rajdhani'; letter-spacing: 1px; }
        .tab-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
        .module { display: none; padding: 0 40px; }
        .module.active { display: block; }
        .table-container { background: var(--card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th { background: rgba(0,0,0,0.05); padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase; }
        td { padding: 15px; border-bottom: 1px solid var(--border); }
      </style>
    </head>
    <body class="dark">
      <div class="nav">
        <div style="font-family:'Rajdhani'; font-size:24px; font-weight:700;">LOGISV20 <span style="color:var(--accent)">PRO</span></div>
        <button onclick="document.body.classList.toggle('dark')" style="cursor:pointer; padding:8px 15px; font-weight:bold; border-radius:6px; background:white; color:black;">🌓 MODO CLARO / OSCURO</button>
      </div>
      <div class="tabs">
        <button class="tab-btn active" onclick="show('pendientes', this)">⚠️ PENDIENTES DE PLACAS</button>
        <button class="tab-btn" onclick="show('ruta', this)">🚚 VEHÍCULOS EN RUTA</button>
        <a href="/seed" class="tab-btn" style="text-decoration:none;">➕ CARGAR DEMO</a>
      </div>
      <div id="pendientes" class="module active">
        <h3>LISTA DE DESPACHO PENDIENTE</h3>
        <div class="table-container"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>RUTA</th><th>ACCIÓN</th></tr></thead>
        <tbody>${pendientes.map(rowMapper).join('') || '<tr><td colspan="4" style="text-align:center; padding:30px;">SIN PENDIENTES</td></tr>'}</tbody></table></div>
      </div>
      <div id="ruta" class="module">
        <h3>VEHÍCULOS ACTIVOS EN RUTA</h3>
        <div class="table-container"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>RUTA</th><th>PLACA</th></tr></thead>
        <tbody>${enRuta.map(rowMapper).join('') || '<tr><td colspan="4" style="text-align:center; padding:30px;">SIN VEHÍCULOS EN RUTA</td></tr>'}</tbody></table></div>
      </div>
      <script>
        function show(id, btn) {
          document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          document.getElementById(id).classList.add('active');
          btn.classList.add('active');
        }
      </script>
    </body></html>`);
  } catch (e) { res.status(500).send(e.message); }
});

app.post('/vincular/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa.toUpperCase(), estado: 'EN TRANSITO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

app.get('/seed', async (req, res) => {
  await Carga.bulkCreate([
    { cliente: 'AMBIPAR SAS', origen: 'BOGOTÁ', destino: 'CARTAGENA' },
    { cliente: 'SARVI LTDA', origen: 'MEDELLÍN', destino: 'CALI' }
  ]);
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => app.listen(PORT, () => console.log('Servidor OK')));

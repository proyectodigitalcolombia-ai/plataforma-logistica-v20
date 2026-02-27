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
    const todosPendientes = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'ASC']] });
    const enRuta = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    const filaBasica = (c) => `<tr class="data-row"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td>${c.origen} → ${c.destino}</td><td><span class="badge-p">ESPERANDO ACCIÓN</span></td></tr>`;
    
    const filaGestion = (c) => `
      <tr class="data-row">
        <td>#${c.id}</td>
        <td><b>${c.cliente}</b></td>
        <td><form action="/vincular/${c.id}" method="POST" style="display:flex; gap:5px;">
          <input name="placa" placeholder="PLACA" required maxlength="7" class="input-table">
          <button type="submit" class="btn-go">DESPACHAR</button>
        </form></td>
      </tr>`;

    const filaRuta = (c) => `<tr class="data-row"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td>${c.origen} → ${c.destino}</td><td><b class="placa-text">🚚 ${c.placa}</b></td></tr>`;

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"><title>Logisv20 Control</title>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --accent: #2563eb; --border: #94a3b8; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --accent: #3b82f6; --border: #334155; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; transition: 0.3s; }
        .nav { background: #fff; padding: 15px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--accent); align-items: center; }
        .tabs { display: flex; gap: 8px; padding: 20px 40px; background: rgba(0,0,0,0.05); flex-wrap: wrap; }
        .tab-btn { background: var(--card); color: var(--text); border: 1px solid var(--border); padding: 12px 18px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Rajdhani'; letter-spacing: 1px; font-size: 13px; }
        .tab-btn.active { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .module { display: none; padding: 0 40px; animation: fadeIn 0.2s; }
        .module.active { display: block; }
        .table-container { background: var(--card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: rgba(0,0,0,0.05); padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase; }
        td { padding: 15px; border-bottom: 1px solid var(--border); }
        .input-table { padding: 6px; border-radius: 4px; border: 1px solid var(--border); width: 80px; font-weight: bold; }
        .btn-go { background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 10px; }
        .placa-text { color: var(--accent); font-family: 'Rajdhani'; font-size: 1.2rem; }
        .badge-p { background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      </style>
    </head>
    <body class="dark">
      <div class="nav">
        <div style="font-family:'Rajdhani'; font-size:24px; font-weight:700;">LOGISV20 <span style="color:var(--accent)">PRO</span></div>
        <button onclick="document.body.classList.toggle('dark')" style="cursor:pointer; padding:8px 15px; font-weight:bold; border-radius:6px;">🌓 MODO LUZ/NOCHE</button>
      </div>
      <div class="tabs">
        <button class="tab-btn active" onclick="show('mod-cargas', this)">📦 CARGAS PENDIENTES</button>
        <button class="tab-btn" onclick="show('mod-placas', this)">⚠️ PENDIENTES DE PLACAS</button>
        <button class="tab-btn" onclick="show('mod-ruta', this)">🚚 VEHÍCULOS EN RUTA</button>
        <a href="/seed" class="tab-btn" style="text-decoration:none; background:#10b981; color:white;">➕ SEED</a>
      </div>

      <div id="mod-cargas" class="module active">
        <h3>BANDEJA DE ENTRADA (TOTAL PENDIENTE)</h3>
        <div class="table-container"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>RUTA</th><th>ESTADO</th></tr></thead>
        <tbody>${todosPendientes.map(filaBasica).join('') || '<tr><td colspan="4" style="text-align:center; padding:30px;">NO HAY CARGAS</td></tr>'}</tbody></table></div>
      </div>

      <div id="mod-placas" class="module">
        <h3>ASIGNACIÓN OPERATIVA DE VEHÍCULOS</h3>
        <div class="table-container"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>VINCULAR PLACA</th></tr></thead>
        <tbody>${todosPendientes.map(filaGestion).join('') || '<tr><td colspan="3" style="text-align:center; padding:30px;">TODO DESPACHADO</td></tr>'}</tbody></table></div>
      </div>

      <div id="mod-ruta" class="module">
        <h3>MONITOREO DE FLOTA EN TRÁNSITO</h3>
        <div class="table-container"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>TRAYECTO</th><th>VEHÍCULO</th></tr></thead>
        <tbody>${enRuta.map(filaRuta).join('') || '<tr><td colspan="4" style="text-align:center; padding:30px;">SIN ACTIVIDAD</td></tr>'}</tbody></table></div>
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
    { cliente: 'AMBIPAR SAS', origen: 'BOGOTÁ', destino: 'CALI' },
    { cliente: 'SARVI LTDA', origen: 'CARTAGENA', destino: 'MEDELLÍN' }
  ]);
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => app.listen(PORT, () => console.log('Servidor OK')));

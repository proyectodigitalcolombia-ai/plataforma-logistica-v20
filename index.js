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

const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING, origen: { type: DataTypes.STRING, defaultValue: 'BOGOTÁ' },
  destino: { type: DataTypes.STRING, defaultValue: 'DESTINO' },
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const p = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'ASC']] });
    const r = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    const rowP = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td>${c.origen}→${c.destino}</td><td><span class="l lr"></span> <small>STOP</small></td></tr>`;
    const rowD = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td><form action="/vink/${c.id}" method="POST" class="f"><span class="l lr"></span><input name="placa" placeholder="PLACA" required maxlength="7"><button type="submit">GO</button></form></td></tr>`;
    const rowR = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td>${c.origen}→${c.destino}</td><td><span class="l lg"></span> <b class="pt">${c.placa}</b></td></tr>`;

    res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --acc: #2563eb; --brd: #94a3b8; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --acc: #3b82f6; --brd: #334155; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; transition: 0.3s; }
        .l { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .lr { background: #ef4444; box-shadow: 0 0 8px #ef4444; animation: b 1.5s infinite; }
        .lg { background: #10b981; box-shadow: 0 0 8px #10b981; }
        @keyframes b { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .nv { background: #fff; padding: 10px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--acc); align-items: center; }
        .ts { display: flex; gap: 8px; padding: 20px 40px; background: rgba(0,0,0,0.05); }
        .tb { background: var(--card); color: var(--text); border: 1px solid var(--brd); padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Rajdhani'; }
        .tb.active { background: var(--acc); color: white; border-color: var(--acc); }
        .md { display: none; padding: 0 40px; } .md.active { display: block; }
        .tc { background: var(--card); border-radius: 12px; border: 1px solid var(--brd); overflow: hidden; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; } th { background: rgba(0,0,0,0.05); padding: 15px; text-align: left; font-size: 11px; color: var(--acc); }
        td { padding: 15px; border-bottom: 1px solid var(--brd); font-size: 13px; }
        .f input { padding: 6px; border-radius: 4px; border: 1px solid var(--brd); width: 80px; font-weight: bold; }
        .f button { background: var(--acc); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: bold; }
        .pt { color: var(--acc); font-family: 'Rajdhani'; font-size: 1.3rem; }
      </style></head>
    <body class="dark"><div class="nv">
      <div style="font-family:'Rajdhani'; font-size:24px; font-weight:700;">LOGISV20 <span style="color:var(--acc)">COMMAND</span></div>
      <button onclick="document.body.classList.toggle('dark')" style="cursor:pointer; padding:8px 15px; border-radius:6px; font-weight:bold;">🌓 MODO</button>
    </div><div class="ts">
      <button class="tb active" onclick="s('m1',this)">📦 CARGAS (${p.length})</button>
      <button class="tb" onclick="s('m2',this)">⚠️ DESPACHO (${p.length})</button>
      <button class="tb" onclick="s('m3',this)">🚚 EN RUTA (${r.length})</button>
      <a href="/seed" class="tb" style="text-decoration:none; background:#10b981; color:white; border:none;">➕ DATOS</a>
    </div>
    <div id="m1" class="md active"><h3>CARGAS PENDIENTES</h3><div class="tc"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>RUTA</th><th>ESTADO</th></tr></thead><tbody>${p.map(rowP).join('')||'<td>-</td>'}</tbody></table></div></div>
    <div id="m2" class="md"><h3>PENDIENTE POR DESPACHO</h3><div class="tc"><table><thead><tr><th>ID</th><th>GENERADOR</th><th>ASIGNAR</th></tr></thead><tbody>${p.map(rowD).join('')||'<td>-</td>'}</tbody></table></div></div>
    <div id="m3" class="md"><h3>VEHÍCULOS EN RUTA</h3><div class="tc"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>RUTA</th><th>PLACA</th></tr></thead><tbody>${r.map(rowR).join('')||'<td>-</td>'}</tbody></table></div></div>
    <script>function s(id,b){document.querySelectorAll('.md').forEach(m=>m.classList.remove('active'));document.querySelectorAll('.tb').forEach(t=>t.classList.remove('active'));document.getElementById(id).classList.add('active');b.classList.add('active');}</script>
    </body></html>`);
  } catch (e) { res.status(500).send(e.message); }
});

app.post('/vink/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa.toUpperCase(), estado: 'EN TRANSITO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

app.get('/seed', async (req, res) => {
  await Carga.bulkCreate([{ cliente: 'AMBIPAR', origen: 'BOG', destino: 'CTG' },{ cliente: 'SARVI', origen: 'CLO', destino: 'MDE' }]);
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => app.listen(PORT));

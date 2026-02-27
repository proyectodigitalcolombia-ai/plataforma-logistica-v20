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

// Modelo ampliado basado en tu Excel
const Carga = sequelize.define('Carga', {
  empresa: DataTypes.STRING,
  comercial: DataTypes.STRING,
  do_bl: DataTypes.STRING, // DO / BL / OC
  cliente: DataTypes.STRING,
  subcliente: DataTypes.STRING,
  origen: { type: DataTypes.STRING, defaultValue: 'CARTAGENA' },
  destino: { type: DataTypes.STRING, defaultValue: 'BOGOTÁ' },
  tipo_vehiculo: DataTypes.STRING,
  producto: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const p = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'DESC']] });
    const r = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    // Renderizado del Módulo 1 (Estilo Excel editable)
    const renderExcelRow = (c) => `
      <tr class="dr">
        <td>#${c.id}</td>
        <td><input type="text" value="${c.empresa || ''}" readonly></td>
        <td><input type="text" value="${c.cliente || ''}" readonly></td>
        <td>${c.origen} → ${c.destino}</td>
        <td><span class="l lr"></span> ESPERANDO</td>
      </tr>`;

    // Renderizado del Módulo 2 (Despacho)
    const rowD = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td><form action="/vink/${c.id}" method="POST" class="f"><input name="placa" placeholder="PLACA" required><button type="submit">GO</button></form></td></tr>`;

    // Renderizado del Módulo 3 (Ruta)
    const rowR = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td><span class="l lg"></span> <b class="pt">${c.placa}</b></td></tr>`;

    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --acc: #2563eb; --brd: #94a3b8; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --acc: #3b82f6; --brd: #334155; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; }
        .nv { background: #fff; padding: 10px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--acc); align-items: center; }
        .ts { display: flex; gap: 8px; padding: 20px 40px; background: rgba(0,0,0,0.05); }
        .tb { background: var(--card); color: var(--text); border: 1px solid var(--brd); padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Rajdhani'; }
        .tb.active { background: var(--acc); color: white; border-color: var(--acc); }
        .md { display: none; padding: 0 40px; } .md.active { display: block; }
        .tc { background: var(--card); border-radius: 12px; border: 1px solid var(--brd); overflow: auto; max-height: 60vh; }
        table { width: 100%; border-collapse: collapse; min-width: 800px; }
        th { background: rgba(0,0,0,0.05); padding: 12px; text-align: left; font-size: 11px; sticky; top: 0; }
        td { border-bottom: 1px solid var(--brd); padding: 5px 12px; }
        input, select { background: transparent; border: none; color: inherit; width: 100%; padding: 8px; font-family: inherit; }
        input:focus { background: rgba(37,99,235,0.1); outline: none; }
        .form-new { background: var(--card); padding: 20px; border-radius: 12px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; border: 1px solid var(--acc); }
        .btn-add { grid-column: span 4; background: var(--acc); color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .l { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .lr { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
        .lg { background: #10b981; box-shadow: 0 0 8px #10b981; }
      </style></head>
    <body class="dark"><div class="nv">
      <div style="font-family:'Rajdhani'; font-size:24px; font-weight:700;">LOGISV20 <span style="color:var(--acc)">COMMAND</span></div>
      <button onclick="document.body.classList.toggle('dark')" style="cursor:pointer; padding:8px 15px; border-radius:6px; font-weight:bold;">🌓 MODO</button>
    </div>
    <div class="ts">
      <button class="tb active" onclick="s('m1',this)">📦 CARGAS PENDIENTES (${p.length})</button>
      <button class="tb" onclick="s('m2',this)">⚠️ POR DESPACHO (${p.length})</button>
      <button class="tb" onclick="s('m3',this)">🚚 EN RUTA (${r.length})</button>
    </div>

    <div id="m1" class="md active">
      <h3>DIGITACIÓN MANUAL DE CARGA</h3>
      <form action="/add" method="POST" class="form-new">
        <input name="empresa" placeholder="Empresa Generadora" required>
        <input name="cliente" placeholder="Cliente" required>
        <select name="origen">
            <option value="CARTAGENA">CARTAGENA</option>
            <option value="BARRANQUILLA">BARRANQUILLA</option>
            <option value="BUENAVENTURA">BUENAVENTURA</option>
        </select>
        <select name="destino">
            <option value="BOGOTÁ">BOGOTÁ</option>
            <option value="MEDELLÍN">MEDELLÍN</option>
            <option value="CALI">CALI</option>
        </select>
        <button type="submit" class="btn-add">➕ REGISTRAR NUEVA CARGA EN TABLA</button>
      </form>
      <div class="tc">
        <table>
          <thead><tr><th>ID</th><th>EMPRESA</th><th>CLIENTE</th><th>TRAYECTO</th><th>ESTADO</th></tr></thead>
          <tbody>${p.map(renderExcelRow).join('')}</tbody>
        </table>
      </div>
    </div>

    <div id="m2" class="md">
      <h3>PENDIENTE POR DESPACHO</h3>
      <div class="tc"><table><thead><tr><th>ID</th><th>GENERADOR</th><th>ASIGNAR</th></tr></thead><tbody>${p.map(rowD).join('')}</tbody></table></div>
    </div>

    <div id="m3" class="md">
      <h3>VEHÍCULOS EN RUTA</h3>
      <div class="tc"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>RUTA</th><th>PLACA</th></tr></thead><tbody>${r.map(rowR).join('')}</tbody></table></div>
    </div>

    <script>function s(id,b){document.querySelectorAll('.md').forEach(m=>m.classList.remove('active'));document.querySelectorAll('.tb').forEach(t=>t.classList.remove('active'));document.getElementById(id).classList.add('active');b.classList.add('active');}</script>
    </body></html>`);
  } catch (e) { res.status(500).send(e.message); }
});

app.post('/add', async (req, res) => {
  await Carga.create(req.body);
  res.redirect('/');
});

app.post('/vink/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa.toUpperCase(), estado: 'EN TRANSITO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => app.listen(PORT));

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

// Modelo 100% basado en tu Excel de Control de Despachos
const Carga = sequelize.define('Carga', {
  empresa: DataTypes.STRING,
  comercial: DataTypes.STRING,
  do_bl: DataTypes.STRING,
  cliente: DataTypes.STRING,
  peso: DataTypes.STRING,
  origen: { type: DataTypes.STRING, defaultValue: 'CARTAGENA' },
  dest: { type: DataTypes.STRING, defaultValue: 'BOGOTÁ' },
  despachador: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const p = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'DESC']] });
    const r = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    const rowP = (c) => `
      <tr class="dr">
        <td style="color:var(--acc); font-weight:bold;">#${c.id}</td>
        <td><b>${c.empresa}</b><br><small>${c.comercial}</small></td>
        <td>${c.cliente}<br><small>Ref: ${c.do_bl || 'N/A'}</small></td>
        <td>${c.origen} → ${c.dest}</td>
        <td>${c.peso} kg</td>
        <td><div style="display:flex; align-items:center; gap:10px;"><span class="l lr"></span> <a href="/del/${c.id}" class="btn-del">BORRAR</a></div></td>
      </tr>`;

    const rowD = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td><form action="/vink/${c.id}" method="POST" class="f"><input name="placa" placeholder="PLACA" required maxlength="7"><button type="submit">DESPACHAR</button></form></td></tr>`;
    const rowR = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td>${c.origen}→${c.dest}</td><td><span class="l lg"></span> <b class="pt">${c.placa}</b></td></tr>`;

    res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --acc: #2563eb; --brd: #94a3b8; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --acc: #3b82f6; --brd: #334155; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; transition: 0.3s; }
        .nv { background: #fff; padding: 10px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--acc); align-items: center; }
        .ts { display: flex; gap: 8px; padding: 20px 40px; background: rgba(0,0,0,0.05); }
        .tb { background: var(--card); color: var(--text); border: 1px solid var(--brd); padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Rajdhani'; transition: 0.2s; font-size: 13px; }
        .tb.active { background: var(--acc); color: white; border-color: var(--acc); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .md { display: none; padding: 0 40px; animation: fIn 0.3s; } .md.active { display: block; }
        
        .form-pro { background: var(--card); padding: 25px; border-radius: 12px; border: 2px solid var(--acc); margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
        .form-pro input, .form-pro select { background: white; border: 1px solid var(--brd); padding: 10px; border-radius: 6px; font-size: 12px; }
        .btn-add { grid-column: 1 / -1; background: var(--acc); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Rajdhani'; letter-spacing: 1px; }
        
        .tc { background: var(--card); border-radius: 12px; border: 1px solid var(--brd); overflow: auto; max-height: 450px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: rgba(0,0,0,0.05); padding: 15px; text-align: left; font-size: 10px; text-transform: uppercase; color: var(--acc); position: sticky; top: 0; }
        td { padding: 12px 15px; border-bottom: 1px solid var(--brd); font-size: 13px; }
        .btn-del { color: #ef4444; text-decoration: none; font-size: 10px; font-weight: bold; border: 1px solid #ef4444; padding: 2px 5px; border-radius: 4px; }
        
        .l { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .lr { background: #ef4444; box-shadow: 0 0 8px #ef4444; animation: b 1.5s infinite; }
        .lg { background: #10b981; box-shadow: 0 0 8px #10b981; }
        @keyframes b { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .f input { padding: 6px; border-radius: 4px; border: 1px solid var(--brd); width: 80px; }
        .f button { background: var(--acc); color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 10px; cursor: pointer; }
        .pt { color: var(--acc); font-family: 'Rajdhani'; font-size: 1.3rem; }
        @keyframes fIn { from { opacity: 0; } to { opacity: 1; } }
      </style></head>
    <body class="dark"><div class="nv">
      <div style="font-family:'Rajdhani'; font-size:24px; font-weight:700;">LOGISV20 <span style="color:var(--acc)">COMMAND</span></div>
      <button onclick="document.body.classList.toggle('dark')" style="cursor:pointer; padding:8px 15px; border-radius:6px; font-weight:bold;">🌓 MODO</button>
    </div><div class="ts">
      <button class="tb active" onclick="s('m1',this)">📦 CARGAS PENDIENTES (${p.length})</button>
      <button class="tb" onclick="s('m2',this)">⚠️ PENDIENTE POR DESPACHO (${p.length})</button>
      <button class="tb" onclick="s('m3',this)">🚚 EN RUTA (${r.length})</button>
    </div>

    <div id="m1" class="md active">
      <h3>REGISTRO MANUAL DE DESPACHOS</h3>
      <form action="/add" method="POST" class="form-pro">
        <select name="empresa" required>
          <option value="">GENERADORA...</option>
          <option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option>
          <option value="PLEXA ESP SAS">PLEXA ESP SAS</option>
          <option value="MAERSK LOGISTICS">MAERSK LOGISTICS</option>
        </select>
        <select name="comercial">
          <option value="RAÚL LÓPEZ">RAÚL LÓPEZ</option>
          <option value="ZULEIMA RIASCOS">ZULEIMA RIASCOS</option>
        </select>
        <input name="cliente" placeholder="Nombre Cliente" required>
        <input name="do_bl" placeholder="DO / BL / OC">
        <input name="peso" placeholder="Peso Kg" type="number">
        <select name="origen">
          <option value="CARTAGENA">CARTAGENA</option>
          <option value="BUENAVENTURA">BUENAVENTURA</option>
          <option value="BOGOTÁ">BOGOTÁ</option>
        </select>
        <select name="dest">
          <option value="BOGOTÁ">BOGOTÁ</option>
          <option value="MEDELLÍN">MEDELLÍN</option>
          <option value="CALI">CALI</option>
          <option value="YUMBO">YUMBO</option>
        </select>
        <select name="despachador">
          <option value="">DESPACHADOR...</option>
          <option value="ABNNER MARTINEZ">ABNNER MARTINEZ</option>
          <option value="CAMILO TRIANA">CAMILO TRIANA</option>
          <option value="OSCAR CHACON">OSCAR CHACON</option>
        </select>
        <button type="submit" class="btn-add">💾 REGISTRAR CARGA Y ASIGNAR A COLA</button>
      </form>
      <div class="tc">
        <table>
          <thead><tr><th>ID</th><th>EMPRESA/COMERCIAL</th><th>CLIENTE/REF</th><th>RUTA</th><th>PESO</th><th>GESTIÓN</th></tr></thead>
          <tbody>${p.map(rowP).join('') || '<tr><td colspan="6" style="text-align:center;">Bandeja vacía</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div id="m2" class="md">
      <h3>ASIGNACIÓN OPERATIVA</h3>
      <div class="tc"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>ASIGNAR PLACA</th></tr></thead><tbody>${p.map(rowD).join('')}</tbody></table></div>
    </div>

    <div id="m3" class="md">
      <h3>MONITOREO DE FLOTA</h3>
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

app.get('/del/:id', async (req, res) => {
  await Carga.destroy({ where: { id: req.params.id } });
  res.redirect('/');
});

app.post('/vink/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa.toUpperCase(), estado: 'EN TRANSITO' }, { where: { id: req.params.id } });
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => app.listen(PORT));

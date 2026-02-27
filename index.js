const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

const C = db.define('Carga', {
  empresa: DataTypes.STRING, comercial: DataTypes.STRING, cliente: DataTypes.STRING,
  subcliente: DataTypes.STRING, do_bl: DataTypes.STRING, peso: DataTypes.STRING,
  origen: DataTypes.STRING, dest: DataTypes.STRING, tipo_v: DataTypes.STRING,
  despachador: DataTypes.STRING, placa: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
});

app.get('/', async (req, res) => {
  const p = await C.findAll({ where: { estado: 'PENDIENTE' } });
  const r = await C.findAll({ where: { estado: 'EN TRANSITO' } });
  res.send(`<html><head><style>body{background:#0f172a;color:#fff;font-family:sans-serif}table{width:100%;border-collapse:collapse;margin-top:10px}th{background:#3b82f6;padding:8px}td{border:1px solid #334155;padding:8px;font-size:12px}.f{background:#1e293b;padding:15px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}</style></head><body>
    <h3>LOGISV20 - REGISTRO</h3>
    <form action="/a" method="POST" class="f">
      <input name="empresa" placeholder="Empresa" required><input name="cliente" placeholder="Cliente" required>
      <input name="subcliente" placeholder="Subcliente"><input name="do_bl" placeholder="DO/BL">
      <input name="peso" placeholder="Kg"><input name="despachador" placeholder="Despachador">
      <select name="origen"><option>CARTAGENA</option><option>BUENAVENTURA</option></select>
      <select name="dest"><option>BOGOTÁ</option><option>MEDELLÍN</option></select>
      <button style="grid-column:1/-1;background:#3b82f6;color:#fff;padding:10px">GUARDAR</button>
    </form>
    <h4>PENDIENTES (${p.length})</h4>
    <table><thead><tr><th>ID</th><th>CLIENTE</th><th>RUTA</th><th>DESPACHAR</th></tr></thead>
    <tbody>${p.map(c=>`<tr><td>${c.id}</td><td>${c.cliente}</td><td>${c.origen}-${c.dest}</td><td><form action="/g/${c.id}" method="POST"><input name="placa" placeholder="PLACA" required><button>GO</button><a href="/d/${c.id}" style="color:red;margin-left:10px">X</a></form></td></tr>`).join('')}</tbody></table>
    <h4>EN RUTA (${r.length})</h4>
    <table><thead><tr><th>PLACA</th><th>CLIENTE</th><th>DESPACHADOR</th></tr></thead>
    <tbody>${r.map(c=>`<tr><td>${c.placa}</td><td>${c.cliente}</td><td>${c.despachador}</td></tr>`).join('')}</tbody></table>
  </body></html>`);
});

app.post('/a', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/g/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), estado: 'EN TRANSITO' }, { where: { id: req.params.id } }); res.redirect('/'); });

db.sync({ alter: true }).then(() => { app.listen(3000); });

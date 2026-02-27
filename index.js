const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');
const axios = require('axios');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A POSTGRES 17 (Render)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO DE DATOS
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  destino: DataTypes.STRING,
  peso: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: DataTypes.STRING,
  gps_url_api: DataTypes.STRING,
  gps_usuario: DataTypes.STRING,
  gps_password: DataTypes.STRING,
  ultima_latitud: { type: DataTypes.STRING, defaultValue: '4.6097' },
  ultima_longitud: { type: DataTypes.STRING, defaultValue: '-74.0817' },
  ultima_actualizacion: DataTypes.DATE,
  fecha_entrega: DataTypes.DATE
});

// 3. VISTA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const total = await Carga.count();
    const enTransito = await Carga.count({ where: { estado: 'EN TRANSITO' } });
    const entregados = await Carga.count({ where: { estado: 'ENTREGADO' } });

    const cargas = await Carga.findAll({
      where: {
        [Op.or]: [
          { placa: { [Op.iLike]: `%${q}%` } },
          { cliente: { [Op.iLike]: `%${q}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    let filas = cargas.length > 0 ? cargas.map(c => `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px;"><strong>${c.cliente}</strong></td>
        <td>${c.destino}</td>
        <td>${c.peso}</td>
        <td><span style="padding:4px 8px; border-radius:12px; color:white; font-size:11px; background:${c.estado === 'PENDIENTE' ? '#f59e0b' : c.estado === 'EN TRANSITO' ? '#10b981' : '#94a3b8'}">${c.estado}</span></td>
        <td>
          ${c.estado === 'PENDIENTE' ? `
            <form action="/vincular-gps/${c.id}" method="POST">
              <input type="text" name="placa" placeholder="Placa" required style="width:60px;">
              <button type="submit">Activar</button>
            </form>` : 
            c.estado === 'EN TRANSITO' ? `
            <a href="http://maps.google.com/?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank">📍 Ver</a>
            <form action="/finalizar/${c.id}" method="POST" style="display:inline;">
              <button type="submit" style="color:red; cursor:pointer;">Finalizar</button>
            </form>` : '✅ Entregado'}
        </td>
      </tr>`).join('') : '<tr><td colspan="5" style="text-align:center; padding:20px;">No hay datos. <a href="/seed">Cargar Demo</a></td></tr>';

    res.send(`
      <body style="font-family:sans-serif; background:#f8fafc; color:#1e293b; padding:20px;">
        <div style="max-width:1000px; margin:auto; background:white; padding:20px; border-radius:12px; shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>🚚 Logisv20 PRO</h2>
            <button onclick="document.body.style.filter = document.body.style.filter === 'invert(1)' ? 'invert(0)' : 'invert(1)'">🌓 Modo</button>
          </div>
          <div style="display:flex; gap:10px; margin:20px 0;">
             <div style="flex:1; background:#ebf8ff; padding:15px; border-radius:10px;">Total: ${total}</div>
             <div style="flex:1; background:#f0fff4; padding:15px; border-radius:10px;">En Ruta: ${enTransito}</div>
             <div style="flex:1; background:#edf2f7; padding:15px; border-radius:10px;">Hecho: ${entregados}</div>
          </div>
          <form action="/upload" method="POST" encType="multipart/form-data" style="margin-bottom:20px; padding:15px; background:#f1f5f9; border-radius:8px;">
            <input type="file" name="excel" accept=".xlsx"> <button type="submit">Importar Excel</button>
          </form>
          <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="text-align:left; border-bottom:2px solid #e2e8f0;"><th>Cliente</th><th>Destino</th><th>Peso</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      </body>
    `);
  } catch (e) { res.send("Error: " + e.message); }
});

// 4. RUTAS DE ACCIÓN
app.get('/seed', async (req, res) => {
  await Carga.bulkCreate([
    { cliente: 'Ejemplo S.A.', destino: 'Bogotá', peso: '1000' },
    { cliente: 'Prueba Ltda', destino: 'Medellín', peso: '500' }
  ]);
  res.redirect('/');
});

app.post('/upload', async (req, res) => {
  if (!req.files) return res.redirect('/');
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.load(req.files.excel.data);
  const sheet = workbook.getWorksheet(1);
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    if (row.getCell(9).value) {
      await Carga.create({ cliente: row.getCell(9).text, destino: row.getCell(18).text, peso: row.getCell(16).text });
    }
  }
  res.redirect('/');
});

app.post('/vincular-gps/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa, estado: 'EN TRANSITO', ultima_actualizacion: new Date() }, { where: { id: req.params.id } });
  res.redirect('/');
});

app.post('/finalizar/:id', async (req, res) => {
  await Carga

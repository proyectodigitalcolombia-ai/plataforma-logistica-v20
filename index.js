const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');
const axios = require('axios');

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
  cliente: DataTypes.STRING, destino: DataTypes.STRING, peso: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: DataTypes.STRING, gps_password: DataTypes.STRING,
  ultima_latitud: { type: DataTypes.STRING, defaultValue: '4.6097' },
  ultima_longitud: { type: DataTypes.STRING, defaultValue: '-74.0817' },
  ultima_actualizacion: DataTypes.DATE, fecha_entrega: DataTypes.DATE
});

app.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const total = await Carga.count();
    const ruta = await Carga.count({ where: { estado: 'EN TRANSITO' } });
    const cargas = await Carga.findAll({
      where: { [Op.or]: [{ placa: { [Op.iLike]: `%${q}%` } }, { cliente: { [Op.iLike]: `%${q}%` } }] },
      order: [['createdAt', 'DESC']]
    });

    let filas = cargas.map(c => `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px;">${c.cliente}</td>
        <td>${c.destino}</td>
        <td><span style="background:${c.estado==='PENDIENTE'?'#f59e0b':'#10b981'};color:white;padding:3px 8px;border-radius:10px;font-size:10px;">${c.estado}</span></td>
        <td>
          ${c.estado==='PENDIENTE' ? `<form action="/vincular/${c.id}" method="POST"><input name="placa" placeholder="Placa" style="width:60px;"><button type="submit">Ir</button></form>` : 
          `<a href="https://www.google.com/maps?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank">📍 Ver</a>
           <form action="/fin/${c.id}" method="POST" style="display:inline;"><button type="submit" style="color:red">Fin</button></form>`}
        </td>
      </tr>`).join('');

    res.send(`
      <body style="font-family:sans-serif;padding:20px;background:#f8fafc;">
        <div style="max-width:800px;margin:auto;background:white;padding:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          <div style="display:flex;justify-content:space-between;"><h2>🚚 Logisv20</h2><a href="/seed" style="font-size:12px;">Cargar Demo</a></div>
          <div style="display:flex;gap:10px;margin-bottom:20px;text-align:center;">
            <div style="flex:1;background:#ebf8ff;padding:10px;border-radius:5px;">Total: ${total}</div>
            <div style="flex:1;background:#f0fff4;padding:10px;border-radius:5px;">Ruta: ${ruta}</div>
          </div>
          <form action="/upload" method="POST" encType="multipart/form-data" style="margin-bottom:15px;"><input type="file" name="excel"><button type="submit">Subir Excel</button></form>
          <table style="width:100%;text-align:left;">
            <thead><tr><th>Cliente</th><th>Destino</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>${filas || '<tr><td colspan="4" style="text-align:center;padding:20px;">Sin datos</td></tr>'}</tbody>
          </table>
        </div>
      </body>`);
  } catch (e) { res.send(e.message); }
});

app.get('/seed', async (req, res) => {
  await Carga.bulkCreate([{ cliente: 'Prueba 1', destino: 'Bogotá' }, { cliente: 'Prueba 2', destino: 'Cali' }]);
  res.redirect('/');
});

app.post('/upload', async (req, res) => {
  if (!req.files) return res.redirect('/');
  const wb = new exceljs.Workbook();
  await wb.xlsx.load(req.files.excel.data);
  const sh = wb.getWorksheet(1);
  for (let i = 2; i <= sh.rowCount; i++) {
    const r = sh.getRow(i);
    if (r.getCell(9).value) await Carga.create({ cliente: r.getCell(9).text, destino: r.getCell(18).text, peso: r.getCell(16).text });
  }
  res.redirect('/');
});

app.post('/vincular/:id', async (req, res) => {
  await Carga.update({ placa: req.body.placa, estado: 'EN TRANSITO', ultima_actualizacion: new Date() }, { where: { id: req.params.id } });
  res.redirect('/');
});

app.post('/fin/:id', async (req, res) => {
  await Carga.update({ estado: 'ENTREGADO', fecha_entrega: new Date() }, { where: { id: req.params.id } });
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => app.listen(PORT));

const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');
const axios = require('axios');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A POSTGRES 17 (Región Oregon)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO DE DATOS ACTUALIZADO
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  destino: DataTypes.STRING,
  peso: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }, // PENDIENTE, EN TRANSITO, ENTREGADO
  placa: DataTypes.STRING,
  conductor: DataTypes.STRING,
  gps_url_api: DataTypes.STRING,
  gps_usuario: DataTypes.STRING,
  gps_password: DataTypes.STRING,
  ultima_latitud: { type: DataTypes.STRING, defaultValue: '4.6097' },
  ultima_longitud: { type: DataTypes.STRING, defaultValue: '-74.0817' },
  ultima_actualizacion: DataTypes.DATE,
  fecha_entrega: DataTypes.DATE
});

// 3. VISTA PRINCIPAL CON HISTORIAL Y FINALIZACIÓN
app.get('/', async (req, res) => {
  const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });
  
  let filas = cargas.map(c => `
    <tr style="border-bottom: 1px solid #eee; background: ${c.estado === 'ENTREGADO' ? '#f1f1f1' : 'white'};">
      <td style="padding:12px;">${c.cliente}</td>
      <td style="padding:12px;">${c.destino}</td>
      <td style="padding:12px;">${c.peso}</td>
      <td style="padding:12px;">
        <span style="background:${c.estado === 'PENDIENTE' ? '#ffc107' : c.estado === 'ENTREGADO' ? '#6c757d' : '#28a745'}; color:white; padding:4px 8px; border-radius:12px; font-size:0.8em;">
          ${c.estado}
        </span>
      </td>
      <td style="padding:12px;">
        ${c.estado === 'PENDIENTE' ? `
          <form action="/vincular-gps/${c.id}" method="POST" style="display:grid; gap:4px; background:#f8f9fa; padding:10px; border-radius:8px;">
            <input type="text" name="placa" placeholder="Placa" required>
            <input type="text" name="url" placeholder="URL API GPS" required>
            <input type="text" name="user" placeholder="Usuario GPS" required>
            <input type="password" name="pass" placeholder="Password GPS" required>
            <button type="submit" style="background:#007bff; color:white; border:none; padding:5px; cursor:pointer; border-radius:4px;">Vincular GPS</button>
          </form>
        ` : c.estado === 'EN TRANSITO' ? `
          <strong>${c.placa}</strong><br>
          <a href="https://www.google.com/maps?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank" style="color:#d9534f; font-size:0.9em;">📍 Ver GPS</a><br>
          <form action="/finalizar/${c.id}" method="POST" style="margin-top:5px;">
            <button type="submit" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8em;">🏁 Finalizar Viaje</button>
          </form>
        ` : `
          <small>Entregado el: ${c.fecha_entrega ? c.fecha_entrega.toLocaleDateString() : 'N/A'}</small>
        `}
      </td>
    </tr>
  `).join('');

  res.send(`
    <div style="font-family:sans-serif; padding:30px; background:#f0f2f5; min-height:100vh;">
      <div style="max-width:1100px; margin:auto; background:white; padding:25px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
        <h2 style="color:#1a73e8;">🚚 Control de Flota v20 - Node 20</h2>
        
        <div style="margin:20px 0; padding:15px; border:2px dashed #1a73e8; border-radius:10px; background:#e8f0fe;">
          <form action="/upload" method="POST" encType="multipart/form-data">
            <strong>Nueva Carga (Excel):</strong> 
            <input type="file" name="excel" accept=".xlsx">
            <button type="submit" style="background:#1a73e8; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Procesar</button>
          </form>
        </div>

        <table style="width:100%; border-collapse:collapse;">
          <thead style="background:#1a73e8; color:white;">
            <tr>
              <th style="padding:15px; text-align:left;">Cliente</th>
              <th style="padding:15px; text-align:left;">Destino</th>
              <th style="padding:15px; text-align:left;">Peso</th>
              <th style="padding:15px; text-align:left;">Estado</th>
              <th style="padding:15px; text-align:left;">Seguimiento / Acción</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </div>
  `);
});

// 4. LÓGICA: FINALIZAR VIAJE (LIMPIEZA DE CREDENCIALES)
app.post('/finalizar/:id', async (req, res) => {
  await Carga.update({
    estado: 'ENTREGADO',
    fecha_entrega: new Date(),
    // Borramos datos sensibles del GPS por seguridad al terminar el viaje
    gps_usuario: null,
    gps_password: null,
    gps_url_api: null
  }, { where: { id: req.params.id } });
  res.redirect('/');
});

// --- (Rutas /upload y /vincular-gps se mantienen igual que el anterior) ---

app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.excel) return res.send("Archivo no encontrado");
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
  const { placa, url, user, pass } = req.body;
  await Carga.update({ placa, gps_url_api: url, gps_usuario: user, gps_password: pass, estado: 'EN TRANSITO', ultima_actualizacion: new Date() }, { where: { id: req.params.id } });
  res.redirect('/');
});

// 5. MOTOR DE RASTREO (Solo para los que siguen EN TRANSITO)
async function motorRastreoGPS() {
  const activos = await Carga.findAll({ where: { estado: 'EN TRANSITO' } });
  for (let camion of activos) {
    if (camion.gps_url_api) {
      try {
        const res = await axios.get(`${camion.gps_url_api}/getPosition`, {
          params: { u: camion.gps_usuario, p: camion.gps_password, dev: camion.placa }
        });
        if (res.data.lat) {
          await camion.update({ ultima_latitud: res.data.lat, ultima_longitud: res.data.lng, ultima_actualizacion: new Date() });
        }
      } catch (e) { console.log(`Error GPS ${camion.placa}: ${e.message}`); }
    }
  }
}
setInterval(motorRastreoGPS, 600000);

const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => app.listen(PORT));

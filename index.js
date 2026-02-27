const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes } = require('sequelize');
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

// 3. VISTA PRINCIPAL (DISEÑO PROFESIONAL)
app.get('/', async (req, res) => {
  const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });
  
  let filas = cargas.map(c => `
    <tr class="data-row">
      <td>${c.cliente}</td>
      <td>${c.destino}</td>
      <td>${c.peso} Kg</td>
      <td><span class="badge ${c.estado.toLowerCase().replace(' ', '-')}">${c.estado}</span></td>
      <td>
        ${c.estado === 'PENDIENTE' ? `
          <form action="/vincular-gps/${c.id}" method="POST" class="gps-form">
            <input type="text" name="placa" placeholder="Placa" required>
            <input type="password" name="pass" placeholder="Credencial GPS" required>
            <button type="submit">Vincular</button>
          </form>
        ` : c.estado === 'EN TRANSITO' ? `
          <div class="tracking-info">
            <strong>${c.placa}</strong>
            <a href="https://www.google.com/maps?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank" class="map-link">📍 Ubicación</a>
            <form action="/finalizar/${c.id}" method="POST" style="margin-top:5px;">
              <button type="submit" class="btn-finish">Finalizar</button>
            </form>
          </div>
        ` : `<small>Entregado: ${c.fecha_entrega ? c.fecha_entrega.toLocaleDateString() : '-'}</small>`}
      </td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Control Logístico Pro</title>
        <style>
            :root {
                --bg: #f0f4f8;
                --card: #ffffff;
                --text: #2d3748;
                --primary: #3182ce; /* Azul claro profesional */
                --accent: #2c5282;
                --border: #e2e8f0;
            }
            body.dark {
                --bg: #1a202c;
                --card: #2d3748;
                --text: #edf2f7;
                --border: #4a5568;
                --primary: #63b3ed;
            }
            body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; transition: 0.3s; margin: 0; padding: 20px; }
            .container { max-width: 1200px; margin: auto; background: var(--card); padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border); padding-bottom: 20px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 15px; border-bottom: 2px solid var(--border); color: var(--primary); }
            td { padding: 15px; border-bottom: 1px solid var(--border); }
            .badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; }
            .pendiente { background: #ecc94b; }
            .en-transito { background: #48bb78; }
            .entregado { background: #a0aec0; }
            .btn-mode { cursor: pointer; padding: 8px 15px; border-radius: 8px; border: 1px solid var(--primary); background: transparent; color: var(--primary); font-weight: bold; }
            .btn-report { background: var(--primary); color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; }
            .gps-form input { padding: 5px; border-radius: 4px; border: 1px solid var(--border); width: 80px; }
            .btn-finish { background: #f56565; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; }
            .map-link { color: var(--primary); text-decoration: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <div>
                    <h1 style="margin:0;">🚚 Logisv20 <span style="font-weight:300; font-size:0.5em;">PRO</span></h1>
                    <p style="margin:0; opacity:0.7;">Gestión de flota en tiempo real</p>
                </div>
                <div>
                    <button class="btn-mode" onclick="document.body.classList.toggle('dark')">🌓 Modo Oscuro</button>
                    <a href="/descargar-reporte" class="btn-report">📊 Reporte</a>
                </div>
            </header>
            
            <section style="background:rgba(49, 130, 206, 0.1); padding:20px; border-radius:10px; margin-bottom:30px;">
                <form action="/upload" method="POST" encType="multipart/form-data">
                    <strong>Importar Cargas:</strong> 
                    <input type="file" name="excel" accept=".xlsx" style="margin:0 15px;">
                    <button type="submit" style="background:var(--accent); color:white; border:none; padding:8px 20px; border-radius:5px; cursor:pointer;">Cargar Operación</button>
                </form>
            </section>

            <table>
                <thead>
                    <tr>
                        <th>CLIENTE</th>
                        <th>DESTINO</th>
                        <th>PESO</th>
                        <th>ESTADO</th>
                        <th>GESTIÓN GPS</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </div>
    </body>
    </html>
  `);
});

// (Rutas /upload, /descargar-reporte, /vincular-gps y /finalizar permanecen iguales para mantener la funcionalidad de Postgres 17)

app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.excel) return res.send("Error de archivo");
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
  const { placa, pass } = req.body;
  // Usamos una URL de ejemplo si el usuario no pone una
  await Carga.update({ placa, gps_password: pass, gps_url_api: 'https://api.gps-standard.com', estado: 'EN TRANSITO', ultima_actualizacion: new Date() }, { where: { id: req.params.id } });
  res.redirect('/');
});

app.post('/finalizar/:id', async (req, res) => {
    await Carga.update({ estado: 'ENTREGADO', fecha_entrega: new Date(), gps_usuario: null, gps_password: null, gps_url_api: null }, { where: { id: req.params.id } });
    res.redirect('/');
});

app.get('/descargar-reporte', async (req, res) => {
    const entregados = await Carga.findAll({ where: { estado: 'ENTREGADO' } });
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');
    worksheet.columns = [{ header: 'Cliente', key: 'c' }, { header: 'Destino', key: 'd' }, { header: 'Placa', key: 'p' }, { header: 'Fecha', key: 'f' }];
    entregados.forEach(c => worksheet.addRow({ c: c.cliente, d: c.destino, p: c.placa, f: c.fecha_entrega }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte.xlsx');
    await workbook.xlsx.write(res);
    res.end();
});

const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => app.listen(PORT));

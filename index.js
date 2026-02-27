const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.json());

// 1. Conexión a la DB usando tu variable DATABASE_URL de Render
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. Modelo de datos basado en tu imagen de Excel
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,      // Columna I
  subcliente: DataTypes.STRING,   // Columna J
  puerto: DataTypes.STRING,       // Columna D
  peso: DataTypes.STRING,         // Columna P
  destino: DataTypes.STRING,      // Columna R
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
});

// 3. Interfaz básica para subir el archivo
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Portal Logístico - Carga de Datos</h2>
      <form action="/upload" method="POST" encType="multipart/form-data">
        <input type="file" name="excel" accept=".xlsx" />
        <button type="submit">Importar Excel</button>
      </form>
    </div>
  `);
});

// 4. Lógica para procesar el Excel y guardar en Postgres 17
app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.excel) return res.status(400).send('No hay archivo.');

  const workbook = new exceljs.Workbook();
  await workbook.xlsx.load(req.files.excel.data);
  const sheet = workbook.getWorksheet(1);

  let creados = 0;
  sheet.eachRow(async (row, rowNumber) => {
    if (rowNumber > 1) { // Saltamos la cabecera
      await Carga.create({
        cliente: row.getCell(9).value,  // Columna I
        subcliente: row.getCell(10).value, // Columna J
        puerto: row.getCell(4).value,    // Columna D
        peso: row.getCell(16).value,     // Columna P
        destino: row.getCell(18).value   // Columna R
      });
      creados++;
    }
  });

  res.send(`✅ Se importaron ${creados} registros de carga.`);
});

// 5. Iniciar servidor y base de datos
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log('🚀 Sistema listo en puerto ' + PORT));
});

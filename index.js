const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A BD
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO DE DATOS (Asegurando la columna 'placa')
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  destino: DataTypes.STRING,
  peso: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, allowNull: true }, // Columna crítica
  ultima_latitud: { type: DataTypes.STRING, defaultValue: '4.6097' },
  ultima_longitud: { type: DataTypes.STRING, defaultValue: '-74.0817' },
  fecha_entrega: DataTypes.DATE
});

// 3. VISTA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    const total = await Carga.count();
    const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });

    let filas = cargas.map(c => `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px;"><strong>${c.cliente}</strong></td>
        <td>${c.destino}</td>
        <td><span style="background:${c.estado === 'PENDIENTE' ? '#f59e0b' : '#10b981'}; color:white; padding:3px 8px; border-radius:10px; font-size:10px;">${c.estado}</span></td>
        <td>
          ${c.estado === 'PENDIENTE' ? `
            <form action="/vincular/${c.id}" method="POST">
              <input name="placa" placeholder="Placa" style="width:70px;" required>
              <button type="submit">Ir</button>
            </form>` : `<b>${c.placa || 'S/N'}</b>`}
        </td>
      </tr>`).join('');

    res.send(`
      <body style="font-family:sans-serif; padding:20px; background:#f1f5f9;">
        <div style="max-width:800px; margin:auto; background:white; padding:20px; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          <h2>🚚 Logisv20 PRO</h2>
          <div style="margin-bottom:20px;">
            <a href="/seed" style="background:#3b82f6; color:white; text-decoration:none; padding:8px 12px; border-radius:5px; font-size:13px;">🚀 Cargar Demo</a>
            <span style="margin-left:20px;">Total: ${total}</span>
          </div>
          <table style="width:100%; text-align:left; border-collapse:collapse;">
            <thead><tr style="background:#f8fafc;"><th>Cliente</th><th>Destino</th><th>Estado</th><th>Placa</th></tr></thead>
            <tbody>${filas || '<tr><td colspan="4" style="text-align:center; padding:20px;">Sin datos</td></tr>'}</tbody>
          </table>
        </div>
      </body>`);
  } catch (e) { res.status(500).send("Error en tabla: " + e.message); }
});

// 4. RUTAS DE ACCIÓN
app.get('/seed', async (req, res) => {
  try {
    await Carga.bulkCreate([{ cliente: 'Eurofarma', destino: 'Bogotá' }, { cliente: 'Alpina', destino: 'Cali' }]);
    res.redirect('/');
  } catch (e) { res.send(e.message); }
});

app.post('/vincular/:id', async (req, res) => {
  try {
    await Carga.update({ placa: req.body.placa, estado: 'EN TRANSITO' }, { where: { id: req.params.id } });
    res.redirect('/');
  } catch (e) { res.send(e.message); }
});

// 5. INICIO (Aquí es donde ocurre la magia de la columna faltante)
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }) // <--- ESTO REPARA LA COLUMNA PLACA AUTOMÁTICAMENTE
  .then(() => {
    app.listen(PORT, () => console.log('🚀 Servidor listo y base de datos actualizada'));
  })
  .catch(err => console.error('Error al sincronizar:', err));

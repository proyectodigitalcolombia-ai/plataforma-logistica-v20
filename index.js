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

// 3. VISTA PRINCIPAL PROFESIONAL
app.get('/', async (req, res) => {
  const q = req.query.q || '';
  
  // Estadísticas para los cuadros superiores
  const total = await Carga.count();
  const enTransito = await Carga.count({ where: { estado: 'EN TRANSITO' } });
  const entregados = await Carga.count({ where: { estado: 'ENTREGADO' } });

  // Consulta de la tabla con buscador
  const cargas = await Carga.findAll({
    where: {
      [Op.or]: [
        { placa: { [Op.iLike]: `%${q}%` } },
        { cliente: { [Op.iLike]: `%${q}%` } },
        { destino: { [Op.iLike]: `%${q}%` } }
      ]
    },
    order: [['createdAt', 'DESC']]
  });

  let filas = cargas.length > 0 ? cargas.map(c => `
    <tr class="data-row">
      <td><strong>${c.cliente}</strong></td>
      <td>${c.destino}</td>
      <td>${c.peso}</td>
      <td><span class="badge ${c.estado.toLowerCase().replace(/\s/g, '-')}">${c.estado}</span></td>
      <td>
        ${c.estado === 'PENDIENTE' ? `
          <form action="/vincular-gps/${c.id}" method="POST" class="gps-form">
            <input type="text" name="placa" placeholder="Placa" required>
            <input type="password" name="pass" placeholder="Clave GPS" required>
            <button type="submit">Activar</button>
          </form>
        ` : c.estado === 'EN TRANSITO' ? `
          <div class="tracking-box">
            <span class="placa-tag">${c.placa}</span>
            <a href="https://www.google.com/maps?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank" class="map-btn">📍 GPS</a>
            <form action="/finalizar/${c.id}" method="POST" style="display:inline;">
              <button type="submit" class="btn-finish">Finalizar</button>
            </form>
          </div>
        ` : `<span class="ent

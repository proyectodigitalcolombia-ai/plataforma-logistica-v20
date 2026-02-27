const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');
const axios = require('axios');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A POSTGRES 17 (Usa la variable de entorno de Render)
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
  conductor: DataTypes.STRING,
  // Credenciales y datos de GPS Real
  gps_url_api: DataTypes.STRING,
  gps_usuario: DataTypes.STRING,
  gps_password: DataTypes.STRING,
  ultima_latitud: { type: DataTypes.STRING, defaultValue: '4.6097' },
  ultima_longitud: { type: DataTypes.STRING, defaultValue: '-74.0817' },
  ultima_actualizacion: DataTypes.DATE
});

// 3. VISTA PRINCIPAL (INTERFAZ DE CONTROL)
app.get('/', async (req, res) => {
  const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });
  
  let filas = cargas.map(c => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding:12px;">${c.cliente}</td>
      <td style="padding:12px;">${c.destino}</td>
      <td style="padding:12px;">${c.peso}</td>
      <td style="padding:12px;">
        <span style="background:${c.estado === 'PENDIENTE' ? '#ffc107' : '#28a745'}; color:white; padding:4px 8px; border-radius:12px; font-size:0.8em;">
          ${c.estado}
        </span>
      </td>
      <td style="padding:12px;">
        ${c.estado === 'PENDIENTE' ? `
          <form action="/vincular-gps/${c.id}" method="POST" style="display:grid; gap:4px; background:#f8f9fa; padding:10px; border-radius:8px;">
            <input type="text" name="placa" placeholder="Placa Vehículo" required>
            <input type="text" name="url" placeholder="Enlace API GPS" required>
            <input type="text" name="user" placeholder="Usuario GPS" required>
            <input type="password" name="pass" placeholder="Password GPS" required>
            <button type="submit" style="background:#007bff; color:white; border:none; padding:5px; cursor:pointer; border-radius:4px;">Vincular Datos Reales</button>
          </form>
        ` : `
          <strong>Placa: ${c.placa}</strong><br>
          <small style="color:gray;">Actualizado: ${c.ultima_actualizacion ? c.ultima_actualizacion.toLocaleTimeString() : 'Esperando datos...'}</small><br>
          <a href="https://www.google.com/maps?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank" style="text-decoration:none; color:#d9534f; font-weight:bold;">📍 Ver GPS

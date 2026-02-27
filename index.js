const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes } = require('sequelize');
const axios = require('axios');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A POSTGRES 17 (Usa tu variable de entorno de Render)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELOS DE DATOS
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  destino: DataTypes.STRING,
  peso: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: DataTypes.STRING,
  conductor: DataTypes.STRING,
  // Datos de vinculación GPS real
  gps_url_api: DataTypes.STRING,
  gps_usuario: DataTypes.STRING,
  gps_password: DataTypes.STRING, // Nota: En producción usar cifrado
  ultima_latitud: DataTypes.STRING,
  ultima_longitud: DataTypes.STRING
});

// 3. INTERFAZ WEB (HTML + CSS)
app.get('/', async (req, res) => {
  const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });
  
  let filas = cargas.map(c => `
    <tr>
      <td>${c.cliente}</td>
      <td>${c.destino}</td>
      <td>${c.peso}</td>
      <td><span style="background:${c.estado === 'PENDIENTE' ? '#ffc107' : '#28a745'}; padding:3px 7px; border-radius:4px;">${c.estado}</span></td>
      <td>
        ${c.estado === 'PENDIENTE' ? `
          <form action="/vincular-gps/${c.id}" method="POST" style="font-size: 0.8em; display: grid; gap: 5px;">
            <input type="text" name="placa" placeholder="Placa" required>
            <input type="text" name="url" placeholder="URL API (Ej: http://api.gps.com)" required>
            <input type="text" name="user" placeholder="Usuario GPS" required>
            <input type="password" name="pass" placeholder="Contraseña GPS" required>
            <button type="submit" style="background:#007bff; color:white; border:none; cursor:pointer;">Vincular GPS Real</button>
          </form>
        ` : `
          <strong>${c.placa}</strong><br>
          <small>Enlace: ${c.gps_url_api}</small><br>
          <a href="https://www.google.com/maps?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank">📍 Ver Ubicación Real</a>
        `}
      </td>
    </tr>
  `).join('');

  res.send(`
    <body style="font-family:sans-serif; background:#f4f7f6; padding:40px;">
      <div style="max-width:1000px; margin:auto; background:white; padding:20px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
        <h2 style="color:#2c3e50;">🚚 Sistema Logístico - Control de Tráfico Real</h2>
        
        <div style="border:1px dashed #ccc; padding:15px; margin-bottom:20px;">
          <strong>Subir Excel de Cargas:</strong>
          <form action="/upload" method="POST" encType="multipart/form-data" style="margin-top:10px;">
            <input type

const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');
const axios = require('axios');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A BASE DE DATOS
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO DE DATOS (Incluye todas las columnas necesarias)
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

// 3. RUTA PRINCIPAL (Interfaz Profesional)
app.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const total = await Carga.count();
    const enRuta = await Carga.count({ where: { estado: 'EN TRANSITO' } });

    const cargas = await Carga.findAll({
      where: {
        [Op.or]: [
          { cliente: { [Op.iLike]: `%${q}%` } },
          { placa: { [Op.iLike]: `%${q}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    let filas = cargas.length > 0 ? cargas.map(c => `
      <tr style="border-bottom:1px solid #eee; background:white;">
        <td style="padding:12px;"><strong>${c.cliente}</strong></td>
        <td>${c.destino}</td>
        <td><span style="padding:4px 10px; border-radius:15px; color:white; font-size:11px; background:${c.estado === 'PENDIENTE' ? '#f59e0b' : c.estado === 'EN TRANSITO' ? '#10b981' : '#94a3b8'}">${c.estado}</span></td>
        <td>
          ${c.estado === 'PENDIENTE' ? `
            <form action="/vincular/${c.id}" method="POST" style="display:flex; gap:5px;">
              <input name="placa" placeholder="Placa" required style="width:70px; border:1px solid #ccc; border-radius:4px;">
              <button type="submit" style="background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer;">Activar</button>
            </form>` : 
            c.estado === 'EN TRANSITO' ? `
            <div style="display:flex; align-items:center; gap:10px;">
              <strong>${c.placa}</strong>
              <a href="https://www.google.com/maps?q=${c.ultima_latitud},${c.ultima_longitud}" target="_blank" style="text-decoration:none;">📍</a>
              <form action="/finalizar/${c.id}" method="POST" style="margin:0;">
                <button type="submit" style="background:#ef4444; color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:11px;">

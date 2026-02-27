const express = require('express');
const fileUpload = require('express-fileupload');
const exceljs = require('exceljs');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONEXIÓN A POSTGRES
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 2. MODELO DE DATOS (Estructura Blindada)
const Carga = sequelize.define('Carga', {
  cliente: DataTypes.STRING,
  destino: DataTypes.STRING,
  peso: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' },
  gps_password: { type: DataTypes.STRING, defaultValue: '' }, // La columna del error
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
        <td style="padding:12px;"><strong>${c.cliente}</strong></td>
        <td>${c.destino}</td>
        <td><span style="padding:4px 8px; border-radius:10px; color:white; font-size:11px; background:${c.estado === 'PENDIENTE' ? '#f59e0b' : '#10b981'}">${c.estado}</span></td>
        <td>
          ${c.estado === 'PENDIENTE' ? `
            <form action="/vincular/${c.id}" method="POST">
              <input name="placa" placeholder="Placa" style="width:60px;" required>
              <input type="password" name="pass" placeholder="GPS Pass" style="width:60px;" required>
              <button type="submit">Activar</button>
            </form>` : `<b>${c.placa}</b>`}
        </td>
      </tr>`).join('');

    res.send(`
      <body style="font-family:sans-serif; padding:20px; background:#f1f5f9; color:#1e293b;">
        <div style="max-width:850px; margin:auto; background:white; padding:25px; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="color:#2563eb; margin:0;">🚚 Logisv20 PRO</h2>
            <div>
              <a href="/seed" style="text-decoration:none; background:#3b82f6; color:white; padding:8px 12px; border-radius:6px; font-size:13px; font-weight:bold;">🚀 Cargar Demo</a>
              <span style="margin-left:15px; font-weight:bold;">Total: ${total}</span>
            </div>
          </div>
          <table style="width:100%; border-collapse:collapse; text-align:left;">
            <thead style="background:#f8fafc;">
              <tr><th style="padding:12px;">Cliente</th><th>Destino</th><th>Estado</th><th>Gestión</th></tr>
            </thead>
            <tbody>${filas || '<tr><td colspan="4" style="text-align:center; padding:30px; color:gray;">No hay datos en la base de datos de

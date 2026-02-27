const express = require('express');
const fileUpload = require('express-fileupload');
const { Sequelize, DataTypes } = require('sequelize');

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
  cliente: DataTypes.STRING,
  origen: { type: DataTypes.STRING, defaultValue: 'BOGOTÁ' },
  destino: { type: DataTypes.STRING, defaultValue: 'DESTINO' },
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const todosPendientes = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'ASC']] });
    const enRuta = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    // Filas para Cargas Pendientes
    const filaCarga = (c) => `
      <tr class="data-row">
        <td>#${c.id}</td>
        <td><b>${c.cliente}</b></td>
        <td>${c.origen} → ${c.destino}</td>
        <td><div style="display:flex; align-items:center; gap:8px;"><span class="led led-red"></span> <small>SIN DESPACHAR</small></div></td>
      </tr>`;
    
    // Filas para Pendiente por Despacho
    const filaDespacho = (c) => `
      <tr class="data-row">
        <td>#${c.id}</td>
        <td><b>${c.cliente}</b></td>
        <td>
          <form action="/vincular/${c.id}" method="POST" style="display:flex; gap:10px; align-items:center;">
            <span class="led led-red"></span>
            <input name="placa" placeholder="PLACA" required maxlength="7" class="input-table">
            <button type="submit" class="btn-go">DESPACHAR</button>
          </form>
        </td>
      </tr>`;

    // Filas para Vehículos en Ruta
    const filaRuta = (c) => `
      <tr class="data-row">
        <td>#${c.id}</td>
        <td><b>${c.cliente}</b></td>
        <td>${c.origen} → ${c.destino}</td>
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="led led-green"></span>
            <b class="placa-text">${c.placa}</b>
          </div>
        </td>
      </tr>`;

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"><title>Logisv20 PRO | Command</title>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --accent: #2563eb; --border: #94a3b8; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --accent: #3b82f6; --border: #334155; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; transition: 0.3s; }
        
        /* Semáforos (LEDs) */
        .led { width: 12px; height: 12px; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        .led-red { background: #ef4444; box-shadow: 0 0 10px #ef4444; animation: pulse-red 1.5s infinite; }
        .led-green { background: #10b981; box-shadow: 0 0 10px #10b981; }
        @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .nav { background: #fff; padding: 15px 40px; display: flex; justify-content: space-between;

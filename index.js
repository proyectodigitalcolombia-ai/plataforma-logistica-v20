const express = require('express');
const fileUpload = require('express-fileupload');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// MODELO ACTUALIZADO (Asegúrate de que 'subcliente' y 'tipo_v' estén aquí)
const Carga = sequelize.define('Carga', {
  empresa: DataTypes.STRING,
  comercial: DataTypes.STRING,
  do_bl: DataTypes.STRING,
  cliente: DataTypes.STRING,
  subcliente: { type: DataTypes.STRING, defaultValue: '' }, // Agregado para evitar el error
  peso: DataTypes.STRING,
  producto: DataTypes.STRING,
  origen: { type: DataTypes.STRING, defaultValue: 'CARTAGENA' },
  dest: { type: DataTypes.STRING, defaultValue: 'BOGOTÁ' },
  tipo_v: { type: DataTypes.STRING, defaultValue: '' }, // Tipo de Vehículo
  despachador: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  placa: { type: DataTypes.STRING, defaultValue: '' }
});

app.get('/', async (req, res) => {
  try {
    const p = await Carga.findAll({ where: { estado: 'PENDIENTE' }, order: [['createdAt', 'DESC']] });
    const r = await Carga.findAll({ where: { estado: 'EN TRANSITO' }, order: [['updatedAt', 'DESC']] });

    const rowP = (c) => `
      <tr class="dr">
        <td style="color:var(--acc); font-weight:bold;">#${c.id}</td>
        <td><b>${c.empresa}</b><br><small>${c.comercial}</small></td>
        <td><b>${c.cliente}</b><br><small>${c.subcliente || ''}</small></td>
        <td>Ref: ${c.do_bl || 'N/A'}<br><small>${c.producto || ''}</small></td>
        <td>${c.origen} → ${c.dest}<br><small>${c.tipo_v || ''}</small></td>
        <td>${c.peso} kg</td>
        <td><div style="display:flex; align-items:center; gap:10px;"><span class="l lr"></span> <a href="/del/${c.id}" class="btn-del">BORRAR</a></div></td>
      </tr>`;

    const rowD = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b><br><small>${c.tipo_v}</small></td><td><form action="/vink/${c.id}" method="POST" class="f"><input name="placa" placeholder="PLACA" required maxlength="7"><button type="submit">DESPACHAR</button></form></td></tr>`;
    const rowR = (c) => `<tr class="dr"><td>#${c.id}</td><td><b>${c.cliente}</b></td><td>${c.origen}→${c.dest}</td><td><span class="l lg"></span> <b class="pt">${c.placa}</b><br><small>${c.despachador}</small></td></tr>`;

    res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root { --bg: #cbd5e1; --card: #e2e8f0; --text: #1e293b; --acc: #2563eb; --brd: #94a3b8; }
        body.dark { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --acc: #3b82f6; --brd: #334155; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; transition: 0.3s; }
        .nv { background: #fff; padding: 10px 40px; display: flex; justify-content: space-between; border-bottom: 4px solid var(--acc); align-items: center; }
        .ts { display: flex; gap: 8px; padding: 20px 40px; background: rgba(0,0,0,0.05); }
        .tb { background: var(--card); color: var(--text); border: 1px solid var(--brd); padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Rajdhani'; font-size: 13px; }
        .tb.active { background: var(--acc); color: white; border-color: var(--acc); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .md { display: none; padding: 0 40px; animation: fIn 0.3s; } .md.active { display: block; }
        .form-pro { background: var(--card); padding: 20px; border-radius: 12px; border: 2px solid var(--acc); margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
        .form-pro input, .form-pro select { background: white; border: 1px solid var(--brd); padding: 8px; border-radius: 6px; font-size: 12px; color: black; }
        .btn-add { grid-column: 1 / -1; background: var(--acc); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Rajdhani'; }
        .tc { background: var(--card); border-radius: 12px; border: 1px solid var(--brd); overflow: auto; max-height: 450px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: rgba(0,0,0,0.05); padding: 12px; text-align: left; font-size: 10px; color: var(--acc); position: sticky; top: 0; }
        td { padding: 10px 15px; border-bottom: 1px solid var(--brd); font-size: 12px; }
        .btn-del { color: #ef4444; text-decoration: none; font-size: 10px; font-weight: bold; border: 1px solid #ef444

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// Modelo con las columnas exactas de tu Excel
const C = db.define('Carga', {
  fecha: DataTypes.STRING, oficina: DataTypes.STRING, empresa: DataTypes.STRING, comercial: DataTypes.STRING,
  puerto: DataTypes.STRING, documentos: DataTypes.STRING, do_bl: DataTypes.STRING, cliente: DataTypes.STRING,
  subcliente: DataTypes.STRING, modalidad: DataTypes.STRING, tipo_carga: DataTypes.STRING, peso: DataTypes.STRING,
  producto: DataTypes.STRING, esquema: DataTypes.STRING, origen: DataTypes.STRING, destino: DataTypes.STRING,
  tipo_v: DataTypes.STRING, placa: DataTypes.STRING, despachador: DataTypes.STRING, estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
});

const css = `<style>
  body { background: #0f172a; color: #f1f5f9; font-family: sans-serif; margin: 0; padding: 20px; }
  .wrapper { width: 100%; overflow-x: auto; background: #1e293b; border-radius: 8px; border: 1px solid #334155; }
  table { border-collapse: collapse; min-width: 2500px; font-size: 11px; }
  th { background: #3b82f6; color: white; padding: 10px; text-align: left; position: sticky; top: 0; white-space: nowrap; }
  td { padding: 8px; border: 1px solid #334155; white-space: nowrap; }
  tr:hover { background: #2d3748; }
  .form { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px; background: #1e293b; padding: 20px; border-radius: 8px; }
  input, select { background: #fff; border: 1px solid #334155; padding: 8px; border-radius: 4px; font-size: 11px; color: #000; }
  .btn { grid-column: 1/-1; background: #3b82f6; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 4px; font-weight: bold; }
  .btn-go { background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; }
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => `<tr>
    <td>${c.id}</td><td>${c.estado}</td><td>${c.fecha}</td><td>${c.oficina}</td><td>${c.empresa}</td>
    <td>${c.comercial}</td><td>${c.cliente}</td><td>${c.subcliente}</td><td>${c.do_bl}</td>
    <td>${c.origen}</td><td>${c.destino}</td><td>${c.tipo_v}</td><td>${c.peso}</td>
    <td><form action="/g/${c.id}" method="POST" style="margin:0"><input name="placa" value="${c.placa||''}" placeholder="PLACA" style="width:70px"><button class="btn-go">OK</button></form></td>
    <td>${c.despachador}</td><td>${c.producto}</td><td>${c.esquema}</td><td>${c.tipo_carga}</td>
    <td><a href="/del/${c.id}" style="color:#f87171">Eliminar</a></td>
  </tr>`).join('');

  res.send(`<html><head><meta charset="UTF-8">${css}</head><body>
    <h2>REPLICA EXCEL - CONTROL DE DESPACHOS</h2>
    <form action="/add" method="POST" class="form">
      <input name="fecha" type="date">
      <select name="oficina"><option>CARTAGENA</option><option>BOGOTÁ</option><option>BUENAVENTURA</option></select>
      <input name="empresa" placeholder="Empresa Generadora">
      <input name="comercial" placeholder="Comercial">
      <input name="cliente" placeholder="Cliente">
      <input name="subcliente" placeholder="Subcliente">
      <input name="do_bl" placeholder="DO / BL / OC">
      <input name="peso" placeholder="Peso Kg">
      <input name="origen" placeholder="Origen">
      <input name="destino" placeholder="Destino">
      <select name="tipo_v"><option>TURBO</option><option>SENCILLO</option><option>TRACTOMULA 3S3</option></select>
      <input name="despachador" placeholder="Despachador">
      <button class="btn">INSERTAR NUEVA FILA AL EXCEL</button>
    </form>
    <div class="wrapper">
      <table>
        <thead><tr>
          <th>ITEM</th><th>ESTADO</th><th>FECHA REGISTRO</th><th>OFICINA</th><th>EMPRESA</th>
          <th>COMERCIAL</th><th>CLIENTE</th><th>SUBCLIENTE</th><th>DO/BL/OC</th>
          <th>ORIGEN</th><th>DESTINO</th><th>TIPO VEHICULO</th><th>PESO Kg</th>
          <th>PLACA</th><th>DESPACHADOR</th><th>PRODUCTO</th><th>ESQUEMA</th><th>TIPO CARGA</th><th>ACCION</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </body></html>`);
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/del/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/g/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), estado: 'DESPACHADO' }, { where: { id: req.params.id } }); res.redirect('/'); });

db.sync({ alter: true }).then(() => app.listen(3000));

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

const C = db.define('Carga', {
  // Se quita 'fecha' de los campos manuales porque ahora será automática
  oficina: DataTypes.STRING, empresa: DataTypes.STRING, comercial: DataTypes.STRING,
  do_bl: DataTypes.STRING, cliente: DataTypes.STRING, subcliente: DataTypes.STRING,
  peso: DataTypes.STRING, origen: DataTypes.STRING, destino: DataTypes.STRING,
  tipo_v: DataTypes.STRING, placa: DataTypes.STRING, despachador: DataTypes.STRING,
  estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
}, { timestamps: true }); // timestamps: true genera 'createdAt' automáticamente

const css = `<style>
  body { background: #0f172a; color: #f1f5f9; font-family: sans-serif; margin: 0; padding: 20px; }
  .scroll-container { width: 100%; overflow-x: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; }
  .fake-scroll { height: 20px; margin-bottom: 5px; }
  .fake-content { width: 2800px; height: 1px; }
  table { border-collapse: collapse; min-width: 2800px; font-size: 11px; }
  th { background: #2563eb; color: white; padding: 12px; text-align: left; position: sticky; top: 0; white-space: nowrap; border-right: 1px solid #3b82f6; text-transform: uppercase; }
  td { padding: 10px; border: 1px solid #334155; white-space: nowrap; }
  tr:nth-child(even) { background: #1e293b; } tr:hover { background: #2d3748; }
  .form { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #2563eb; }
  input, select { background: #fff; border: 1px solid #334155; padding: 10px; border-radius: 4px; font-size: 12px; color: #000; }
  .btn { grid-column: 1/-1; background: #2563eb; color: white; border: none; padding: 15px; cursor: pointer; border-radius: 6px; font-weight: bold; }
  .btn-go { background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  
  const rows = d.map(c => {
    // Formatear la fecha automática del sistema (createdAt)
    const f = new Date(c.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    return `<tr>
      <td><b>${c.id}</b></td>
      <td><span style="color:${c.estado==='PENDIENTE'?'#fbbf24':'#10b981'}">${c.estado}</span></td>
      <td>${f}</td>
      <td>${c.oficina||''}</td><td>${c.empresa||''}</td><td>${c.comercial||''}</td>
      <td>${c.cliente||''}</td><td>${c.subcliente||''}</td><td>${c.do_bl||''}</td>
      <td>${c.origen||''}</td><td>${c.destino||''}</td><td>${c.tipo_v||''}</td>
      <td><form action="/g/${c.id}" method="POST" style="margin:0;display:flex;gap:5px;"><input name="placa" value="${c.placa||''}" style="width:75px"><button class="btn-go">OK</button></form></td>
      <td>${c.despachador||''}</td>
      <td><a href="/del/${c.id}" style="color:#f87171;text-decoration:none;font-weight:bold" onclick="return confirm('¿Eliminar?')">ELIMINAR</a></td>
    </tr>`;
  }).join('');

  res.send(`<html><head><meta charset="UTF-8"><title>Control de Cargas</title>${css}</head><body>
    <h1 style="color:#2563eb">CONTROL DE CARGAS PENDIENTES</h1>
    
    <form action="/add" method="POST" class="form">
      <select name="oficina"><option>CARTAGENA</option><option>BOGOTÁ</option><option>BUENAVENTURA</option></select>
      <select name="empresa" required>
        <option value="">EMPRESA GENERADORA...</option>
        <option>YEGO ECO-T SAS</option><option>PLEXA ESP SAS</option><option>GEODIS COLOMBIA</option><option>MAERSK</option>
      </select>
      <select name="comercial">
        <option>RAÚL LÓPEZ</option><option>ZULEIMA RIASCOS</option><option>FREDY CARRILLO</option>
      </select>
      <select name="cliente">
        <option>ESENTTIA SA</option><option>GEODIS COLOMBIA LTDA</option><option>MAERSK LOGISTICS</option>
      </select>
      <select name="subcliente">
        <option>NO APLICA</option><option>HIKVISION</option><option>MULTIDIMENSIONALES S A S</option>
      </select>
      <input name="do_bl" placeholder="DO / BL / OC">
      <input name="peso" placeholder="Peso Kg">
      <select name="origen"><option>CARTAGENA</option><option>BUENAVENTURA</option><option>BOGOTÁ</option></select>
      <input name="destino" placeholder="Destino">
      <select name="tipo_v"><option>TURBO</option><option>SENCILLO</option><option>TRACTOMULA 3S3</option></select>
      <select name="despachador"><option>ABNNER MARTINEZ</option><option>CAMILO TRIANA</option><option>OSCAR CHACON</option></select>
      <button class="btn">💾 REGISTRAR CARGA (EL SISTEMA ASIGNARÁ ITEM Y FECHA)</button>
    </form>

    <div class="scroll-container fake-scroll" id="scroll-top"><div class="fake-content"></div></div>
    <div class="scroll-container" id="scroll-main">
      <table>
        <thead><tr>
          <th>ITEM</th><th>ESTADO</th><th>FECHA/HORA SISTEMA</th><th>OFICINA</th><th>GENERADORA</th><th>COMERCIAL</th>
          <th>CLIENTE</th><th>SUBCLIENTE</th><th>DO/BL/OC</th><th>ORIGEN</th><th>DESTINO</th>
          <th>TIPO VEHÍCULO</th><th>PLACA</th><th>DESPACHADOR</th><th>ACCION</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <script>
      const topS = document.getElementById('scroll-top');
      const mainS = document.getElementById('scroll-main');
      topS.onscroll = () => mainS.scrollLeft = topS.scrollLeft;
      mainS.onscroll = () => topS.scrollLeft = mainS.scrollLeft;
    </script>
  </body></html>`);
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/del/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/g/:id', async (req, res) => { 
  await C.update({ placa: req.body.placa.toUpperCase(), estado: 'DESPACHADO' }, { where: { id: req.params.id } }); 
  res.redirect('/'); 
});

db.sync({ alter: true }).then(() => app.listen(3000));

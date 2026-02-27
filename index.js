const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// Modelo con el orden exacto de tus campos
const C = db.define('Carga', {
  oficina: DataTypes.STRING, empresa_gen: DataTypes.STRING, comercial: DataTypes.STRING,
  puerto: DataTypes.STRING, refleja_en: DataTypes.STRING, fecha_doc: DataTypes.STRING,
  hora_doc: DataTypes.STRING, do_bl_oc: DataTypes.STRING, cliente: DataTypes.STRING,
  subcliente: DataTypes.STRING, modalidad: DataTypes.STRING, lcl_fcl: DataTypes.STRING,
  n_contenedor: DataTypes.STRING, peso: DataTypes.STRING, unidades: DataTypes.STRING,
  producto: DataTypes.STRING, esquema_seg: DataTypes.STRING, fecha_vence_pto: DataTypes.STRING,
  origen: DataTypes.STRING, destino: DataTypes.STRING, tipo_v: DataTypes.STRING,
  pedido: DataTypes.STRING, fecha_cita_cargue: DataTypes.STRING, hora_cita_cargue: DataTypes.STRING,
  fecha_cita_descargue: DataTypes.STRING, hora_cita_descargue: DataTypes.STRING,
  placa: DataTypes.STRING, flete_pagar: DataTypes.STRING, flete_facturar: DataTypes.STRING,
  obs_estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
  fecha_act_estado: DataTypes.STRING, observaciones: DataTypes.TEXT,
  condiciones: DataTypes.TEXT, horario_transito: DataTypes.STRING,
  muc: DataTypes.STRING, despachador: DataTypes.STRING, fecha_fin_despacho: DataTypes.STRING
}, { timestamps: true });

const css = `<style>
  body { background: #0f172a; color: #f1f5f9; font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
  .scroll-container { width: 100%; overflow-x: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; }
  .fake-scroll { height: 12px; margin-bottom: 5px; }
  .fake-content { width: 4500px; height: 1px; }
  table { border-collapse: collapse; min-width: 4500px; font-size: 11px; }
  th { background: #1e40af; color: white; padding: 12px; text-align: left; position: sticky; top: 0; white-space: nowrap; border-right: 1px solid #3b82f6; font-size: 10px; }
  td { padding: 8px; border: 1px solid #334155; white-space: nowrap; }
  tr:nth-child(even) { background: #1e293b; } tr:hover { background: #2d3748; }
  .form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; background: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #2563eb; }
  input, select, textarea { background: #fff; border: 1px solid #334155; padding: 8px; border-radius: 4px; font-size: 11px; color: #000; }
  .btn-save { grid-column: 1/-1; background: #2563eb; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 6px; font-weight: bold; }
  .btn-ok { background: #10b981; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
</style>`;

app.get('/', async (req, res) => {
  const d = await C.findAll({ order: [['id', 'DESC']] });
  const rows = d.map(c => {
    const sysDate = new Date(c.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    return `<tr>
      <td><b>${c.id}</b></td><td>${sysDate}</td><td>${c.oficina||''}</td><td>${c.empresa_gen||''}</td>
      <td>${c.comercial||''}</td><td>${c.puerto||''}</td><td>${c.refleja_en||''}</td><td>${c.fecha_doc||''}</td>
      <td>${c.hora_doc||''}</td><td>${c.do_bl_oc||''}</td><td>${c.cliente||''}</td><td>${c.subcliente||''}</td>
      <td>${c.modalidad||''}</td><td>${c.lcl_fcl||''}</td><td>${c.n_contenedor||''}</td><td>${c.peso||''}</td>
      <td>${c.unidades||''}</td><td>${c.producto||''}</td><td>${c.esquema_seg||''}</td><td>${c.fecha_vence_pto||''}</td>
      <td>${c.origen||''}</td><td>${c.destino||''}</td><td>${c.tipo_v||''}</td><td>${c.pedido||''}</td>
      <td>${c.fecha_cita_cargue||''}</td><td>${c.hora_cita_cargue||''}</td><td>${c.fecha_cita_descargue||''}</td>
      <td>${c.hora_cita_descargue||''}</td>
      <td><form action="/upd/${c.id}" method="POST" style="margin:0;display:flex;gap:3px;"><input name="placa" value="${c.placa||''}" style="width:80px"><button class="btn-ok">OK</button></form></td>
      <td>${c.flete_pagar||''}</td><td>${c.flete_facturar||''}</td><td>${c.obs_estado||''}</td><td>${c.fecha_act_estado||''}</td>
      <td>${c.observaciones||''}</td><td>${c.condiciones||''}</td><td>${c.horario_transito||''}</td><td>${c.muc||''}</td>
      <td>${c.despachador||''}</td><td>${c.fecha_fin_despacho||''}</td>
      <td><a href="/del/${c.id}" style="color:#f87171" onclick="return confirm('¿Eliminar?')">X</a></td>
    </tr>`;
  }).join('');

  res.send(`<html><head><meta charset="UTF-8"><title>Control de Cargas</title>${css}</head><body>
    <h2 style="color:#3b82f6; margin:0 0 15px 0;">CONTROL DE CARGAS PENDIENTES</h2>
    <form action="/add" method="POST" class="form">
      <select name="oficina"><option>CARTAGENA</option><option>BOGOTÁ</option><option>BUENAVENTURA</option></select>
      <input name="empresa_gen" placeholder="Empresa Generadora">
      <input name="comercial" placeholder="Comercial">
      <input name="puerto" placeholder="Puerto / Sitio Cargue">
      <input name="refleja_en" placeholder="Refleja en Puerto/Patio">
      <input name="fecha_doc" type="date" title="Fecha Entrega Doc">
      <input name="hora_doc" type="time" title="Hora Entrega Doc">
      <input name="do_bl_oc" placeholder="DO / BL / OC">
      <input name="cliente" placeholder="Cliente">
      <input name="subcliente" placeholder="Subcliente">
      <input name="modalidad" placeholder="Modalidad">
      <input name="lcl_fcl" placeholder="LCL / FCL">
      <input name="n_contenedor" placeholder="N° Contenedor / Tipo Carga">
      <input name="peso" placeholder="Peso Kg">
      <input name="unidades" placeholder="Unidades">
      <input name="producto" placeholder="Producto">
      <input name="esquema_seg" placeholder="Esquema Seguridad">
      <input name="fecha_vence_pto" type="date" title="Vencimiento Pto">
      <input name="origen" placeholder="Origen">
      <input name="destino" placeholder="Destino">
      <input name="tipo_v" placeholder="Tipo Vehículo">
      <input name="pedido" placeholder="Pedido">
      <input name="fecha_cita_cargue" type="date">
      <input name="hora_cita_cargue" type="time">
      <input name="fecha_cita_descargue" type="date">
      <input name="hora_cita_descargue" type="time">
      <input name="flete_pagar" placeholder="Flete Pagar">
      <input name="flete_facturar" placeholder="Flete Facturar">
      <input name="horario_transito" placeholder="Horario Transito">
      <input name="muc" placeholder="MUC">
      <input name="despachador" placeholder="Despachador">
      <button class="btn-save">💾 REGISTRAR NUEVA LÍNEA EN CONTROL</button>
    </form>

    <div class="scroll-container fake-scroll" id="scroll-top"><div class="fake-content"></div></div>
    <div class="scroll-container" id="scroll-main">
      <table>
        <thead><tr>
          <th>ITEM</th><th>CREADO</th><th>OFICINA</th><th>EMPRESA</th><th>COMERCIAL</th><th>PTO CARGUE</th>
          <th>REFLEJA PTO</th><th>FECHA DOC</th><th>HORA DOC</th><th>DO/BL/OC</th><th>CLIENTE</th>
          <th>SUBCLIENTE</th><th>MODALIDAD</th><th>LCL/FCL</th><th>CONTENEDOR</th><th>PESO</th>
          <th>UNID</th><th>PRODUCTO</th><th>SEGURIDAD</th><th>VENCE PTO</th><th>ORIGEN</th>
          <th>DESTINO</th><th>TIPO VEH</th><th>PEDIDO</th><th>F.CARGUE</th><th>H.CARGUE</th>
          <th>F.DESCARGUE</th><th>H.DESCARGUE</th><th>PLACA</th><th>F.PAGAR</th><th>F.FACTURAR</th>
          <th>ESTADO</th><th>ACT.ESTADO</th><th>OBSERVACIONES</th><th>CONDICIONES</th><th>HORARIO</th>
          <th>MUC</th><th>DESPACHADOR</th><th>FIN DESPACHO</th><th>ELIM</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <script>
      const t=document.getElementById('scroll-top'), m=document.getElementById('scroll-main');
      t.onscroll=()=>m.scrollLeft=t.scrollLeft; m.onscroll=()=>t.scrollLeft=m.scrollLeft;
    </script>
  </body></html>`);
});

app.post('/add', async (req, res) => { await C.create(req.body); res.redirect('/'); });
app.get('/del/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/upd/:id', async (req, res) => { 
  await C.update({ placa: req.body.placa.toUpperCase() }, { where: { id: req.params.id } }); 
  res.redirect('/'); 
});

db.sync({ alter: true }).then(() => app.listen(3000));

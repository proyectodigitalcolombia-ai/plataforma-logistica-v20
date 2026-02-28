const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const app = express();

// Middleware para manejo de datos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CONFIGURACIÓN DE BASE DE DATOS (POSTGRESQL)
const db = new Sequelize(process.env.DATABASE_URL, { 
  dialect: 'postgres', 
  logging: false, 
  dialectOptions: { 
    ssl: { require: true, rejectUnauthorized: false } 
  } 
});

// MODELO DE DATOS - ESTRUCTURA DE LA TABLA CARGAS
const C = db.define('Carga', {
  oficina: DataTypes.STRING,
  emp_gen: DataTypes.STRING,
  comercial: DataTypes.STRING,
  pto: DataTypes.STRING,
  refleja: DataTypes.STRING,
  f_doc: DataTypes.STRING,
  h_doc: DataTypes.STRING,
  do_bl: DataTypes.STRING,
  cli: DataTypes.STRING,
  subc: DataTypes.STRING,
  mod: DataTypes.STRING,
  lcl: DataTypes.STRING,
  cont: DataTypes.STRING,
  peso: DataTypes.STRING,
  unid: DataTypes.STRING,
  prod: DataTypes.STRING,
  esq: DataTypes.STRING,
  vence: DataTypes.STRING,
  orig: DataTypes.STRING,
  dest: DataTypes.STRING,
  t_v: DataTypes.STRING,
  ped: DataTypes.STRING,
  f_c: DataTypes.STRING,
  h_c: DataTypes.STRING,
  f_d: DataTypes.STRING,
  h_d: DataTypes.STRING,
  placa: DataTypes.STRING,
  f_p: DataTypes.STRING,
  f_f: DataTypes.STRING,
  obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE INSTRUCCIONES' },
  f_act: DataTypes.STRING,
  obs: DataTypes.TEXT,
  cond: DataTypes.TEXT,
  h_t: DataTypes.STRING,
  muc: DataTypes.STRING,
  desp: DataTypes.STRING,
  f_fin: DataTypes.STRING,
  est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
}, { 
  timestamps: true 
});

// LISTAS DESPLEGABLES (CONFIGURACIONES)
const opts = {
  oficina: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
  puertos: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO COMPAS CCTO', 'PUERTO BAHÍA', 'SOCIEDAD PORTUARIA REGIONAL DE CARTAGENA', 'SPIA - AGUADULCE', 'PLANTA ESENTTIA KM 8 VIA MAMONAL', 'PLANTA YARA CARTAGENA MAMONAL', 'N/A'],
  clientes: ['GEODIS COLOMBIA LTDA', 'MAERSK LOGISTICS SERVICES LTDA', 'SAMSUNG SDS COLOMBIA GLOBAL', 'ENVAECOL', 'SEA CARGO COLOMBIA LTDA', 'YARA COLOMBIA', 'ESENTTIA SA', 'BRINSA SA', 'ACERIAS PAZ DEL RIO', 'TERNIUM DEL ATLANTICO', 'PLASTICOS ESPECIALES SAS', 'INGENIO MAYAGUEZ', 'TENARIS', 'CASA LUKER', 'CORONA', 'EDITORIAL NOMOS', 'ALIMENTOS POLAR', 'PLEXA SAS ESP', 'FAJOBE'],
  modalidades: ['NACIONALIZADO', 'OTM', 'DTA', 'TRASLADO', 'NACIONALIZADO EXP', 'ITR', 'VACÍO EN EXPRESO', 'VACÍO CONSOLIDADO', 'NACIONALIZADO IMP'],
  lcl_fcl: ['CARGA SUELTA', 'CONTENEDOR 40', 'CONTENEDOR 20', 'REFER 40', 'REFER 20', 'FLAT RACK 20', 'FLAT RACK 40'],
  esquemas: ['1 ESCOLTA - SELLO', '2 ESCOLTAS SELLO - SPIA', 'SELLO', '1 ESCOLTA', '2 ESCOLTA', 'NO REQUIERE', '2 ESCOLTAS SELLO', 'INSPECTORES VIALES'],
  vehiculos: ['TURBO 2.5 TN', 'TURBO 4.5 TN', 'TURBO SENCILLO', 'SENCILLO 9 TN', 'PATINETA 2S3', 'TRACTOMULA 3S2', 'TRACTOMULA 3S3', 'CAMA BAJA', 'DOBLE TROQUE'],
  ciudades: ['BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUENAVENTURA', 'SANTA MARTA', 'CÚCUTA', 'IBAGUÉ', 'PEREIRA', 'MANIZALES', 'NEIVA', 'VILLAVICENCIO', 'YOPAL', 'SIBERIA', 'FUNZA', 'MOSQUERA', 'MADRID', 'FACATATIVÁ', 'TOCANCIPÁ', 'CHÍA', 'CAJICÁ'],
  subclientes: ['HIKVISION', 'PAYLESS COLOMBIA', 'INDUSTRIAS DONSSON', 'SAMSUNG SDS', 'ÉXITO', 'ALKOSTO', 'FALABELLA', 'SODIMAC', 'ENVAECOL', 'ALPLA', 'AMCOR', 'MEXICHEM', 'KOBA D1', 'JERONIMO MARTINS', 'TERNIUM', 'BRINSA', 'TENARIS', 'CORONA', 'FAJOBE'],
  estados: ['ASIGNADO VEHÍCULO', 'PENDIENTE CITA ASIGNADO', 'VEHÍCULO CON CITA', 'CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 'CONTENEDOR EN INSPECCIÓN', 'CONTENEDOR RETIRADO PARA ITR', 'DESPACHADO', 'DESPACHADO CON NOVEDAD', 'EN CONSECUCIÓN', 'EN PROGRAMACIÓN', 'EN SITIO DE CARGUE', 'FINALIZADO CON NOVEDAD', 'FINALIZADO SIN NOVEDAD', 'HOJA DE VIDA EN ESTUDIO', 'MERCANCÍA EN INSPECCIÓN', 'NOVEDAD', 'PENDIENTE BAJAR A PATIO', 'PENDIENTE INSTRUCCIONES', 'PRE ASIGNADO', 'RETIRADO DE PUERTO PENDIENTE CONSOLIDADO', 'CANCELADO POR GERENCIA', 'VEHICULO EN RUTA'],
  despachadores: ['ABNNER MARTINEZ', 'CAMILO TRIANA', 'FREDY CARRILLO', 'RAUL LOPEZ', 'EDDIER RIVAS']
};

// FUNCIÓN PARA OBTENER FECHA Y HORA EN COLOMBIA
const getNow = () => {
  return new Date().toLocaleString('es-CO', { 
    timeZone: 'America/Bogota', 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', second: '2-digit', 
    hour12: false 
  }).replace(/\//g, '-');
};

// DISEÑO CSS (ESTILOS GENERALES)
const css = `
<style>
  body { background: #0f172a; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; }
  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .sc { width: 100%; overflow-x: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; }
  .fs { height: 12px; margin-bottom: 5px; }
  .fc { width: 8600px; height: 1px; }
  table { border-collapse: collapse; min-width: 8600px; font-size: 11px; table-layout: fixed; }
  th { background: #1e40af; padding: 12px 5px; text-align: center; position: sticky; top: 0; border-right: 1px solid #3b82f6; color: #fff; text-transform: uppercase; }
  td { padding: 8px; border: 1px solid #334155; white-space: nowrap; text-align: center; overflow: hidden; text-overflow: ellipsis; }
  
  .col-num { width: 40px; }
  .col-id { width: 50px; font-weight: bold; color: #3b82f6; }
  .col-reg { width: 130px; font-size: 10px; color: #94a3b8; }
  .col-placa { width: 130px; background: #1e293b; }
  .in-placa { width: 85px; padding: 5px; border-radius: 4px; border: none; font-weight: bold; text-align: center; background: #f8fafc; color: #000; }
  .btn-ok { background: #10b981; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-weight: bold; }
  
  .col-est { width: 230px; padding: 0 !important; }
  .sel-est { background: #334155; color: #fff; border: none; padding: 8px; font-size: 10px; width: 100%; height: 100%; cursor: pointer; }
  
  .form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; background: #1e293b; padding: 25px; border-radius: 10px; border: 1px solid #2563eb; }
  .fg { display: flex; flex-direction: column; gap: 5px; }
  label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; }
  input, select, textarea { padding: 10px; border-radius: 5px; border: 1px solid #334155; font-size: 12px; background: #f8fafc; color: #0f172a; }
  
  .btn-submit { grid-column: 1 / -1; background: #2563eb; color: #fff; padding: 15px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; text-transform: uppercase; }
  .btn-submit:hover { background: #1d4ed8; }
  
  .controls { display: flex; gap: 15px; margin-bottom: 15px; align-items: center; }
  #busq { padding: 12px; width: 300px; border-radius: 6px; border: 1px solid #3b82f6; background: #1e293b; color: white; }
  .btn-xls { background: #166534; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; }
  .btn-stats { background: #5b21b6; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; display: flex; align-items: center; }
  
  .vence-rojo { background: #b91c1c !important; color: white !important; font-weight: bold; animation: blink 2s infinite; }
  .vence-amarillo { background: #eab308 !important; color: #000 !important; font-weight: bold; }
  @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
  
  tr:hover td { background: #1e293b !important; }
</style>`;

// RUTA PRINCIPAL - PANEL DE CONTROL
app.get('/', async (req, res) => {
  try {
    const cargas = await C.findAll({ order: [['id', 'DESC']] });
    let rows = '';
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    let index = 1;

    for (let c of cargas) {
      const isLocked = c.f_fin ? 'disabled' : '';
      
      // Lógica de Estado Visual
      let badgeColor = 'background: #475569; color: #cbd5e1'; // Pendiente
      let statusText = 'PENDIENTE';
      if (c.f_fin) { 
        badgeColor = 'background: #1e40af; color: #bfdbfe'; 
        statusText = 'FINALIZADO';
      } else if (c.placa) { 
        badgeColor = 'background: #065f46; color: #34d399'; 
        statusText = 'DESPACHADO';
      }
      
      // Alerta de Vencimiento
      let venceCls = '';
      if (c.vence && !c.f_fin) {
        const fVence = new Date(c.vence);
        const diffDays = Math.ceil((fVence - hoy) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) venceCls = 'vence-rojo';
        else if (diffDays <= 6) venceCls = 'vence-amarillo';
      }

      const selectEstado = `
        <select class="sel-est" ${isLocked} onchange="updState(${c.id}, this.value)">
          ${opts.estados.map(st => `<option value="${st}" ${c.obs_e === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>`;

      const fReg = new Date(c.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' });

      rows += `
      <tr class="fila-datos">
        <td class="col-num">${index++}</td>
        <td class="col-id">${c.id.toString().padStart(4, '0')}</td>
        <td class="col-reg">${fReg}</td>
        <td>${c.oficina||''}</td>
        <td style="min-width:180px">${c.emp_gen||''}</td>
        <td>${c.comercial||''}</td>
        <td>${c.pto||''}</td>
        <td>${c.refleja||''}</td>
        <td>${c.f_doc||''}</td>
        <td>${c.h_doc||''}</td>
        <td>${c.do_bl||''}</td>
        <td>${c.cli||''}</td>
        <td>${c.subc||''}</td>
        <td>${c.mod||''}</td>
        <td>${c.lcl||''}</td>
        <td>${c.cont||''}</td>
        <td>${c.peso||''}</td>
        <td>${c.unid||''}</td>
        <td>${c.prod||''}</td>
        <td>${c.esq||''}</td>
        <td class="${venceCls}" onclick="silenciar(this)">${c.vence||''}</td>
        <td>${c.orig||''}</td>
        <td>${c.dest||''}</td>
        <td>${c.t_v||''}</td>
        <td>${c.ped||''}</td>
        <td>${c.f_c||''}</td>
        <td>${c.h_c||''}</td>
        <td>${c.f_d||''}</td>
        <td>${c.h_d||''}</td>
        <td class="col-placa">
          <form action="/u/${c.id}" method="POST" style="margin:0; display:flex; gap:5px; justify-content:center;">
            <input name="placa" class="in-placa" value="${c.placa||''}" ${isLocked} placeholder="PLACA">
            <button class="btn-ok" ${isLocked}>OK</button>
          </form>
        </td>
        <td>${c.f_p||''}</td>
        <td>${c.f_f||''}</td>
        <td class="col-est">${selectEstado}</td>
        <td style="width:130px; color:#fbbf24; font-size:10px;">${c.f_act||''}</td>
        <td><span style="padding:4px 8px; border-radius:12px; font-weight:bold; font-size:9px; ${badgeColor}">${statusText}</span></td>
        <td style="white-space:normal; min-width:300px; text-align:left;">${c.obs||''}</td>
        <td style="white-space:normal; min-width:300px; text-align:left;">${c.cond||''}</td>
        <td>${c.h_t||''}</td>
        <td>${c.muc||''}</td>
        <td>${c.desp||''}</td>
        <td>${c.f_fin ? '✔️' : (c.placa ? `<a href="/finish/${c.id}" style="color:#10b981; font-weight:bold;">FINALIZAR</a>` : '...')}</td>
        <td style="width:130px; font-weight:bold; color:#3b82f6;">${c.f_fin||'--'}</td>
        <td style="width:80px">
          <a href="#" onclick="eliminar(${c.id})" style="text-decoration:none;">🗑️</a>
          <input type="checkbox" class="row-check" value="${c.id}" onclick="toggleDelBtn()">
        </td>
      </tr>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>LOGISV20 - PANEL</title>
      ${css}
    </head>
    <body onclick="activarAudio()">
      <div class="header-container">
        <h2 style="color: #3b82f6; margin: 0;">SISTEMA LOGISTICO DE YEGO ECO T S.A.S</h2>
        <div style="font-size: 12px; color: #94a3b8;">NODE_VERSION: 20</div>
      </div>

      <div class="controls">
        <input type="text" id="busq" onkeyup="buscar()" placeholder="🔍 Buscar por placa, cliente, DO, ciudad...">
        <button class="btn-xls" onclick="exportExcel()">⬇️ EXPORTAR EXCEL</button>
        <a href="/stats" class="btn-stats">📈 INDICADORES (KPIs)</a>
        <button id="btnDelMult" style="display:none; background:#ef4444; color:white; padding:10px; border-radius:6px; border:none; cursor:pointer;" onclick="eliminarSeleccionados()">BORRAR SELECCIONADOS (<span id="count">0</span>)</button>
      </div>

      <form action="/add" method="POST" class="form">
        <datalist id="list_ciud">${opts.ciudades.map(c=>`<option value="${c}">`).join('')}</datalist>
        <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Empresa</label><select name="emp_gen"><option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option></select></div>
        <div class="fg"><label>Comercial</label><select name="comercial"><option value="RAÚL LÓPEZ">RAÚL LÓPEZ</option></select></div>
        <div class="fg"><label>Puerto</label><select name="pto">${opts.puertos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Refleja</label><select name="refleja"><option value="SI">SI</option><option value="NO">NO</option></select></div>
        <div class="fg"><label>F. Documento</label><input name="f_doc" type="date"></div>
        <div class="fg"><label>H. Documento</label><input name="h_doc" type="time"></div>
        <div class="fg"><label>DO / BL</label><input name="do_bl"></div>
        <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Subcliente</label><select name="subc">${opts.subclientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Modalidad</label><select name="mod">${opts.modalidades.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>LCL/FCL</label><select name="lcl">${opts.lcl_fcl.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Contenedor</label><input name="cont" placeholder="ABCD1234567" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><label>Peso</label><input name="peso"></div>
        <div class="fg"><label>Unidades</label><input name="unid"></div>
        <div class="fg"><label>Producto</label><input name="prod"></div>
        <div class="fg"><label>Esquema</label><select name="esq">${opts.esquemas.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Vencimiento</label><input name="vence" type="date"></div>
        <div class="fg"><label>Origen</label><input name="orig" list="list_ciud"></div>
        <div class="fg"><label>Destino</label><input name="dest" list="list_ciud"></div>
        <div class="fg"><label>Tipo Vehículo</label><select name="t_v">${opts.vehiculos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Pedido</label><input name="ped"></div>
        <div class="fg"><label>F. Cargue</label><input name="f_c" type="date"></div>
        <div class="fg"><label>H. Cargue</label><input name="h_c" type="time"></div>
        <div class="fg"><label>F. Descargue</label><input name="f_d" type="date"></div>
        <div class="fg"><label>H. Descargue</label><input name="h_d" type="time"></div>
        <div class="fg"><label>F. Pagar</label><input name="f_p"></div>
        <div class="fg"><label>F. Factura</label><input name="f_f"></div>
        <div class="fg"><label>Estado Operación</label><select name="obs_e">${opts.estados.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Horario</label><input name="h_t"></div>
        <div class="fg"><label>MUC</label><input name="muc"></div>
        <div class="fg"><label>Despachador</label><select name="desp">${opts.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg" style="grid-column: span 2"><label>Observaciones</label><textarea name="obs" rows="2"></textarea></div>
        <div class="fg" style="grid-column: span 2"><label>Condiciones</label><textarea name="cond" rows="2"></textarea></div>
        <button class="btn-submit">REGISTRAR NUEVA CARGA</button>
      </form>

      <div class="sc fs" id="st"><div class="fc"></div></div>
      <div class="sc" id="sm">
        <table id="tabla">
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th class="col-id">ID</th>
              <th class="col-reg">FECHA REGISTRO</th>
              <th>OFICINA</th>
              <th>EMPRESA GENERADORA</th>
              <th>COMERCIAL</th>
              <th>PUERTO</th>
              <th>REFLEJA</th>
              <th>F.DOC</th>
              <th>H.DOC</th>
              <th>DO / BL</th>
              <th>CLIENTE</th>
              <th>SUBCLIENTE</th>
              <th>MODALIDAD</th>
              <th>LCL/FCL</th>
              <th>CONTENEDOR</th>
              <th>PESO</th>
              <th>UNID</th>
              <th>PRODUCTO</th>
              <th>ESQUEMA</th>
              <th>VENCE</th>
              <th>ORIGEN</th>
              <th>DESTINO</th>
              <th>TIPO VEHÍCULO</th>
              <th>PEDIDO</th>
              <th>F.C</th>
              <th>H.C</th>
              <th>F.D</th>
              <th>H.D</th>
              <th class="col-placa">PLACA</th>
              <th>VALOR PAGAR</th>
              <th>VALOR FACTURA</th>
              <th class="col-est">ESTADO ACTUAL</th>
              <th>ACTUALIZACIÓN</th>
              <th>ESTADO REAL</th>
              <th>OBSERVACIONES</th>
              <th>CONDICIONES</th>
              <th>HORA</th>
              <th>MUC</th>
              <th>DESPACHADOR</th>
              <th>ACCION</th>
              <th>HORA FIN</th>
              <th>ELIMINAR</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <script>
        const CLAVE = "ADMIN123";
        const t = document.getElementById('st'), m = document.getElementById('sm');
        t.onscroll = () => m.scrollLeft = t.scrollLeft;
        m.onscroll = () => t.scrollLeft = m.scrollLeft;

        function updState(id, v) {
          fetch('/state/'+id, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({obs_e: v})
          }).then(() => location.reload());
        }

        function eliminar(id) {
          if(prompt("Clave de administrador:") === CLAVE) {
            if(confirm("¿Seguro de eliminar este registro?")) window.location.href = "/d/" + id;
          }
        }

        function toggleDelBtn() {
          let c = document.querySelectorAll('.row-check:checked');
          document.getElementById('btnDelMult').style.display = c.length > 0 ? 'inline-block' : 'none';
          document.getElementById('count').innerText = c.length;
        }

        function eliminarSeleccionados() {
          if(prompt("Clave de administrador:") !== CLAVE) return alert("Clave incorrecta");
          let ids = Array.from(document.querySelectorAll('.row-check:checked')).map(i => i.value);
          if(confirm("¿Eliminar " + ids.length + " registros?")) {
            fetch('/delete-multiple', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ids})
            }).then(() => location.reload());
          }
        }

        function buscar() {
          let filter = document.getElementById("busq").value.toUpperCase();
          let tr = document.querySelectorAll(".fila-datos");
          tr.forEach(row => {
            row.style.display = row.innerText.toUpperCase().includes(filter) ? "" : "none";
          });
        }

        function exportExcel() {
          let csv = "sep=;\\n";
          let table = document.getElementById("tabla");
          for(let i=0; i<table.rows.length; i++) {
            if(table.rows[i].style.display !== "none") {
              let row = [], cols = table.rows[i].querySelectorAll("td, th");
              for(let j=0; j<cols.length - 1; j++) {
                let val = cols[j].querySelector("input, select") ? cols[j].querySelector("input, select").value : cols[j].innerText;
                row.push('"' + val.replace(/\\n/g, " ").replace(/;/g, ",") + '"');
              }
              csv += row.join(";") + "\\n";
            }
          }
          let blob = new Blob(["\\ufeff" + csv], {type: 'text/csv;charset=utf-8;'});
          let link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "Reporte_Logistica.csv";
          link.click();
        }

        let audioCtx;
        function activarAudio() { if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        function playAlert() {
          let rojos = document.querySelectorAll('.vence-rojo');
          if(rojos.length > 0 && audioCtx) {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.3);
            setTimeout(playAlert, 3000);
          }
        }
        window.onload = () => setTimeout(playAlert, 2000);
      </script>
    </body>
    </html>`);
  } catch (err) { res.status(500).send(err.message); }
});

// RUTAS DE ACCIÓN (CRUD)
app.post('/add', async (req, res) => {
  req.body.f_act = getNow();
  await C.create(req.body);
  res.redirect('/');
});

app.get('/d/:id', async (req, res) => {
  await C.destroy({ where: { id: req.params.id } });
  res.redirect('/');
});

app.post('/delete-multiple', async (req, res) => {
  await C.destroy({ where: { id: { [Op.in]: req.body.ids } } });
  res.sendStatus(200);
});

app.post('/u/:id', async (req, res) => {
  await C.update({ 
    placa: req.body.placa.toUpperCase(), 
    est_real: 'DESPACHADO', 
    f_act: getNow() 
  }, { where: { id: req.params.id } });
  res.redirect('/');
});

app.post('/state/:id', async (req, res) => {
  await C.update({ 
    obs_e: req.body.obs_e, 
    f_act: getNow() 
  }, { where: { id: req.params.id } });
  res.sendStatus(200);
});

app.get('/finish/:id', async (req, res) => {
  const t = getNow();
  await C.update({ 
    f_fin: t, 
    obs_e: 'FINALIZADO SIN NOVEDAD', 
    est_real: 'FINALIZADO', 
    f_act: t 
  }, { where: { id: req.params.id } });
  res.redirect('/');
});

// --- RUTA DE INDICADORES (KPIs) CON REQUERIMIENTO DE VEHÍCULOS ---
app.get('/stats', async (req, res) => {
  try {
    const cargas = await C.findAll();
    
    // Filtro de vehículos faltantes (SIN PLACA)
    const faltantes = cargas.filter(c => !c.placa || c.placa.trim() === '');
    
    // Agrupación por Ciudad y Tipo de Vehículo
    const porCiudad = {};
    const conteoGlobalTipo = {};

    faltantes.forEach(c => {
      const ciudad = (c.orig || 'SIN ORIGEN DEFINIDO').toUpperCase();
      const tipo = (c.t_v || 'TIPO NO ESPECIFICADO').toUpperCase();
      
      // Para la tabla
      if (!porCiudad[ciudad]) porCiudad[ciudad] = {};
      porCiudad[ciudad][tipo] = (porCiudad[ciudad][tipo] || 0) + 1;
      
      // Para la gráfica
      conteoGlobalTipo[tipo] = (conteoGlobalTipo[tipo] || 0) + 1;
    });

    const total = cargas.length;
    const fin = cargas.filter(c => c.f_fin).length;
    const ruta = cargas.filter(c => c.placa && !c.f_fin).length;

    res.send(`
    <html>
    <head>
      <meta charset="UTF-8">
      <title>KPI - LOGISV20</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { background: #0f172a; color: #fff; font-family: sans-serif; padding: 30px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .box { background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #334155; }
        .card { text-align: center; padding: 20px; background: #1e293b; border-radius: 10px; border: 1px solid #3b82f6; }
        .card h1 { margin: 10px 0; font-size: 40px; }
        .btn-back { display: inline-block; background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin-bottom: 20px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { text-align: left; border-bottom: 2px solid #3b82f6; padding: 10px; color: #94a3b8; }
        td { padding: 12px 10px; border-bottom: 1px solid #334155; }
        .badge { background: #ef4444; color: white; padding: 3px 8px; border-radius: 5px; font-weight: bold; font-size: 12px; margin-right: 5px; }
        .city-name { color: #60a5fa; font-weight: bold; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <a href="/" class="btn-back">⬅️ VOLVER AL PANEL</a>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
        <div class="card"><h3>TOTAL CARGAS</h3><h1>${total}</h1></div>
        <div class="card" style="border-color:#ef4444"><h3>REQUERIDAS (SIN PLACA)</h3><h1 style="color:#ef4444">${faltantes.length}</h1></div>
        <div class="card" style="border-color:#fbbf24"><h3>EN RUTA</h3><h1 style="color:#fbbf24">${ruta}</h1></div>
        <div class="card" style="border-color:#10b981"><h3>FINALIZADAS</h3><h1 style="color:#10b981">${fin}</h1></div>
      </div>

      <div class="grid">
        <div class="box">
          <h2 style="color:#f87171; margin-top:0;">📋 VEHÍCULOS FALTANTES POR ORIGEN</h2>
          <table>
            <thead>
              <tr><th>CIUDAD DE ORIGEN</th><th>TIPOS DE VEHÍCULO NECESARIOS</th></tr>
            </thead>
            <tbody>
              ${Object.entries(porCiudad).map(([ciudad, vehs]) => `
                <tr>
                  <td class="city-name">${ciudad}</td>
                  <td>
                    ${Object.entries(vehs).map(([tipo, cant]) => `
                      <div style="margin-bottom:8px">
                        <span class="badge">${cant}</span> <span>${tipo}</span>
                      </div>
                    `).join('')}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="box">
          <h2 style="color:#3b82f6; margin-top:0;">📊 RESUMEN DE NECESIDAD</h2>
          <canvas id="chartFaltantes"></canvas>
          <hr style="border:0; border-top:1px solid #334155; margin:30px 0;">
          <h3 style="text-align:center">ESTADO DE LA OPERACIÓN</h3>
          <div style="width:250px; margin: 0 auto;"><canvas id="chartPie"></canvas></div>
        </div>
      </div>

      <script>
        // Gráfico de Barras: Necesidad por Tipo
        new Chart(document.getElementById('chartFaltantes'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(conteoGlobalTipo))},
            datasets: [{
              label: 'Unidades Faltantes',
              data: ${JSON.stringify(Object.values(conteoGlobalTipo))},
              backgroundColor: '#ef4444',
              borderRadius: 5
            }]
          },
          options: {
            indexAxis: 'y',
            scales: {
              x: { ticks: { color: '#fff' }, grid: { color: '#334155' } },
              y: { ticks: { color: '#fff' }, grid: { display: false } }
            },
            plugins: { legend: { display: false } }
          }
        });

        // Gráfico de Torta: Estado General
        new Chart(document.getElementById('chartPie'), {
          type: 'doughnut',
          data: {
            labels: ['Finalizados', 'En Ruta', 'Sin Placa'],
            datasets: [{
              data: [${fin}, ${ruta}, ${faltantes.length}],
              backgroundColor: ['#10b981', '#fbbf24', '#ef4444'],
              borderWidth: 0
            }]
          },
          options: {
            plugins: { legend: { position: 'bottom', labels: { color: '#fff', padding: 20 } } }
          }
        });
      </script>
    </body>
    </html>`);
  } catch (err) { res.status(500).send(err.message); }
});

// INICIO DEL SERVIDOR
db.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
  });
});

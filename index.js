const express = require('express'), { Sequelize, DataTypes, Op } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, { 
  dialect: 'postgres', 
  logging: false, 
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
});

const C = db.define('Carga', {
  oficina: DataTypes.STRING, emp_gen: DataTypes.STRING, comercial: DataTypes.STRING, pto: DataTypes.STRING,
  refleja: DataTypes.STRING, f_doc: DataTypes.STRING, h_doc: DataTypes.STRING, do_bl: DataTypes.STRING,
  cli: DataTypes.STRING, subc: DataTypes.STRING, mod: DataTypes.STRING, lcl: DataTypes.STRING,
  cont: DataTypes.STRING, peso: DataTypes.STRING, unid: DataTypes.STRING, prod: DataTypes.STRING,
  esq: DataTypes.STRING, vence: DataTypes.STRING, orig: DataTypes.STRING, dest: DataTypes.STRING,
  t_v: DataTypes.STRING, ped: DataTypes.STRING, f_c: DataTypes.STRING, h_c: DataTypes.STRING,
  f_d: DataTypes.STRING, h_d: DataTypes.STRING, placa: DataTypes.STRING, f_p: DataTypes.STRING,
  f_f: DataTypes.STRING, obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE INSTRUCCIONES' },
  f_act: DataTypes.STRING, obs: DataTypes.TEXT, cond: DataTypes.TEXT, h_t: DataTypes.STRING,
  muc: DataTypes.STRING, desp: DataTypes.STRING, f_fin: DataTypes.STRING,
  est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
}, { timestamps: true });

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

const getNow = () => new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', hour12: false });

const css = `<style>
  body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
  .sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
  .fs{height:12px;margin-bottom:5px}
  .fc{width:8600px;height:1px}
  table{border-collapse:collapse;min-width:8600px;font-size:10px;table-layout: fixed;}
  th{background:#1e40af;padding:10px 5px;text-align:center;position:sticky;top:0;border-right:1px solid #3b82f6;}
  td{padding:6px;border:1px solid #334155;white-space:nowrap;text-align:center; overflow: hidden; text-overflow: ellipsis;}
  .col-num { width: 30px; } .col-id { width: 40px; font-weight: bold; }
  .col-placa { width: 120px; } .in-placa { width: 75px !important; font-size: 11px !important; font-weight: bold; height: 25px; }
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:4px}
  label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
  input,select,textarea{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}
  .btn{background:#2563eb;color:#fff;padding:10px 15px;cursor:pointer;border:none;font-weight:700;border-radius:6px;text-decoration:none;display:inline-block}
  .vence-rojo{background:#dc2626 !important;color:#fff !important;font-weight:bold;animation: blink 2s infinite;}
  @keyframes blink { 0% {opacity:1} 50% {opacity:0.6} 100% {opacity:1} }
</style>`;

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    let rows = ''; const hoy = new Date(); hoy.setHours(0,0,0,0); let index = 1;
    for (let c of d) {
      const isLocked = c.f_fin ? 'disabled' : '';
      let displayReal = 'PENDIENTE', stClass = 'background:#475569;color:#cbd5e1';
      if (c.f_fin) { displayReal = 'FINALIZADO'; stClass = 'background:#1e3a8a;color:#93c5fd;border:1px solid #3b82f6'; }
      else if (c.placa) { displayReal = 'DESPACHADO'; stClass = 'background:#064e3b;color:#6ee7b7;border:1px solid #10b981'; }
      let venceStyle = (c.vence && !c.f_fin && Math.ceil((new Date(c.vence) - hoy) / 864e5) <= 2) ? 'vence-rojo' : '';

      rows += `<tr class="fila-datos">
        <td class="col-num">${index++}</td><td class="col-id">${c.id.toString().padStart(4, '0')}</td>
        <td style="width:110px">${new Date(c.createdAt).toLocaleDateString()}</td>
        <td>${c.oficina||''}</td><td style="width:150px">${c.emp_gen||''}</td><td>${c.comercial||''}</td>
        <td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td>
        <td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td><td>${c.cont||''}</td>
        <td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td>
        <td class="${venceStyle}">${c.vence||''}</td><td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td>
        <td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td>
        <td class="col-placa"><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:4px">
          <input name="placa" class="in-placa" value="${c.placa||''}" ${isLocked} oninput="this.value=this.value.toUpperCase()">
          <button ${isLocked} style="background:#10b981;color:white;border:none;padding:5px;cursor:pointer">OK</button>
        </form></td>
        <td>${c.f_p||''}</td><td>${c.f_f||''}</td>
        <td style="width:210px"><select style="width:100%;background:#334155;color:#fff;border:none" ${isLocked} onchange="updState(${c.id}, this.value)">${opts.estados.map(st => `<option value="${st}" ${c.obs_e === st ? 'selected' : ''}>${st}</option>`).join('')}</select></td>
        <td style="width:115px;color:#fbbf24">${c.f_act||''}</td>
        <td style="width:100px"><span style="padding:2px 6px;border-radius:10px;font-weight:bold;font-size:8px;${stClass}">${displayReal}</span></td>
        <td style="white-space:normal;min-width:250px;text-align:left">${c.obs||''}</td><td style="white-space:normal;min-width:250px;text-align:left">${c.cond||''}</td>
        <td>${c.h_t||''}</td><td>${c.muc||''}</td><td>${c.desp||''}</td>
        <td>${c.f_fin? '✓':(c.placa? `<a href="/finish/${c.id}" style="background:#10b981;color:white;padding:3px 6px;border-radius:4px;text-decoration:none" onclick="return confirm('¿Finalizar?')">FIN</a>`:'...')}</td>
        <td style="width:115px"><b style="color:#3b82f6">${c.f_fin||'--'}</b></td>
        <td><a href="#" style="color:#f87171" onclick="eliminarConClave(${c.id})">🗑️</a></td>
      </tr>`;
    }

    res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
        <h2 style="color:#3b82f6;margin:0">SISTEMA LOGÍSTICO V20</h2>
        <a href="/stats" class="btn">📊 PANEL DE INDICADORES</a>
      </div>
      <form action="/add" method="POST" class="form">
        <datalist id="list_ciud">${opts.ciudades.map(c=>`<option value="${c}">`).join('')}</datalist>
        <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Empresa</label><select name="emp_gen"><option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option></select></div>
        <div class="fg"><label>Comercial</label><select name="comercial"><option value="RAÚL LÓPEZ">RAÚL LÓPEZ</option></select></div>
        <div class="fg"><label>Puerto</label><select name="pto">${opts.puertos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Refleja</label><select name="refleja"><option value="SI">SI</option><option value="NO">NO</option></select></div>
        <div class="fg"><label>F. Doc</label><input name="f_doc" type="date"></div>
        <div class="fg"><label>H. Doc</label><input name="h_doc" type="time"></div>
        <div class="fg"><label>DO/BL</label><input name="do_bl"></div>
        <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Subcliente</label><select name="subc">${opts.subclientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Modalidad</label><select name="mod">${opts.modalidades.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>LCL/FCL</label><select name="lcl">${opts.lcl_fcl.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><label>Peso</label><input name="peso"></div>
        <div class="fg"><label>Unid</label><input name="unid"></div>
        <div class="fg"><label>Prod</label><input name="prod"></div>
        <div class="fg"><label>Esq</label><select name="esq">${opts.esquemas.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Vence</label><input name="vence" type="date"></div>
        <div class="fg"><label>Origen</label><input name="orig" list="list_ciud"></div>
        <div class="fg"><label>Destino</label><input name="dest" list="list_ciud"></div>
        <div class="fg"><label>Vehículo</label><select name="t_v">${opts.vehiculos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Pedido</label><input name="ped"></div>
        <div class="fg"><label>F.C</label><input name="f_c" type="date"></div>
        <div class="fg"><label>H.C</label><input name="h_c" type="time"></div>
        <div class="fg"><label>F.D</label><input name="f_d" type="date"></div>
        <div class="fg"><label>H.D</label><input name="h_d" type="time"></div>
        <div class="fg"><label>F. Pagar</label><input name="f_p"></div>
        <div class="fg"><label>F. Fact</label><input name="f_f"></div>
        <div class="fg"><label>Estado</label><select name="obs_e">${opts.estados.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Horario</label><input name="h_t"></div>
        <div class="fg"><label>MUC</label><input name="muc"></div>
        <div class="fg"><label>Despachador</label><select name="desp">${opts.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg" style="grid-column: span 2"><label>Obs</label><textarea name="obs" rows="1"></textarea></div>
        <div class="fg" style="grid-column: span 2"><label>Cond</label><textarea name="cond" rows="1"></textarea></div>
        <button class="btn" style="grid-column: 1/-1">💾 REGISTRAR NUEVO SERVICIO</button>
      </form>
      <div class="sc fs" id="st"><div class="fc"></div></div>
      <div class="sc" id="sm">
        <table id="tabla">
          <thead><tr><th>#</th><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>EMPRESA</th><th>COMERCIAL</th><th>PUERTO</th><th>REFLEJA</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLIENTE</th><th>SUBCLIENTE</th><th>MODALIDAD</th><th>LCL/FCL</th><th>CONT</th><th>PESO</th><th>UNID</th><th>PROD</th><th>ESQ</th><th>VENCE</th><th>ORIG</th><th>DEST</th><th>VEHICULO</th><th>PEDIDO</th><th>F.C</th><th>H.C</th><th>F.D</th><th>H.D</th><th>PLACA</th><th>PAGAR</th><th>FACT</th><th>ESTADO</th><th>ACTUALIZACIÓN</th><th>ESTADO FINAL</th><th>OBSERVACIONES</th><th>CONDICIONES</th><th>HORA</th><th>MUC</th><th>DESPACHADOR</th><th>FIN</th><th>H.FIN</th><th>ACC</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <script>
        const CLAVE_ADMIN = "ADMIN123";
        const t=document.getElementById('st'),m=document.getElementById('sm'); t.onscroll=()=>m.scrollLeft=t.scrollLeft; m.onscroll=()=>t.scrollLeft=m.scrollLeft;
        function eliminarConClave(id){ if(prompt("Contraseña:")===CLAVE_ADMIN && confirm("¿Borrar?")) window.location.href="/d/"+id; }
        function updState(id,v){fetch('/state/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obs_e:v})}).then(()=>location.reload());}
      </script></body></html>`);
  } catch (e) { res.send(e.message); }
});

app.get('/stats', async (req, res) => {
  const d = await C.findAll(); const total = d.length; const finalizados = d.filter(c=>c.f_fin).length;
  const cliMap = {}; d.forEach(c => cliMap[c.cli] = (cliMap[c.cli] || 0) + 1);
  const topCli = Object.entries(cliMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  res.send(`<html><head><meta charset="UTF-8"><title>DASHBOARD</title>${css}</head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="color:#3b82f6">📊 INDICADORES DE GESTIÓN</h2>
      <a href="/" class="btn" style="background:#475569">🔙 VOLVER AL REGISTRO</a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px">
      <div style="background:#1e293b;padding:20px;border-radius:8px;text-align:center;border:1px solid #334155">
        <label style="font-size:10px;color:#94a3b8">SERVICIOS TOTALES</label><span style="display:block;font-size:32px;font-weight:bold;color:#3b82f6">${total}</span>
      </div>
      <div style="background:#1e293b;padding:20px;border-radius:8px;text-align:center;border:1px solid #334155">
        <label style="font-size:10px;color:#94a3b8">VIAJES FINALIZADOS</label><span style="display:block;font-size:32px;font-weight:bold;color:#10b981">${finalizados}</span>
      </div>
    </div>
    <div class="sc" style="padding:20px">
      <h3 style="margin-top:0;color:#3b82f6">🏆 TOP 5 CLIENTES</h3>
      <table style="min-width:auto; width:100%">
        <thead><tr><th>CLIENTE</th><th>VIAJES</th><th>%</th></tr></thead>
        <tbody>${topCli.map(([n,v])=>`<tr><td style="text-align:left">${n}</td><td>${v}</td><td>${(v/total*100).toFixed(1)}%</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </body></html>`);
});

app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO', f_act: getNow() }, { where: { id: req.params.id } }); res.redirect('/'); });
app.get('/finish/:id', async (req, res) => { const ahora = getNow(); await C.update({ f_fin: ahora, obs_e: 'FINALIZADO SIN NOVEDAD', est_real: 'FINALIZADO', f_act: ahora }, { where: { id: req.params.id } }); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/state/:id', async (req, res) => { await C.update({ obs_e: req.body.obs_e, f_act: getNow() }, { where: { id: req.params.id } }); res.sendStatus(200); });

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

const express = require('express'), { Sequelize, DataTypes, Op } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, { 
  dialect: 'postgres', logging: false, 
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
  td{padding:6px;border:1px solid #334155;white-space:nowrap;text-align:center;}
  .col-id { width: 40px; font-weight: bold; }
  .col-placa { width: 120px; }
  .in-placa { width: 75px !important; font-size: 11px !important; font-weight: bold; height: 25px; }
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:4px}
  label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
  input,select,textarea{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}
  .btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:12px;cursor:pointer;border:none;font-weight:700;border-radius:6px}
  .btn-nav{background:#3b82f6;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:12px;display:inline-flex;align-items:center;gap:5px}
  .btn-xls{background:#10b981;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer}
  .vence-rojo{background:#dc2626 !important;color:#fff !important;animation: blink 2s infinite;}
  @keyframes blink { 0% {opacity:1} 50% {opacity:0.6} 100% {opacity:1} }
  .kpi-card { background:#1e293b; padding:20px; border-radius:12px; border-left:4px solid #3b82f6; text-align:center; }
  .kpi-val { font-size:24px; font-weight:bold; display:block; margin-top:5px; }
  .bar-container { background:#334155; height:20px; border-radius:10px; overflow:hidden; margin-top:10px; position:relative; }
  .bar-fill { background:#3b82f6; height:100%; transition: width 0.5s; }
</style>`;

// RUTA PRINCIPAL (OPERACIÓN)
app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    let rows = ''; const hoy = new Date(); hoy.setHours(0,0,0,0); let index = 1;

    for (let c of d) {
      const isLocked = c.f_fin ? 'disabled' : '';
      let displayReal = 'PENDIENTE', stClass = 'background:#475569;color:#cbd5e1';
      if (c.f_fin) { displayReal = 'FINALIZADO'; stClass = 'background:#1e3a8a;color:#93c5fd;border:1px solid #3b82f6'; }
      else if (c.placa) { displayReal = 'DESPACHADO'; stClass = 'background:#064e3b;color:#6ee7b7;border:1px solid #10b981'; }
      
      let venceStyle = '';
      if (c.vence && !c.f_fin) {
        const diffDays = Math.ceil((new Date(c.vence) - hoy) / 864e5);
        if (diffDays <= 2) venceStyle = 'vence-rojo';
      }

      rows += `<tr class="fila-datos">
        <td>${index++}</td><td class="col-id">${c.id.toString().padStart(4, '0')}</td>
        <td>${new Date(c.createdAt).toLocaleDateString()}</td><td>${c.oficina||''}</td><td style="width:150px">${c.emp_gen||''}</td>
        <td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td>
        <td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td>
        <td>${c.cont||''}</td><td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td>
        <td class="${venceStyle}">${c.vence||''}</td><td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td>
        <td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td>
        <td class="col-placa"><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:4px">
          <input name="placa" class="in-placa" value="${c.placa||''}" ${isLocked} placeholder="PLACA" oninput="this.value=this.value.toUpperCase()">
          <button ${isLocked} style="background:#10b981;color:#fff;border:none;padding:5px;cursor:pointer">OK</button>
        </form></td>
        <td>${c.f_p||''}</td><td>${c.f_f||''}</td>
        <td style="width:210px"><select class="sel-est" ${isLocked} style="width:100%;background:#334155;color:#fff;border:none" onchange="updState(${c.id}, this.value)">${opts.estados.map(st => `<option value="${st}" ${c.obs_e === st ? 'selected' : ''}>${st}</option>`).join('')}</select></td>
        <td style="color:#fbbf24">${c.f_act||''}</td>
        <td><span style="padding:2px 6px;border-radius:10px;font-weight:bold;font-size:8px;${stClass}">${displayReal}</span></td>
        <td style="min-width:250px;text-align:left">${c.obs||''}</td><td style="min-width:250px;text-align:left">${c.cond||''}</td>
        <td>${c.h_t||''}</td><td>${c.muc||''}</td><td>${c.desp||''}</td>
        <td>${c.f_fin? '✓':(c.placa? `<a href="/finish/${c.id}" style="background:#10b981;color:white;padding:3px 6px;border-radius:4px;text-decoration:none" onclick="return confirm('¿Finalizar?')">FIN</a>`:'...')}</td>
        <td><b style="color:#3b82f6">${c.f_fin||'--'}</b></td>
        <td><a href="#" style="color:#f87171" onclick="eliminarConClave(${c.id})">🗑️</a> <input type="checkbox" class="row-check" value="${c.id}" onclick="toggleDelBtn()"></td>
      </tr>`;
    }

    res.send(`<html><head><meta charset="UTF-8"><title>OPERACIÓN</title>${css}</head><body>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
        <h2 style="color:#3b82f6;margin:0">SISTEMA LOGÍSTICO V20</h2>
        <a href="/stats" class="btn-nav">📊 PANEL DE INDICADORES</a>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:10px;align-items:center">
          <input type="text" id="busq" onkeyup="buscar()" placeholder="🔍 Filtrar placa, cliente..." style="padding:10px;width:250px;background:#1e293b;color:white;border:1px solid #3b82f6">
          <button class="btn-xls" onclick="exportExcel()">Excel</button>
          <button id="btnDelMult" style="background:#ef4444;color:white;padding:10px;border-radius:6px;display:none" onclick="eliminarSeleccionados()">Borrar Seleccionados (<span id="count">0</span>)</button>
      </div>
      <form action="/add" method="POST" class="form">
        <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><label>Vence</label><input name="vence" type="date"></div>
        <div class="fg"><label>Origen</label><input name="orig" list="list_ciud"></div>
        <div class="fg"><label>Destino</label><input name="dest" list="list_ciud"></div>
        <div class="fg"><label>Despachador</label><select name="desp">${opts.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <button class="btn">💾 REGISTRAR NUEVO DESPACHO</button>
      </form>
      <div class="sc fs" id="st"><div class="fc"></div></div>
      <div class="sc" id="sm">
        <table id="tabla"><thead><tr><th>#</th><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>EMPRESA</th><th>COMERCIAL</th><th>PTO</th><th>REF</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLIENTE</th><th>SUB</th><th>MOD</th><th>LCL</th><th>CONT</th><th>PESO</th><th>UNID</th><th>PROD</th><th>ESQ</th><th>VENCE</th><th>ORIG</th><th>DEST</th><th>VEHICULO</th><th>PED</th><th>F.C</th><th>H.C</th><th>F.D</th><th>H.D</th><th class="col-placa">PLACA</th><th>PAG</th><th>FACT</th><th>ESTADO</th><th>ACTUALIZACIÓN</th><th>ESTADO FINAL</th><th>OBS</th><th>COND</th><th>HORA</th><th>MUC</th><th>DESP</th><th>FIN</th><th>H.FIN</th><th>ACC</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <script>
        const CLAVE_ADMIN = "ADMIN123";
        const t=document.getElementById('st'),m=document.getElementById('sm'); t.onscroll=()=>m.scrollLeft=t.scrollLeft; m.onscroll=()=>t.scrollLeft=m.scrollLeft;
        function eliminarConClave(id){ if(prompt("Contraseña:")===CLAVE_ADMIN && confirm("¿Borrar?")) window.location.href="/d/"+id; }
        function eliminarSeleccionados(){ if(prompt("Contraseña:")===CLAVE_ADMIN) { 
          const ids=Array.from(document.querySelectorAll('.row-check:checked')).map(cb=>cb.value);
          fetch('/delete-multiple',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})}).then(()=>location.reload());
        }}
        function toggleDelBtn(){ const c=document.querySelectorAll('.row-check:checked').length; document.getElementById('btnDelMult').style.display=c>0?'block':'none'; document.getElementById('count').innerText=c; }
        function updState(id,v){fetch('/state/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obs_e:v})}).then(()=>location.reload());}
        function buscar(){ 
          let f=document.getElementById("busq").value.toUpperCase(), filas=document.querySelectorAll(".fila-datos");
          filas.forEach(r => r.style.display = r.innerText.toUpperCase().includes(f) ? "" : "none");
        }
      </script></body></html>`);
  } catch (e) { res.send(e.message); }
});

// RUTA DE INDICADORES (DASHBOARD)
app.get('/stats', async (req, res) => {
  const d = await C.findAll();
  const total = d.length;
  const conPlaca = d.filter(c => c.placa).length;
  const finalizados = d.filter(c => c.f_fin).length;
  const sinPlaca = total - conPlaca;
  const efAsignacion = total > 0 ? ((conPlaca / total) * 100).toFixed(1) : 0;

  // Calculo Top Clientes
  const cliMap = {}; d.forEach(c => cliMap[c.cli] = (cliMap[c.cli] || 0) + 1);
  const topCli = Object.entries(cliMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Calculo Top Destinos
  const destMap = {}; d.forEach(c => { if(c.dest) destMap[c.dest] = (destMap[c.dest] || 0) + 1 });
  const topDest = Object.entries(destMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Calculo Top Placas (Fidelidad)
  const placaMap = {}; d.forEach(c => { if(c.placa) placaMap[c.placa] = (placaMap[c.placa] || 0) + 1 });
  const topPlacas = Object.entries(placaMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  res.send(`<html><head><meta charset="UTF-8"><title>INDICADORES</title>${css}</head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:30px">
      <h2 style="color:#3b82f6;margin:0">📊 PANEL DE INDICADORES LOGÍSTICOS</h2>
      <a href="/" class="btn-nav" style="background:#475569">🔙 VOLVER A OPERACIÓN</a>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:40px">
      <div class="kpi-card"><label>VOLUMEN TOTAL</label><span class="kpi-val">${total}</span><small>Servicios Creados</small></div>
      <div class="kpi-card" style="border-color:#10b981"><label>EFECTIVIDAD ASIGNACIÓN</label><span class="kpi-val">${efAsignacion}%</span>
        <div class="bar-container"><div class="bar-fill" style="width:${efAsignacion}%"></div></div>
      </div>
      <div class="kpi-card" style="border-color:#f59e0b"><label>PENDIENTES PLACA</label><span class="kpi-val">${sinPlaca}</span><small>En espera de camión</small></div>
      <div class="kpi-card" style="border-color:#1e40af"><label>FINALIZADOS</label><span class="kpi-val">${finalizados}</span><small>Viajes cerrados</small></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px">
      <div style="background:#1e293b;padding:20px;border-radius:12px">
        <h3 style="margin-top:0;color:#3b82f6">🏆 TOP 5 CLIENTES</h3>
        ${topCli.map(([name, count]) => `
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12px"><span>${name}</span><b>${count}</b></div>
            <div class="bar-container"><div class="bar-fill" style="width:${(count/total*100)}%;background:#10b981"></div></div>
          </div>
        `).join('')}
      </div>
      <div style="background:#1e293b;padding:20px;border-radius:12px">
        <h3 style="margin-top:0;color:#3b82f6">📍 TOP 5 DESTINOS</h3>
        ${topDest.map(([name, count]) => `
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12px"><span>${name}</span><b>${count}</b></div>
            <div class="bar-container"><div class="bar-fill" style="width:${(count/total*100)}%;background:#f59e0b"></div></div>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="margin-top:30px;background:#1e293b;padding:20px;border-radius:12px">
      <h3 style="margin-top:0;color:#3b82f6;text-align:center">🚛 FIDELIDAD DE FLOTA (TOP PLACAS)</h3>
      <div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:15px">
        ${topPlacas.map(([placa, count]) => `
          <div style="background:#0f172a;padding:15px;border-radius:8px;border:1px solid #3b82f6;text-align:center;min-width:120px">
            <span style="display:block;font-weight:bold;color:#3b82f6;font-size:18px">${placa}</span>
            <span style="font-size:12px">${count} Viajes</span>
          </div>
        `).join('')}
      </div>
    </div>
  </body></html>`);
});

// APIS Y SERVIDOR
app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/delete-multiple', async (req, res) => { await C.destroy({ where: { id: { [Op.in]: req.body.ids } } }); res.sendStatus(200); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO', f_act: getNow() }, { where: { id: req.params.id } }); res.redirect('/'); });
app.post('/state/:id', async (req, res) => { await C.update({ obs_e: req.body.obs_e, f_act: getNow() }, { where: { id: req.params.id } }); res.sendStatus(200); });
app.get('/finish/:id', async (req, res) => { const ahora = getNow(); await C.update({ f_fin: ahora, obs_e: 'FINALIZADO SIN NOVEDAD', est_real: 'FINALIZADO', f_act: ahora }, { where: { id: req.params.id } }); res.redirect('/'); });

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));   

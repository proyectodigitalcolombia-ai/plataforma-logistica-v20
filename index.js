const express = require('express'), { Sequelize, DataTypes, Op } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());
const db = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } });

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

const css = `<style>body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}.sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}.fs{height:12px;margin-bottom:5px}.fc{width:8600px;height:1px}table{border-collapse:collapse;min-width:8600px;font-size:10px}th{background:#1e40af;padding:12px;text-align:center;position:sticky;top:0;white-space:nowrap;border-right:1px solid #3b82f6}td{padding:8px;border:1px solid #334155;white-space:nowrap;text-align:center}.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}.fg{display:flex;flex-direction:column;gap:4px}label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}input,select,textarea{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}.btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:15px;cursor:pointer;border:none;font-weight:700;border-radius:6px}.btn-xls{background:#10b981;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer}.btn-del-mult{background:#ef4444;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer;display:none}#busq{padding:10px;width:250px;border-radius:6px;border:1px solid #3b82f6;background:#1e293b;color:white;font-weight:bold}.vence-rojo{background:#dc2626 !important;color:#fff !important;font-weight:bold;animation: blink 2s infinite;cursor:pointer}.vence-amarillo{background:#fbbf24 !important;color:#000 !important;font-weight:bold}@keyframes blink { 0% {opacity:1} 50% {opacity:0.6} 100% {opacity:1} }</style>`;

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    let rows = '';
    const hoy = new Date(); hoy.setHours(0,0,0,0);

    for (let c of d) {
      const isLocked = c.f_fin ? 'disabled' : '';
      const displayReal = (c.est_real === 'FINALIZADO' || c.est_real === 'DESPACHADO') ? 'DESPACHADO' : 'PENDIENTE';
      const stClass = displayReal === 'DESPACHADO' ? 'background:#065f46;color:#34d399' : 'background:#475569;color:#cbd5e1';
      let venceStyle = '';
      if (c.vence && !c.f_fin) {
        const fVence = new Date(c.vence);
        const diffDays = Math.ceil((fVence - hoy) / 864e5);
        if (diffDays <= 2) venceStyle = 'vence-rojo';
        else if (diffDays <= 6) venceStyle = 'vence-amarillo';
      }
      const selectEstado = `<select class="sel-est" ${isLocked} onchange="updState(${c.id}, this.value)" style="background:#334155;color:#fff;border:none;padding:8px 4px;font-size:9px;width:100%;min-width:165px;cursor:pointer;text-align:center">${opts.estados.map(st => `<option value="${st}" ${c.obs_e === st ? 'selected' : ''}>${st}</option>`).join('')}</select>`;
      let accionFin = c.f_fin ? `<span style="color:#10b981">✓ FINALIZADO</span>` : (c.placa ? `<a href="/finish/${c.id}" style="background:#10b981;color:white;padding:5px 8px;border-radius:4px;font-weight:bold;text-decoration:none;font-size:9px" onclick="return confirm('¿Finalizar?')">🏁 FINALIZAR</a>` : `<span style="font-size:8px;color:#94a3b8">PENDIENTE PLACA</span>`);
      
      rows += `<tr>
        <td><input type="checkbox" class="row-check" value="${c.id}" onclick="toggleDelBtn()"></td>
        <td><b>${c.id}</b></td>
        <td>${new Date(c.createdAt).toLocaleString()}</td>
        <td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td><td>${c.cont||''}</td><td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td>
        <td class="${venceStyle}" onclick="silenciar(this)">${c.vence||''}</td>
        <td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td><td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td>
        <td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:2px"><input name="placa" value="${c.placa||''}" ${isLocked} class="placa-input" style="width:60px" oninput="this.value=this.value.toUpperCase()"><button ${isLocked} style="background:#10b981;color:#fff;border:none;padding:3px;border-radius:2px">OK</button></form></td>
        <td>${c.f_p||''}</td><td>${c.f_f||''}</td>
        <td style="padding:0;width:1px">${selectEstado}</td>
        <td style="width:135px;color:#fbbf24;font-weight:bold">${c.f_act||''}</td>
        <td><span style="padding:4px 8px;border-radius:12px;font-weight:bold;font-size:9px;text-transform:uppercase;${stClass}">${displayReal}</span></td>
        <td style="white-space:normal;min-width:300px;text-align:left">${c.obs||''}</td>
        <td style="white-space:normal;min-width:300px;text-align:left">${c.cond||''}</td>
        <td>${c.h_t||''}</td><td>${c.muc||''}</td><td>${c.desp||''}</td>
        <td>${accionFin}</td>
        <td><b style="color:#3b82f6">${c.f_fin||'--:--'}</b></td>
        <td><a href="/d/${c.id}" style="color:#f87171;text-decoration:none;font-weight:bold" onclick="return confirm('¿Eliminar despacho?')">ELIMINAR DESPACHO</a></td>
      </tr>`;
    }

    res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body onclick="activarAudio()">
      <h2 style="color:#3b82f6">SISTEMA DE CONTROL LOGÍSTICO V20</h2>
      <div style="display:flex;gap:15px;margin-bottom:15px;align-items:center;flex-wrap:wrap">
        <div style="background:#1e293b;padding:8px 12px;border-radius:6px;border:1px solid #2563eb;display:flex;align-items:center;gap:8px">
          <input type="checkbox" id="checkAll" onclick="selectAll(this)"> <label style="font-size:10px;font-weight:bold;color:#fff;cursor:pointer">SELECCIONAR TODO</label>
        </div>
        <input type="text" id="busq" onkeyup="buscar()" placeholder="🔍 Filtrar por Placa, Contenedor...">
        <button class="btn-xls" onclick="exportExcel()">📥 EXPORTAR A EXCEL</button>
        <button id="btnDelMult" class="btn-del-mult" onclick="eliminarSeleccionados()">🗑️ ELIMINAR SELECCIONADOS (<span id="count">0</span>)</button>
      </div>
      <form action="/add" method="POST" class="form"><datalist id="list_ciud">${opts.ciudades.map(c=>`<option value="${c}">`).join('')}</datalist><div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>Empresa Generadora</label><select name="emp_gen"><option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option></select></div><div class="fg"><label>Comercial</label><select name="comercial"><option value="RAÚL LÓPEZ">RAÚL LÓPEZ</option></select></div><div class="fg"><label>Puerto</label><select name="pto">${opts.puertos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>Refleja</label><select name="refleja"><option value="SI">SI</option><option value="NO">NO</option></select></div><div class="fg"><label>Fecha Documento</label><input name="f_doc" type="date"></div><div class="fg"><label>Hora Documento</label><input name="h_doc" type="time"></div><div class="fg"><label>DO / BL / OC</label><input name="do_bl"></div><div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>Subcliente</label><select name="subc">${opts.subclientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>Modalidad</label><select name="mod">${opts.modalidades.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>LCL / FCL</label><select name="lcl">${opts.lcl_fcl.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>Número Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div><div class="fg"><label>Peso Kilogramos</label><input name="peso"></div><div class="fg"><label>Unidades</label><input name="unid"></div><div class="fg"><label>Producto</label><input name="prod"></div><div class="fg"><label>Esquema Seguridad</label><select name="esq">${opts.esquemas.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>Vence Puerto</label><input name="vence" type="date"></div><div class="fg"><label>Origen</label><input name="orig" list="list_ciud"></div><div class="fg"><label>Destino</label><input name="dest" list="list_ciud"></div><div class="fg"><label>Tipo Vehículo</label><select name="t_v">${opts.vehiculos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>Pedido</label><input name="ped"></div><div class="fg"><label>Fecha Cargue</label><input name="f_c" type="date"></div><div class="fg"><label>Hora Cargue</label><input name="h_c" type="time"></div><div class="fg"><label>Fecha Descargue</label><input name="f_d" type="date"></div><div class="fg"><label>Hora Descargue</label><input name="h_d" type="time"></div><div class="fg"><label>Flete Pagar</label><input name="f_p"></div><div class="fg"><label>Flete Facturar</label><input name="f_f"></div><div class="fg"><label>Estado Inicial</label><select name="obs_e">${opts.estados.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>Horario</label><input name="h_t"></div><div class="fg"><label>MUC</label><input name="muc"></div><div class="fg"><label>Despachador</label><select name="desp">${opts.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg" style="grid-column: span 2"><label>Observaciones del Servicio</label><textarea name="obs" rows="1"></textarea></div><div class="fg" style="grid-column: span 2"><label>Condiciones Especiales</label><textarea name="cond" rows="1"></textarea></div><button class="btn">💾 REGISTRAR NUEVA CARGA</button></form>
      <div class="sc fs" id="st"><div class="fc"></div></div>
      <div class="sc" id="sm"><table id="tabla"><thead><tr><th>X</th><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>EMPRESA</th><th>COMERCIAL</th><th>PUERTO</th><th>REFLEJA</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLI</th><th>SUB</th><th>MOD</th><th>LCL</th><th>CONT</th><th>PESO</th><th>UNID</th><th>PROD</th><th>ESQ</th><th>VENCE</th><th>ORIGEN</th><th>DEST</th><th>VEHICULO</th><th>PED</th><th>F.C</th><th>H.C</th><th>F.D</th><th>H.D</th><th>PLACA</th><th>PAGAR</th><th>FACT</th><th>ESTADO</th><th>ACTU</th><th>REAL</th><th>OBS</th><th>COND</th><th>HORA</th><th>MUC</th><th>DESP</th><th>FIN</th><th>H.FIN</th><th>ACCIONES</th></tr></thead><tbody>${rows}</tbody></table></div>
      <script>
      const t=document.getElementById('st'),m=document.getElementById('sm');t.onscroll=()=>m.scrollLeft=t.scrollLeft;m.onscroll=()=>t.scrollLeft=m.scrollLeft;
      function selectAll(source){ 
        const checkboxes = document.getElementsByClassName('row-check'); 
        for(let i=0; i<checkboxes.length; i++) checkboxes[i].checked = source.checked; 
        toggleDelBtn(); 
      }
      function toggleDelBtn(){ 
        const checked = document.querySelectorAll('.row-check:checked');
        const btn = document.getElementById('btnDelMult');
        const countSpan = document.getElementById('count');
        countSpan.innerText = checked.length;
        btn.style.display = checked.length > 0 ? 'inline-block' : 'none'; 
      }
      function eliminarSeleccionados(){ 
        const checked = document.querySelectorAll('.row-check:checked');
        if(!confirm('¿Eliminar definitivamente ' + checked.length + ' despachos seleccionados?')) return; 
        const ids = Array.from(checked).map(cb => cb.value); 
        fetch('/delete-multiple',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})}).then(()=>location.reload()); 
      }
      function updState(id,v){fetch('/state/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obs_e:v})}).then(()=>location.reload());}
      function buscar(){let f=document.getElementById("busq").value.toUpperCase(),filas=document.getElementById("tabla").getElementsByTagName("tr");for(let i=1;i<filas.length;i++){filas[i].style.display=filas[i].innerText.toUpperCase().includes(f)?"":"none";}}
      function exportExcel(){let csv="sep=;\\n";document.querySelectorAll("#tabla tr").forEach(row=>{if(row.style.display!=="none"){let cols=Array.from(row.querySelectorAll("td, th")).map(c=>{let inp=c.querySelector("input,select,textarea");return '"'+(inp?inp.value:c.innerText.split('\\n')[0]).replace(/;/g,",").trim()+'"';});csv+=cols.slice(1,-1).join(";")+"\\n";}});const b=new Blob(["\\ufeff"+csv],{type:"text/csv;charset=utf-8;"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="Reporte.csv";a.click();}
      let audioContext; function activarAudio(){ if(!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)(); playAlert(); }
      function silenciar(el){ el.dataset.silenced = "true"; el.style.animation = "none"; el.style.background = "#450a0a"; }
      function playAlert(){ 
        let reds = Array.from(document.querySelectorAll('.vence-rojo')).filter(el => el.dataset.silenced !== "true");
        if(reds.length > 0 && audioContext){ 
          let osc=audioContext.createOscillator(),gain=audioContext.createGain(); 
          osc.type='square'; osc.frequency.setValueAtTime(440, audioContext.currentTime); 
          osc.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime+0.1); 
          gain.gain.setValueAtTime(0.1, audioContext.currentTime); 
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime+0.5); 
          osc.connect(gain); gain.connect(audioContext.destination); 
          osc.start(); osc.stop(audioContext.currentTime+0.5); 
          setTimeout(playAlert, 2000); 
        }
      } window.onload=()=>setTimeout(playAlert,1000);
      </script></body></html>`);
  } catch (e) { res.send(e.message); }
});

app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/delete-multiple', async (req, res) => { await C.destroy({ where: { id: req.body.ids } }); res.sendStatus(200); });
app.post('/u/:id', async (req, res) => { await C.update({ placa: req.body.placa.toUpperCase(), est_real: 'DESPACHADO', f_act: getNow() }, { where: { id: req.params.id } }); res.redirect('/'); });
app.post('/state/:id', async (req, res) => { await C.update({ obs_e: req.body.obs_e, f_act: getNow() }, { where: { id: req.params.id } }); res.sendStatus(200); });
app.get('/finish/:id', async (req, res) => { const ahora = getNow(); await C.update({ f_fin: ahora, obs_e: 'FINALIZADO SIN NOVEDAD', est_real: 'FINALIZADO', f_act: ahora }, { where: { id: req.params.id } }); res.redirect('/'); });

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

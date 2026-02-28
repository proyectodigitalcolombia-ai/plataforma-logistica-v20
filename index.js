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
  td{padding:6px;border:1px solid #334155;white-space:nowrap;text-align:center;}
  .col-num { width: 30px; }
  .col-id { width: 40px; font-weight: bold; }
  .col-placa { width: 120px; }
  .in-placa { width: 75px !important; font-size: 11px !important; font-weight: bold; height: 25px; }
  .col-est { width: 210px; padding: 0 !important; }
  .sel-est { background:#334155; color:#fff; border:none; padding:4px; font-size:9px; width:100%; height: 100%; text-align: center; }
  .btn-del-mult{background:#ef4444;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer;display:none}
  .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
  .fg{display:flex;flex-direction:column;gap:4px}
  input,select,textarea{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}
  .btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:15px;cursor:pointer;border:none;font-weight:700;border-radius:6px}
  #busq{padding:10px;width:250px;border-radius:6px;border:1px solid #3b82f6;background:#1e293b;color:white}
</style>`;

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    let rows = '';
    let index = 1;

    for (let c of d) {
      const isLocked = c.f_fin ? 'disabled' : '';
      const tienePlaca = (c.placa && c.placa.trim().length >= 5);
      const displayReal = (c.est_real === 'FINALIZADO' || c.est_real === 'DESPACHADO') ? 'DESPACHADO' : 'PENDIENTE';
      const stClass = displayReal === 'DESPACHADO' ? 'background:#065f46;color:#34d399' : 'background:#475569;color:#cbd5e1';
      
      let accionFin = c.f_fin 
        ? `<div style="display:flex;flex-direction:column;gap:2px">
             <span style="color:#10b981">✓</span>
             <a href="/reversar/${c.id}" style="background:#6366f1;color:white;padding:2px 4px;border-radius:3px;text-decoration:none;font-size:8px" onclick="return confirm('¿Reversar finalización?')">↩ REVERSAR</a>
           </div>` 
        : (tienePlaca 
            ? `<a href="/finish/${c.id}" style="background:#10b981;color:white;padding:3px 6px;border-radius:4px;text-decoration:none;font-size:9px" onclick="return confirm('¿Finalizar?')">FIN</a>` 
            : `<span style="color:#64748b;font-size:8.5px;font-style:italic">⛔ PLACA</span>`);

      rows += `<tr class="fila-datos">
        <td class="col-num">${index++}</td>
        <td class="col-id">${c.id.toString().padStart(4, '0')}</td>
        <td style="width:110px">${new Date(c.createdAt).toLocaleDateString()}</td>
        <td>${c.oficina||''}</td>
        <td style="width:150px">${c.emp_gen||''}</td>
        <td>${c.comercial||''}</td>
        <td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td><td>${c.cont||''}</td><td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td><td>${c.vence||''}</td><td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td><td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td>
        <td class="col-placa">
          <form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:4px;justify-content:center;align-items:center" onsubmit="return valPlaca(this)">
            <input name="placa" class="in-placa" value="${c.placa||''}" ${isLocked} placeholder="PLACA" oninput="this.value=this.value.toUpperCase()">
            <button ${isLocked} style="background:#10b981;color:#fff;border:none;padding:5px;border-radius:3px;cursor:pointer">OK</button>
          </form>
        </td>
        <td>${c.f_p||''}</td><td>${c.f_f||''}</td>
        <td class="col-est"><select class="sel-est" ${isLocked} onchange="updState(${c.id}, this.value)">${opts.estados.map(st => `<option value="${st}" ${c.obs_e === st ? 'selected' : ''}>${st}</option>`).join('')}</select></td>
        <td style="width:115px;color:#fbbf24">${c.f_act||''}</td>
        <td style="width:100px"><span style="padding:2px 6px;border-radius:10px;font-weight:bold;font-size:8px;${stClass}">${displayReal}</span></td>
        <td style="white-space:normal;min-width:250px;text-align:left">${c.obs||''}</td>
        <td style="white-space:normal;min-width:250px;text-align:left">${c.cond||''}</td>
        <td>${c.h_t||''}</td><td>${c.muc||''}</td><td style="width:130px">${c.desp||''}</td>
        <td>${accionFin}</td>
        <td style="width:115px"><b style="color:#3b82f6">${c.f_fin||'--'}</b></td>
        <td style="width:70px">
          <div style="display:flex;gap:8px;justify-content:center;align-items:center">
            ${tienePlaca ? '🔒' : `<a href="/d/${c.id}" style="color:#f87171;text-decoration:none" onclick="return confirm('¿Borrar?')">🗑️</a>`}
            ${tienePlaca ? '' : `<input type="checkbox" class="row-check" value="${c.id}" onclick="toggleDelBtn()">`}
          </div>
        </td>
      </tr>`;
    }

    res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>
      <h2 style="color:#3b82f6;">LOGÍSTICA V20</h2>
      <div style="display:flex;gap:10px;margin-bottom:10px;align-items:center;">
          <input type="text" id="busq" onkeyup="buscar()" placeholder="🔍 Filtrar...">
          <button id="btnDelMult" class="btn-del-mult" onclick="eliminarSeleccionados()">Borrar Seleccionados (<span id="count">0</span>)</button>
          <div style="background:#2563eb;padding:5px 10px;border-radius:6px;display:flex;align-items:center;gap:5px;">
            <label style="font-size:10px;color:#fff;">Todos</label>
            <input type="checkbox" id="checkAll" onclick="selectAll(this)">
          </div>
      </div>
      
      <form action="/add" method="POST" class="form">
        <datalist id="list_ciud">${opts.ciudades.map(c=>`<option value="${c}">`).join('')}</datalist>
        <div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Empresa</label><select name="emp_gen"><option value="YEGO ECO-T SAS">YEGO ECO-T SAS</option></select></div>
        <div class="fg"><label>Puerto</label><select name="pto">${opts.puertos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Cliente</label><select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>Subcliente</label><select name="subc">${opts.subclientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg"><label>DO/BL</label><input name="do_bl"></div>
        <div class="fg"><label>Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><label>Origen</label><input name="orig" list="list_ciud"></div>
        <div class="fg"><label>Destino</label><input name="dest" list="list_ciud"></div>
        <div class="fg"><label>Despachador</label><select name="desp">${opts.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
        <div class="fg" style="grid-column: span 2"><label>Obs</label><textarea name="obs" rows="1"></textarea></div>
        <button class="btn">💾 REGISTRAR</button>
      </form>

      <div class="sc fs" id="st"><div class="fc"></div></div>
      <div class="sc" id="sm">
        <table id="tabla">
          <thead>
            <tr>
              <th class="col-num">#</th><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>EMPRESA</th><th>COMERCIAL</th><th>PUERTO</th><th>REFLEJA</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLIENTE</th><th>SUBCLIENTE</th><th>MODALIDAD</th><th>LCL/FCL</th><th>CONTENEDOR</th><th>PESO</th><th>UNID</th><th>PRODUCTO</th><th>ESQUEMA</th><th>VENCE</th><th>ORIGEN</th><th>DESTINO</th><th>VEHICULO</th><th>PEDIDO</th><th>F.C</th><th>H.C</th><th>F.D</th><th>H.D</th><th class="col-placa">PLACA</th><th>PAGAR</th><th>FACTURA</th><th class="col-est">ESTADO</th><th>ACTUALIZACIÓN</th><th>REAL</th><th>OBS</th><th>COND</th><th>HORA</th><th>MUC</th><th>DESP</th><th>FIN</th><th>H.FIN</th><th>ACC</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <script>
      function valPlaca(f){
        const p = f.placa.value.trim();
        if(p.length < 5 && p !== ""){ alert("PLACA INVÁLIDA"); return false; }
        return true;
      }
      const t=document.getElementById('st'),m=document.getElementById('sm');
      t.onscroll=()=>m.scrollLeft=t.scrollLeft;
      m.onscroll=()=>t.scrollLeft=m.scrollLeft;

      function selectAll(source){ 
        const checkboxes = document.getElementsByClassName('row-check'); 
        for(let i=0; i<checkboxes.length; i++){
          if(checkboxes[i].closest('tr').style.display !== 'none') checkboxes[i].checked = source.checked;
        }
        toggleDelBtn(); 
      }

      function toggleDelBtn(){ 
        const checked = document.querySelectorAll('.row-check:checked');
        const btn = document.getElementById('btnDelMult');
        document.getElementById('count').innerText = checked.length;
        btn.style.display = checked.length > 0 ? 'inline-block' : 'none'; 
      }

      function eliminarSeleccionados(){ 
        const checked = document.querySelectorAll('.row-check:checked');
        const ids = Array.from(checked).map(cb => cb.value);
        if(!confirm('¿Eliminar ' + ids.length + ' registros?')) return; 
        fetch('/delete-multiple',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})}).then(()=>location.reload()); 
      }

      function updState(id,v){fetch('/state/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obs_e:v})}).then(()=>location.reload());}
      
      function buscar(){
        let f = document.getElementById("busq").value.toUpperCase();
        let filas = document.querySelectorAll(".fila-datos");
        filas.forEach(fila => {
          let mostrar = fila.innerText.toUpperCase().includes(f);
          fila.style.display = mostrar ? "" : "none";
        });
      }
      </script></body></html>`);
  } catch (e) { res.send(e.message); }
});

app.post('/add', async (req, res) => { req.body.f_act = getNow(); await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async (req, res) => { await C.destroy({ where: { id: req.params.id } }); res.redirect('/'); });
app.post('/delete-multiple', async (req, res) => { await C.destroy({ where: { id: { [Op.in]: req.body.ids } } }); res.sendStatus(200); });

app.post('/u/:id', async (req, res) => { 
  const p = req.body.placa ? req.body.placa.trim().toUpperCase() : "";
  await C.update({ placa: p===""?null:p, est_real: p===""?'PENDIENTE':'DESPACHADO', f_act: getNow() }, { where: { id: req.params.id } }); 
  res.redirect('/'); 
});

app.post('/state/:id', async (req, res) => { await C.update({ obs_e: req.body.obs_e, f_act: getNow() }, { where: { id: req.params.id } }); res.sendStatus(200); });

app.get('/finish/:id', async (req, res) => { 
  const serv = await C.findByPk(req.params.id);
  if(!serv.placa || serv.placa.trim().length < 5) return res.send("<script>alert('Error: Falta placa'); window.location='/';</script>");
  const ahora = getNow(); 
  await C.update({ f_fin: ahora, obs_e: 'FINALIZADO SIN NOVEDAD', est_real: 'FINALIZADO', f_act: ahora }, { where: { id: req.params.id } }); 
  res.redirect('/'); 
});

app.get('/reversar/:id', async (req, res) => {
  await C.update({ f_fin: null, est_real: 'DESPACHADO', obs_e: 'DESPACHADO', f_act: getNow() }, { where: { id: req.params.id } });
  res.redirect('/');
});

db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

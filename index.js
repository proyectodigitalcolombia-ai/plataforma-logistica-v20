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
  puertos: ['SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 'PUERTO COMPAS CCTO', 'PUERTO BAHÍA', 'SOCIEDAD PORTUARIA REGIONAL DE CARTAGENA', 'SPIA - AGUADULCE', 'N/A'],
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

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] }), hoy = new Date(); hoy.setHours(0,0,0,0);
    let rows = d.map(c => {
      const isLocked = c.f_fin ? 'disabled' : '';
      let vStyle = '';
      if (c.vence && !c.f_fin) {
        const diff = Math.ceil((new Date(c.vence) - hoy) / 864e5);
        if (diff <= 2) vStyle = 'v-rojo'; else if (diff <= 6) vStyle = 'v-ama';
      }
      return `<tr><td>${c.id}</td><td>${c.oficina||''}</td><td>${c.pto||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.cont||''}</td><td class="${vStyle}" onclick="silenciar(this)">${c.vence||''}</td><td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex"><input name="placa" value="${c.placa||''}" ${isLocked} style="width:65px"><button ${isLocked}>OK</button></form></td><td><select onchange="updState(${c.id},this.value)" ${isLocked}>${opts.estados.map(s=>`<option value="${s}" ${c.obs_e===s?'selected':''}>${s}</option>`).join('')}</select></td><td>${c.est_real}</td><td>${c.f_act||''}</td><td style="white-space:normal">${c.obs||''}</td><td>${c.f_fin?`FIN` : (c.placa?`<a href="/finish/${c.id}">🏁</a>`:'')}</td><td><a href="/d/${c.id}" onclick="return confirm('¿Borrar?')">🗑️</a></td></tr>`;
    }).join('');

    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>LOGISV20</title>
      <style>body{background:#0f172a;color:#fff;font-family:sans-serif;font-size:10px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #334155;padding:5px;text-align:center} th{background:#1e40af} .v-rojo{background:#dc2626;animation:bk 1s infinite;cursor:pointer} .v-ama{background:#fbbf24;color:#000} @keyframes bk{0%{opacity:1}50%{opacity:0.6}100%{opacity:1}} .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;background:#1e293b;padding:15px;margin-bottom:20px} #stat{position:fixed;top:5px;right:5px;background:red;padding:5px;border-radius:5px;display:none}</style>
      </head><body onclick="actAudio()"><div id="stat">⚠️ CLIC AQUÍ PARA SONIDO</div>
      <h2>LOGIS V20 - ALARMA ACTIVA</h2>
      <form action="/add" method="POST" class="form">
        <select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select>
        <select name="pto">${opts.puertos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select>
        <input name="do_bl" placeholder="DO/BL">
        <select name="cli">${opts.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select>
        <input name="cont" placeholder="CONTENEDOR" oninput="this.value=this.value.toUpperCase()">
        <input name="vence" type="date">
        <button type="submit" style="background:#2563eb;color:#fff">REGISTRAR</button>
      </form>
      <table><thead><tr><th>ID</th><th>OFI</th><th>PTO</th><th>DO/BL</th><th>CLI</th><th>CONT</th><th>VENCE</th><th>PLACA</th><th>ESTADO</th><th>REAL</th><th>ACTU</th><th>OBS</th><th>FIN</th><th>DEL</th></tr></thead><tbody>${rows}</tbody></table>
      <script>
        let ctx; 
        function actAudio(){ if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)(); if(ctx.state==='suspended')ctx.resume(); document.getElementById('stat').style.display='none'; play(); }
        function silenciar(e){ e.dataset.s="1"; e.classList.remove('v-rojo'); }
        function updState(id,v){ fetch('/state/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obs_e:v})}).then(()=>location.reload()); }
        function play(){
          let r = Array.from(document.querySelectorAll('.v-rojo')).filter(e=>!e.dataset.s);
          if(r.length>0){
            if(!ctx||ctx.state==='suspended'){document.getElementById('stat').style.display='block';return;}
            let o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.setValueAtTime(600,ctx.currentTime);
            g.gain.setValueAtTime(0.1,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.5);
            o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+0.5);
            setTimeout(play,2000);
          } else { setTimeout(play,5000); }
        }
        window.onload=()=>setTimeout(play,1000);
      </script></body></html>`);
  } catch (e) { res.send(e.message); }
});

app.post('/add', async(req,res)=>{ req.body.f_act=getNow(); await C.create(req.body); res.redirect('/'); });
app.get('/d/:id', async(req,res)=>{ await C.destroy({where:{id:req.params.id}}); res.redirect('/'); });
app.post('/u/:id', async(req,res)=>{ await C.update({placa:req.body.placa.toUpperCase(),est_real:'DESPACHADO',f_act:getNow()},{where:{id:req.params.id}}); res.redirect('/'); });
app.post('/state/:id', async(req,res)=>{ await C.update({obs_e:req.body.obs_e,f_act:getNow()},{where:{id:req.params.id}}); res.sendStatus(200); });
app.get('/finish/:id', async(req,res)=>{ const n=getNow(); await C.update({f_fin:n,obs_e:'FINALIZADO',est_real:'FINALIZADO',f_act:n},{where:{id:req.params.id}}); res.redirect('/'); });

db.sync({alter:true}).then(()=>app.listen(process.env.PORT||3000));

const express = require('express'), { Sequelize, DataTypes } = require('sequelize'), app = express();
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

const css = `<style>body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}.sc-container{max-height:70vh;overflow:auto;background:#1e293b;border:1px solid #334155;border-radius:8px;position:relative}table{border-collapse:separate;border-spacing:0;min-width:8500px;font-size:10px}th{background:#1e40af;padding:15px;text-align:center;position:sticky;top:0;z-index:10;white-space:nowrap;border-bottom:2px solid #3b82f6;border-right:1px solid #3b82f6;color:#fff}td{padding:10px;border-bottom:1px solid #334155;border-right:1px solid #334155;white-space:nowrap;text-align:center;background:#1e293b}.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:20px;background:#1e293b;padding:15px;border-radius:8px;border:1px solid #2563eb}.fg{display:flex;flex-direction:column;gap:4px}label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}input,select{padding:6px;border-radius:4px;border:none;font-size:11px;color:#000}.btn{grid-column:1/-1;background:#2563eb;color:#fff;padding:12px;cursor:pointer;border:none;font-weight:700;border-radius:6px}.btn-fin{background:#10b981;color:white;padding:6px 10px;border-radius:4px;text-decoration:none;font-size:10px;font-weight:bold}.sel-est{background:#334155;color:#fff;padding:5px;border-radius:4px;font-size:10px;width:100%}.sel-est:disabled{opacity:0.6;cursor:not-allowed}.st-real{padding:4px 8px;border-radius:12px;font-weight:bold;font-size:9px}.st-desp{background:#065f46;color:#34d399}.st-fin{background:#1e40af;color:#93c5fd}.st-pend{background:#475569;color:#cbd5e1}.warn{color:#f87171;font-size:9px;font-weight:bold}</style>`;

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    const rows = d.map(c => {
      const isLocked = c.f_fin ? 'disabled' : '';
      const stClass = c.est_real==='DESPACHADO'?'st-desp':(c.est_real==='FINALIZADO'?'st-fin':'st-pend');
      const action = c.f_fin ? `<b style="color:#10b981">✓ FINALIZADO</b>` : (c.placa ? `<a href="/finish/${c.id}" class="btn-fin" onclick="return confirm('¿Finalizar?')">🏁 FINALIZAR</a>` : `<span class="warn">⚠️ REQUIERE PLACA</span>`);
      return `<tr><td><b>${c.id}</b></td><td>${new Date(c.createdAt).toLocaleString()}</td><td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.h_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td>${c.lcl||''}</td><td>${c.cont||''}</td><td>${c.peso||''}</td><td>${c.unid||''}</td><td>${c.prod||''}</td><td>${c.esq||''}</td><td>${c.vence||''}</td><td>${c.orig||''}</td><td>${c.dest||''}</td><td>${c.t_v||''}</td><td>${c.ped||''}</td><td>${c.f_c||''}</td><td>${c.h_c||''}</td><td>${c.f_d||''}</td><td>${c.h_d||''}</td><td><form action="/u/${c.id}" method="POST" style="margin:0;display:flex;gap:2px"><input name="placa" value="${c.placa||''}" ${isLocked} style="width:65px" oninput="this.value=this.value.toUpperCase()"><button ${isLocked} style="background:#10b981;color:#fff;border:none;padding:4px;border-radius:3px">OK</button></form></td><td>${c.f_p||''}</td><td>${c.f_f||''}</td><td><select class="sel-est" ${isLocked} onchange="updState(${c.id},this.value)">${opts.estados.map(s=>`<option value="${s}" ${c.obs_e===s?'selected':''}>${s}</option>`).join('')}</select></td><td>${c.f_act||''}</td><td><span class="st-real ${stClass}">${c.est_real}</span></td><td>${c.obs||''}</td><td>${c.cond||''}</td><td>${c.h_t||''}</td><td>${c.muc||''}</td><td>${c.desp||''}</td><td>${action}</td><td><b style="color:#3b82f6">${c.f_fin||'--'}</b></td><td><a href="/d/${c.id}" style="color:#f87171" onclick="return confirm('¿Borrar?')">X</a></td></tr>`;
    }).join('');
    res.send(`<html><head><meta charset="UTF-8">${css}</head><body><h2 style="color:#3b82f6">SISTEMA LOGÍSTICO V20</h2><form action="/add" method="POST" class="form"><datalist id="list_ciud">${opts.ciudades.map(c=>`<option value="${c}">`).join('')}</datalist><div class="fg"><label>Oficina</label><select name="oficina">${opts.oficina.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div><div class="fg"><label>EMPRESA</label>

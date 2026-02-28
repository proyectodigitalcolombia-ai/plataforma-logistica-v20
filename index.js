const express=require('express'),{Sequelize,DataTypes}=require('sequelize'),app=express();
app.use(express.urlencoded({extended:true}));app.use(express.json());
const db=new Sequelize(process.env.DATABASE_URL,{dialect:'postgres',logging:false,dialectOptions:{ssl:{require:true,rejectUnauthorized:false}}});

const C=db.define('Carga',{oficina:DataTypes.STRING,emp_gen:DataTypes.STRING,comercial:DataTypes.STRING,pto:DataTypes.STRING,refleja:DataTypes.STRING,f_doc:DataTypes.STRING,h_doc:DataTypes.STRING,do_bl:DataTypes.STRING,cli:DataTypes.STRING,subc:DataTypes.STRING,mod:DataTypes.STRING,lcl:DataTypes.STRING,cont:DataTypes.STRING,peso:DataTypes.STRING,unid:DataTypes.STRING,prod:DataTypes.STRING,esq:DataTypes.STRING,vence:DataTypes.STRING,orig:DataTypes.STRING,dest:DataTypes.STRING,t_v:DataTypes.STRING,ped:DataTypes.STRING,f_c:DataTypes.STRING,h_c:DataTypes.STRING,f_d:DataTypes.STRING,h_d:DataTypes.STRING,placa:DataTypes.STRING,f_p:DataTypes.STRING,f_f:DataTypes.STRING,obs_e:{type:DataTypes.STRING,defaultValue:'PENDIENTE'},f_act:DataTypes.STRING,obs:DataTypes.TEXT,cond:DataTypes.TEXT,h_t:DataTypes.STRING,muc:DataTypes.STRING,desp:DataTypes.STRING,f_fin:DataTypes.STRING},{timestamps:true});

const opts={
  ofi:['CARTAGENA','BOGOTÁ','BUENAVENTURA','MEDELLÍN'],
  com:['RAÚL LÓPEZ'],
  ref:['SI','NO'],
  ptos:['SPIA','SPRB','TCBUEN','CONTECAR','SPRC','PUERTO COMPAS CCTO','PUERTO BAHÍA','SEGÚN REMISIÓN','S.P.R.C','SPIA-AGUADULCE','ESENTTIA KM8','YARA MAMONAL','TENERIS TUBOCARIBE','N/A','BRINSA CAJICA'],
  clis:['GEODIS','MAERSK','SAMSUNG SDS','ENVAECOL','SEA CARGO','YARA','ESENTTIA','BRINSA','PAZ DEL RIO','TERNIUM','PLASTICOS ESP','MAYAGUEZ','TENARIS','CASA LUKER','CORONA','NOMOS','POLAR','PLEXA','FAJOBE'],
  subs:['HIKVISION','PAYLESS','PVC COMPUESTOS','DONSSON','RAIRAN','MC TUBOS','ASFALTEL','AISLAPOR','WEBER STEPHEN','INTALPEL','CRESTLINE','AGLOMERADOS MT','BEST CHOICE','IMPROPLAST','TEXTILES 1x1','ROJAS & ASOC','INTERPHARMA','INDECOR','DISPROMED','ARKADIA','BRENNTAG','DIPEC','INGREDION','SAMSUNG','EXITO','ALKOSTO','FALABELLA','SODIMAC','MANSION','OLIMPICA','ENVAECOL','INNOVAR','VOLCARGA','ACME LEON','ALPLA','AMCOR','ARPACK','CARPAK','COINTEC','COLPLAS','COMTUCAR','CONSTRUTUBOS','COROPLAST','DARPLAS','DTO CORDOBA','ENVASES SABANA','EUROPLASTICOS','FAMILIA','FLEXO SPRING','GROUPE SEB','EFEXPORT','PV CENTRO','GUTVAN','HIDALPLAST','IDEPLAS','I.C.T','GOYAINCOL','HERBEPLAS','VANIPLAS','INTECPLAST','MEXICHEM','MULTIDIMENSIONALES','PELICULAS EXTRUIDAS','PELPAK','PLASMOTEC','MAFRA','MQ SAS','TRUHER','PLASTITEC','POLYAGRO','PROENFAR','QUALYPLASTICOS','RECIPLAST','SOLUTIONS GROUP','TECNOPLAST','TRACTOCAR','TROFORMAS','UNION PLASTICA','OPL BETANIA','D1','JERONIMO MARTINS','TERNIUM','LADECA','SIDOC','AGOFER','RIDUCO','GYJ','STECKERL','MULTIALAMBRES','SURECA','FERROSVEL','DISTRIACERO','FIGUHIERROS','SURTIFERRETERIAS','HOMECENTER','TENARIS BARRANCA','ANDAMIOS','SOFTYS','ARQUITECTO','PROCOLDEXT','ABB','FACOPACK','ORINOCO','PLEXA','ALONDRA','MAXFLEX','POLIPAK','ELECTROJAPONESA'],
  ests:['ASIGNADO','CANCELADO','CONTENEDOR','DESPACHADO','EN CONSECUTIVO','EN PROGRAMACIÓN','EN SITIO','FINALIZADO','HOJA DE VIDA','MERCANCÍA','NOVEDAD','PENDIENTE','PRE ASIGNADO','RETIRADO','VEHÍCULO EN PLANTA'],
  desps:['ZULEIMA RIASCOS','ABNNER MARTINEZ','OSCAR CHACON','CAMILO TRIANA','FREDY CARRILLO','RAUL LOPEZ']
};

app.get('/',async(req,res)=>{
  const d=await C.findAll({order:[['id','DESC']]});
  const rows=d.map(c=>`<tr><td>${c.id}</td><td>${new Date(c.createdAt).toLocaleString()}</td><td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td><form action="/u/${c.id}" method="POST" style="display:flex;gap:2px"><input name="placa" value="${c.placa||''}" style="width:60px"><button>OK</button></form></td><td>${c.obs_e||''}</td><td><a href="/d/${c.id}" onclick="return confirm('¿Borrar?')">X</a></td></tr>`).join('');
  res.send(`<html><head><meta charset="UTF-8"><style>body{background:#0f172a;color:#fff;font-family:sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #334155;padding:8px}th{background:#1e40af}.form{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:#1e293b;padding:15px;border-radius:8px}input,select{padding:5px;border-radius:4px;width:100%}.btn{grid-column:span 4;background:#2563eb;color:#fff;padding:10px;border:none;cursor:pointer}</style></head><body>
    <h2>LOGÍSTICA V20</h2>
    <form action="/add" method="POST" class="form">
      <label>Oficina<select name="oficina">${opts.ofi.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Generadora<select name="emp_gen"><option>YEGO ECO-T SAS</option></select></label>
      <label>Comercial<select name="comercial">${

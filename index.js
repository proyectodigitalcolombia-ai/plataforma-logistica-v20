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
  subs:['HIKVISION','PAYLESS COLOMBIA','GRUPO PVC COMPUESTOS Y RESINAS','INDUSTRIAS DONSSON','RAIRAN IMPRESORES SAS','MC TUBOS CARTON SAS','ASFALTEL SAS','AISLAPOR SAS','WEBER STEPHEN COLOMBIA SAS','INTALPEL SAS','CRESTLINE GLOBAL VENTURE SAS','DISTRIBUIDORA DE AGLOMERADOS MT SAS','BEST CHOICE SAS','IMPROPLAST RC SAS','TEXTILES 1x1 SAS','GRUPO EMPRESARIAL ROJAS Y ASOCIADOS SAS','INTERPHARMA COLOMBIA SAS','INDECOR SAS','DISPROMED MK SAS','ARKADIA FAMILY CENTER','BRENNTAG COLOMBIA','DIPEC SAS','INGREDION COLOMBIA','SAMSUNG SDS COLOMBIA GLOBAL','ÉXITO','COLOMBIANA DE COMERCIO - ALKOSTO','FALABELLA','SODIMAC COLOMBIA','GRUPO MANSION','OLIMPICA','ENVAECOL','INNOVAR SOLUCIONES','VOLCARGA','ACME LEON PLASTICOS SAS','ALPLA COLOMBIA S A S','AMCOR HOLDINGS AUSTRALIA PTY LTD','ARPACK S A S','CARPAK','COINTEC S.A.S.','COLPLAS S.A.S COLOMBIANA DE PLASTICO','COMTUCAR S.A.S','CONSTRUTUBOS','COROPLAST LIMITADA','DARPLAS S.A.S','DISTRIBUIDORA CORDOBA S.A.S','ENVASES PLASTICOS DE LA SABANA S A S','EUROPLASTICOS LTDA','FAMILIA DEL PACIFICO SAS','FLEXO SPRING SAS','GROUPE SEB COLOMBIA S.A.','GRUPO EFEXPORT ZF S.A.S.','GRUPO PV CENTRO S.A.S.','GUTVAN S.A.S','HIDALPLAST SAS','IDEPLAS SAS','INDUSTRIA COLOMBIANA DE TAPAS','INDUSTRIAS GOYAINCOL S A S','INDUSTRIAS PLASTICAS HERBEPLAS','INDUSTRIAS VANIPLAS LTDA','INTECPLAST','MEXICHEM','MULTIDIMENSIONALES S A S','NTECPLAST INYECCION TECNICA DE PLASTICOS S.A.S.','PELICULAS EXTRUIDAS S.A.S.','PELPAK ZF SAS','PLASMOTEC SAS','PLASTICOS MAFRA COLEY Y COMPANIA S EN C','PLASTICOS MQ SAS','PLASTICOS TRUHER S.A.','PLASTITEC S.A.S.','POLYAGRO S.A.S','PROENFAR','QUALYPLASTICOS S.A.S','RECIPLAST SAS','SOLUTIONS GROUP S A S','TECNOPLAST S A S','TRACTOCAR','TROFORMAS SAS','UNION PLASTICA SAS','OPL BETANIA','KOBA D1','JERONIMO MARTINS','TERNIUM DEL ATLANTICO','LADECA','SIDOC','AGOFER','RIDUCO','GYJ FERRETERIAS SA','STECKERL ACEROS','FERRETERIA MULTIALAMBRES','SURECA SAS','FERROSVEL','DISTRIACERO SAS','FIGUHIERROS','SURTIFERRETERIAS SAS','HOMECENTER SAS','TERNIUM COLOMBIA','PLASTICOS ESPECIALES SAS','INGENIO MAYAGUEZ','ACERIAS PAZ DEL RIO','TAURUS LOGISTICS COLOMBIA','CI SOEXCOL','BRINSA SA','TENARIS','CORONA','TENARIS TUBOCARIBE YARD BARRANCA','TENARIS TUBOCARIBE YARD VVO','CASA LUKER BOGOTA','SUPPLIES 4 PETS S.A.S','EQUIPOS Y ANDAMIOS SAS','SOFTYS','MANUFACTURAS EL ARQUITECTO','EDITORIAL NOMOS','DISEÑO Y CONSTRUCCION DE OBRAS ELECTRICAS','PROCOLDEXT','ABB','FACOPACK','ALIMENTOS POLAR URBANO','ORINOCO E-SCRAP','AUTO GAS SOLEDAD PLEXA','ALONDRA MUEBLES','MAXFLEX','FAJOBE CEDI SIBERIA','POLIPAK','FILTROS Y SOLUCIONES SAS','PROVELECTRICOS','ELECTROJAPONESA'],
  ests:['ASIGNADO','CANCELADO','CONTENEDOR','DESPACHADO','EN CONSECUTIVO','EN PROGRAMACIÓN','EN SITIO','FINALIZADO','HOJA DE VIDA','MERCANCÍA','NOVEDAD','PENDIENTE','PRE ASIGNADO','RETIRADO','VEHÍCULO EN PLANTA'],
  desps:['ZULEIMA RIASCOS','ABNNER MARTINEZ','OSCAR CHACON','CAMILO TRIANA','FREDY CARRILLO','RAUL LOPEZ']
};

app.get('/',async(req,res)=>{
  const d=await C.findAll({order:[['id','DESC']]});
  const rows=d.map(c=>`<tr><td><b>${c.id}</b></td><td>${new Date(c.createdAt).toLocaleString()}</td><td>${c.oficina||''}</td><td>${c.emp_gen||''}</td><td>${c.comercial||''}</td><td>${c.pto||''}</td><td>${c.refleja||''}</td><td>${c.f_doc||''}</td><td>${c.do_bl||''}</td><td>${c.cli||''}</td><td>${c.subc||''}</td><td>${c.mod||''}</td><td><form action="/u/${c.id}" method="POST" style="display:flex;gap:2px"><input name="placa" value="${c.placa||''}" style="width:60px" oninput="this.value=this.value.toUpperCase()"><button>OK</button></form></td><td>${c.obs_e||''}</td><td><a href="/d/${c.id}" style="color:red" onclick="return confirm('¿Borrar?')">X</a></td></tr>`).join('');
  res.send(`<html><head><meta charset="UTF-8"><style>body{background:#0f172a;color:#fff;font-family:sans-serif;font-size:11px}table{border-collapse:collapse;width:100%;margin-top:20px}th,td{border:1px solid #334155;padding:6px;text-align:left}th{background:#1e40af}.form{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#1e293b;padding:15px;border-radius:8px}input,select{padding:4px;border-radius:3px;width:100%}.btn{grid-column:span 4;background:#2563eb;color:#fff;padding:10px;border:none;cursor:pointer;font-weight:bold}</style></head><body>
    <h2>LOGÍSTICA V20</h2>
    <form action="/add" method="POST" class="form">
      <label>Oficina<select name="oficina">${opts.ofi.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>EMPRESA GENERADORA DE CARGA<select name="emp_gen"><option>YEGO ECO-T SAS</option></select></label>
      <label>Comercial<select name="comercial">${opts.com.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Pto Cargue<select name="pto">${opts.ptos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>REFLEJA EN PUERTO Y / O PATIO DE RETIRO<select name="refleja">${opts.ref.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Cliente<select name="cli">${opts.clis.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Subcliente<select name="subc">${opts.subs.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Estado<select name="obs_e">${opts.ests.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>DO/BL<input name="do_bl"></label><label>Peso Kg<input name="peso"></label><label>Placa<input name="placa" oninput="this.value=this.value.toUpperCase()"></label><label>MUC<input name="muc"></label>
      <button class="btn">💾 REGISTRAR NUEVA CARGA</button>
    </form>
    <table><thead><tr><th>ITEM</th><th>FECHA Y HORA DE REGISTRO</th><th>OFICINA</th><th>GENERADORA</th><th>COMERCIAL</th><th>PUERTO</th><th>REFLEJA</th><th>F.DOC</th><th>DO/BL</th><th>CLI</th><th>SUBC</th><th>MOD</th><th>PLACA</th><th>ESTADO</th><th>DEL</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`);
});

app.post('/add',async(req,res)=>{await C.create(req.body);res.redirect('/');});
app.get('/d/:id',async(req,res)=>{await C.destroy({where:{id:req.params.id}});res.redirect('/');});
app.post('/u/:id',async(req,res)=>{await C.update({placa:req.body.placa.toUpperCase()},{where:{id:req.params.id}});res.redirect('/');});
db.sync({alter:true}).then(()=>app.listen(process.env.PORT||3000));

const express=require('express'),{Sequelize,DataTypes}=require('sequelize'),app=express();
app.use(express.urlencoded({extended:true}));app.use(express.json());
const db=new Sequelize(process.env.DATABASE_URL,{dialect:'postgres',logging:false,dialectOptions:{ssl:{require:true,rejectUnauthorized:false}}});

const C=db.define('Carga',{oficina:DataTypes.STRING,emp_gen:DataTypes.STRING,comercial:DataTypes.STRING,pto:DataTypes.STRING,refleja:DataTypes.STRING,f_doc:DataTypes.STRING,h_doc:DataTypes.STRING,do_bl:DataTypes.STRING,cli:DataTypes.STRING,subc:DataTypes.STRING,mod:DataTypes.STRING,lcl:DataTypes.STRING,cont:DataTypes.STRING,peso:DataTypes.STRING,unid:DataTypes.STRING,prod:DataTypes.STRING,esq:DataTypes.STRING,vence:DataTypes.STRING,orig:DataTypes.STRING,dest:DataTypes.STRING,t_v:DataTypes.STRING,ped:DataTypes.STRING,f_c:DataTypes.STRING,h_c:DataTypes.STRING,f_d:DataTypes.STRING,h_d:DataTypes.STRING,placa:DataTypes.STRING,f_p:DataTypes.STRING,f_f:DataTypes.STRING,obs_e:{type:DataTypes.STRING,defaultValue:'PENDIENTE'},f_act:DataTypes.STRING,obs:DataTypes.TEXT,cond:DataTypes.TEXT,h_t:DataTypes.STRING,muc:DataTypes.STRING,desp:DataTypes.STRING,f_fin:DataTypes.STRING},{timestamps:true});

const opts={
  subs:['HIKVISION','PAYLESS COLOMBIA','GRUPO PVC COMPUESTOS','INDUSTRIAS DONSSON','RAIRAN IMPRESORES','MC TUBOS CARTON','ASFALTEL','AISLAPOR','WEBER STEPHEN','INTALPEL','CRESTLINE','AGLOMERADOS MT','BEST CHOICE','IMPROPLAST RC','TEXTILES 1x1','INTERPHARMA','INDECOR','DISPROMED','ARKADIA','BRENNTAG','DIPEC','INGREDION','SAMSUNG SDS','EXITO','ALKOSTO','FALABELLA','SODIMAC','OLIMPICA','ENVAECOL','INNOVAR','VOLCARGA','ACME LEON','ALPLA','AMCOR','ARPACK','CARPAK','COINTEC','COLPLAS','COMTUCAR','CONSTRUTUBOS','COROPLAST','DARPLAS','ENVASES SABANA','EUROPLASTICOS','FAMILIA','FLEXO SPRING','GROUPE SEB','EFEXPORT','PV CENTRO','GUTVAN','HIDALPLAST','IDEPLAS','ICT','GOYAINCOL','HERBEPLAS','VANIPLAS','INTECPLAST','MEXICHEM','MULTIDIMENSIONALES','PELICULAS EXTRUIDAS','PELPAK','PLASMOTEC','MAFRA','MQ SAS','TRUHER','PLASTITEC','POLYAGRO','PROENFAR','QUALYPLASTICOS','RECIPLAST','SOLUTIONS','TECNOPLAST','TRACTOCAR','TROFORMAS','UNION PLASTICA','D1','JERONIMO MARTINS','TERNIUM','LADECA','SIDOC','AGOFER','RIDUCO','GYJ','STECKERL','MULTIALAMBRES','SURECA','FERROSVEL','DISTRIACERO','FIGUHIERROS','SURTIFERRETERIAS','HOMECENTER','TENARIS','BRINSA','CASA LUKER','CORONA','NOMOS','POLAR','ABB','FACOPACK','ELECTROJAPONESA'],
  clis:['GEODIS','MAERSK','SAMSUNG SDS','ENVAECOL','SEA CARGO','YARA','ESENTTIA','BRINSA','PAZ DEL RIO','TERNIUM','PLASTICOS ESP','MAYAGUEZ','TENARIS','CASA LUKER','CORONA','NOMOS','POLAR','PLEXA','FAJOBE'],
  ptos:['SPIA','SPRB','TCBUEN','CONTECAR','SPRC','PUERTO COMPAS','PUERTO BAHIA','AGUADULCE','ESENTTIA','YARA','TENERIS','BRINSA'],
  ests:['ASIGNADO','CANCELADO','CONTENEDOR','DESPACHADO','EN PROGRAMACIÓN','EN SITIO','FINALIZADO','NOVEDAD','PENDIENTE','RETIRADO']
};

app.get('/',async(req,res)=>{
  const d=await C.findAll({order:[['id','DESC']]});
  const rows=d.map(c=>`<tr><td>${c.id}</td><td>${new Date(c.createdAt).toLocaleString()}</td><td>${c.oficina||''}</td><td>${c.comercial||''}</td><td>${c.subc||''}</td><td><form action="/u/${c.id}" method="POST" style="display:flex;gap:2px"><input name="placa" value="${c.placa||''}" style="width:60px" oninput="this.value=this.value.toUpperCase()"><button>OK</button></form></td><td>${c.obs_e||''}</td><td><a href="/d/${c.id}" style="color:red" onclick="return confirm('¿Borrar?')">X</a></td></tr>`).join('');
  res.send(`<html><head><meta charset="UTF-8"><style>body{background:#0f172a;color:#fff;font-family:sans-serif;font-size:11px}table{border-collapse:collapse;width:100%;margin-top:20px}th,td{border:1px solid #334155;padding:6px}th{background:#1e40af}.form{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#1e293b;padding:15px;border-radius:8px}input,select{padding:5px;border-radius:3px;width:100%}.btn{grid-column:span 4;background:#2563eb;color:#fff;padding:10px;border:none;cursor:pointer;font-weight:bold}</style></head><body>
    <h2>LOGÍSTICA V20 - AUTOCUMPLE</h2>
    <form action="/add" method="POST" class="form">
      <datalist id="l_sub">${opts.subs.map(s=>`<option value="${s}">`).join('')}</datalist>
      <datalist id="l_cli">${opts.clis.map(s=>`<option value="${s}">`).join('')}</datalist>
      <datalist id="l_pto">${opts.ptos.map(s=>`<option value="${s}">`).join('')}</datalist>
      
      <label>Oficina<select name="oficina"><option>CARTAGENA</option><option>BOGOTÁ</option><option>MEDELLÍN</option><option>BUENAVENTURA</option></select></label>
      <label>Comercial<select name="comercial"><option>RAÚL LÓPEZ</option></select></label>
      <label>Refleja en Puerto<select name="refleja"><option>SI</option><option>NO</option></select></label>
      <label>Puerto Cargue<input name="pto" list="l_pto" placeholder="Escribe puerto..."></label>
      <label>Cliente<input name="cli" list="l_cli" placeholder="Escribe cliente..."></label>
      <label>Subcliente<input name="subc" list="l_sub" placeholder="Escribe subcliente..."></label>
      <label>Estado<select name="obs_e">${opts.ests.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>
      <label>Placa<input name="placa" oninput="this.value=this.value.toUpperCase()"></label>
      <label>DO/BL<input name="do_bl"></label><label>Peso Kg<input name="peso"></label><label>MUC<input name="muc"></label>
      <button class="btn">💾 REGISTRAR NUEVA CARGA</button>
    </form>
    <table><thead><tr><th>ID</th><th>REGISTRO</th><th>OFICINA</th><th>COMERCIAL</th><th>SUBCLIENTE</th><th>PLACA</th><th>ESTADO</th><th>DEL</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`);
});

app.post('/add',async(req,res)=>{await C.create(req.body);res.redirect('/');});
app.get('/d/:id',async(req,res)=>{await C.destroy({where:{id:req.params.id}});res.redirect('/');});
app.post('/u/:id',async(req,res)=>{await C.update({placa:req.body.placa.toUpperCase()},{where:{id:req.params.id}});res.redirect('/');});
db.sync({alter:true}).then(()=>app.listen(process.env.PORT||3000));

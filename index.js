const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const app = express();

// --- INSERCIÓN A: LLAMADO ASISTENTE GPS ---
const { enviarAMonitor } = require('./gpsService'); 

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

const db = new Sequelize(process.env.DATABASE_URL, { 
 dialect: 'postgres', 
 logging: false, 
 dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
});

// MODELO DE DATOS
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
 est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
 url_plataforma: DataTypes.STRING,
 usuario_gps: DataTypes.STRING,
 clave_gps: DataTypes.STRING
}, { timestamps: true });

const opts = {
 oficina: [
  'CARTAGENA', 
  'BOGOTÁ', 
  'BUENAVENTURA', 
  'MEDELLÍN'
 ],
 puertos: [
  'SPIA', 
  'SPRB', 
  'TCBUEN', 
  'CONTECAR', 
  'SPRC', 
  'PUERTO COMPAS CCTO', 
  'PUERTO BAHÍA', 
  'SOCIEDAD PORTUARIA REGIONAL DE CARTAGENA', 
  'SPIA - AGUADULCE', 
  'PLANTA ESENTTIA KM 8 VIA MAMONAL', 
  'PLANTA YARA CARTAGENA MAMONAL', 
  'N/A'
 ],
 clientes: [
  'GEODIS COLOMBIA LTDA', 
  'MAERSK LOGISTICS SERVICES LTDA', 
  'SAMSUNG SDS COLOMBIA GLOBAL', 
  'ENVAECOL', 
  'SEA CARGO COLOMBIA LTDA', 
  'YARA COLOMBIA', 
  'ESENTTIA SA', 
  'BRINSA SA', 
  'ACERIAS PAZ DEL RIO', 
  'TERNIUM DEL ATLANTICO', 
  'PLASTICOS ESPECIALES SAS', 
  'INGENIO MAYAGUEZ', 
  'TENARIS', 
  'CASA LUKER', 
  'CORONA', 
  'EDITORIAL NOMOS', 
  'ALIMENTOS POLAR', 
  'PLEXA SAS ESP', 
  'FAJOBE'
 ],
 modalidades: [
  'NACIONALIZADO', 
  'OTM', 
  'DTA', 
  'TRASLADO', 
  'NACIONALIZADO EXP', 
  'ITR', 
  'VACÍO EN EXPRESO', 
  'VACÍO CONSOLIDADO', 
  'NACIONALIZADO IMP'
 ],
 lcl_fcl: [
  'CARGA SUELTA', 
  'CONTENEDOR 40', 
  'CONTENEDOR 20', 
  'REFER 40', 
  'REFER 20', 
  'FLAT RACK 20', 
  'FLAT RACK 40'
 ],
 esquemas: [
  '1 ESCOLTA - SELLO', 
  '2 ESCOLTAS SELLO - SPIA', 
  'SELLO', 
  '1 ESCOLTA', 
  '2 ESCOLTA', 
  'NO REQUIERE', 
  '2 ESCOLTAS SELLO', 
  'INSPECTORES VIALES'
 ],
 vehiculos: [
  'TURBO 2.5 TN', 
  'TURBO 4.5 TN', 
  'TURBO SENCILLO', 
  'SENCILLO 9 TN', 
  'PATINETA 2S3', 
  'TRACTOMULA 3S2', 
  'TRACTOMULA 3S3', 
  'CAMA BAJA', 
  'DOBLE TROQUE'
 ],
 ciudades: [
  'BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUENAVENTURA', 'SANTA MARTA', 
  'CÚCUTA', 'IBAGUÉ', 'PEREIRA', 'MANIZALES', 'NEIVA', 'VILLAVICENCIO', 'YOPAL', 'SIBERIA', 
  'FUNZA', 'MOSQUERA', 'MADRID', 'FACATATIVÁ', 'TOCANCIPÁ', 'CHÍA', 'CAJICÁ'
 ],
 subclientes: [
  'HIKVISION', 'PAYLESS COLOMBIA', 'GRUPO PVC COMPUESTOS Y RESINAS', 'INDUSTRIAS DONSSON', 
  'RAIRAN IMPRESORES SAS', 'MC TUBOS CARTON SAS', 'ASFALTEL SAS', 'AISLAPOR SAS', 
  'WEBER STEPHEN COLOMBIA SAS', 'INTALPEL SAS', 'CRESTLINE GLOBAL VENTURE SAS', 
  'DISTRIBUIDORA DE AGLOMERADOS MT SAS', 'BEST CHOICE SAS', 'IMPROPLAST RC SAS', 
  'TEXTILES 1x1 SAS', 'GRUPO EMPRESARIAL ROJAS Y ASOCIADOS SAS', 'INTERPHARMA COLOMBIA SAS', 
  'INDECOR SAS', 'DISPROMED MK SAS', 'ARKADIA FAMILY CENTER', 'BRENNTAG COLOMBIA', 
  'DIPEC SAS', 'INGREDION COLOMBIA', 'SAMSUNG SDS COLOMBIA GLOBAL', 'ÉXITO', 
  'COLOMBIANA DE COMERCIO - ALKOSTO', 'FALABELLA', 'SODIMAC COLOMBIA', 'GRUPO MANSION', 
  'OLIMPICA', 'ENVAECOL', 'INNOVAR SOLUCIONES', 'VOLCARGA', 'ACME LEON PLASTICOS SAS', 
  'ALPLA COLOMBIA S A S', 'AMCOR HOLDINGS AUSTRALIA PTY LTD', 'ARPACK S A S', 
  'CARPAK', 'COINTEC S.A.S.', 'COLPLAS S.A.S COLOMBIANA DE PLASTICO', 'COMTUCAR S.A.S', 
  'CONSTRUTUBOS', 'COROPLAST LIMITADA', 'DARPLAS S.A.S', 'DISTRIBUIDORA CORDOBA S.A.S', 
  'ENVASES PLASTICOS DE LA SABANA S A S', 'EUROPLASTICOS LTDA', 'FAMILIA DEL PACIFICO SAS', 
  'FLEXO SPRING SAS', 'GROUPE SEB COLOMBIA S.A.', 'GRUPO EFEXPORT ZF S.A.S.', 
  'GRUPO PV CENTRO S.A.S.', 'GUTVAN S.A.S', 'HIDALPLAST SAS', 'IDEPLAS SAS', 
  'INDUSTRIA COLOMBIANA DE TAPAS', 'INDUSTRIAS GOYAINCOL S A S', 'INDUSTRIAS PLASTICAS HERBEPLAS', 
  'INDUSTRIAS VANIPLAS LTDA', 'INTECPLAST', 'MEXICHEM', 'MULTIDIMENSIONALES S A S', 
  'NTECPLAST INYECCION TECNICA DE PLASTICOS S.A.S.', 'PELICULAS EXTRUIDAS S.A.S.', 
  'PELPAK ZF SAS', 'PLASMOTEC SAS', 'PLASTICOS MAFRA COLEY Y COMPANIA S EN C', 
  'PLASTICOS MQ SAS', 'PLASTICOS TRUHER S.A.', 'PLASTITEC S.A.S.', 'POLYAGRO S.A.S', 
  'PROENFAR', 'QUALYPLASTICOS S.A.S', 'RECIPLAST SAS', 'SOLUTIONS GROUP S A S', 
  'TECNOPLAST S A S', 'TRACTOCAR', 'TROFORMAS SAS', 'UNION PLASTICA SAS', 'OPL BETANIA', 
  'KOBA D1', 'JERONIMO MARTINS', 'TERNIUM DEL ATLANTICO', 'LADECA', 'SIDOC', 'AGOFER', 
  'RIDUCO', 'GYJ FERRETERIAS SA', 'STECKERL ACEROS', 'FERRETERIA MULTIALAMBRES', 
  'SURECA SAS', 'FERROSVEL', 'DISTRIACERO SAS', 'FIGUHIERROS', 'SURTIFERRETERIAS SAS', 
  'HOMCECENTER SAS', 'TERNIUM COLOMBIA', 'PLASTICOS ESPECIALES SAS', 'INGENIO MAYAGUEZ',
  'ACERIAS PAZ DEL RIO', 'TAURUS LOGISTICS COLOMBIA', 'CI SOEXCOL', 'BRINSA SA',
  'TENARIS', 'CORONA', 'TENARIS TUBOCARIBE YARD BARRANCA', 'TENARIS TUBOCARIBE YARD VVO', 
  'CASA LUKER BOGOTA', 'SUPPLIES 4 PETS S.A.S', 'EQUIPOS Y ANDAMIOS SAS', 'SOFTYS', 
  'MANUFACTURAS EL ARQUITECTO', 'EDITORIAL NOMOS', 'DISEÑO Y CONSTRUCCUION DE OBRAS ELECTRICAS', 
  'PROCOLDEXT', 'ABB', 'FACOPACK', 'ALIMENTOS POLAR URBANO', 'ORINOCO E-SCRAP', 
  'AUTO GAS SOLEDAD PLEXA', 'ALONDRA MUEBLES', 'MAXFLEX', 'FAJOBE CEDI SIBERIA', 
  'POLIPAK', 'FILTROS Y SOLUCIONES SAS', 'PROVELECTRICOS', 'ELECTROJAPONESA', 
  'GEOSQUIMICAS', 'RIN TRUCK'
 ],
 estados: [
  'ASIGNADO VEHÍCULO', 'PENDIENTE CITA ASIGNADO', 'VEHÍCULO CON CITA', 
  'CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 
  'CONTENEDOR EN INSPECCIÓN', 'CONTENEDOR RETIRADO PARA ITR', 'DESPACHADO', 
  'DESPACHADO CON NOVEDAD', 'EN CONSECUCIÓN', 'EN PROGRAMACIÓN', 
  'EN SITIO DE CARGUE', 'FINALIZADO CON NOVEDAD', 'FINALIZADO SIN NOVEDAD', 
  'HOJA DE VIDA EN ESTUDIO', 'MERCANCÍA EN INSPECCIÓN', 'NOVEDAD', 
  'PENDIENTE BAJAR A PATIO', 'PENDIENTE INSTRUCCIONES', 'PRE ASIGNADO', 
  'RETIRADO DE PUERTO PENDIENTE CONSOLIDADO', 'CANCELADO POR GERENCIA', 
  'VEHICULO EN RUTA'
 ],
 despachadores: [
  'ABNNER MARTINEZ', 'CAMILO TRIANA', 'FREDY CARRILLO', 'RAUL LOPEZ', 'EDDIER RIVAS'
 ]
};

const getNow = () => {
 return new Date().toLocaleString('es-CO', { 
  timeZone: 'America/Bogota', 
  year: 'numeric', month: '2-digit', day: '2-digit', 
  hour: '2-digit', minute: '2-digit', second: '2-digit', 
  hour12: false 
 }).replace(/\//g, '-');
};

// --- LOGICA AUTOMATICA: CAMBIO A RUTA AL SIGUIENTE DIA ---
async function autoTransitoRuta() {
  const hoyStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const pendientes = await C.findAll({
    where: {
      placa: { [Op.ne]: null, [Op.not]: "" },
      f_fin: null,
      obs_e: { [Op.notIn]: ['VEHICULO EN RUTA', 'FINALIZADO SIN NOVEDAD', 'FINALIZADO CON NOVEDAD'] }
    }
  });

  for (let s of pendientes) {
    const fRegistro = new Date(s.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    if (fRegistro < hoyStr) {
      await C.update({ 
        obs_e: 'VEHICULO EN RUTA', 
        f_act: getNow() 
      }, { where: { id: s.id } });
    }
  }
}

const css = `<style>
 body{background:#0f172a;color:#fff;font-family:sans-serif;margin:0;padding:20px}
 .sc{width:100%;overflow-x:auto;background:#1e293b;border:1px solid #334155;border-radius:8px}
 .fs{height:12px;margin-bottom:5px}
 .fc{width:8600px;height:1px}
 table{border-collapse:collapse;min-width:8600px;font-size:10px;table-layout: fixed;}
 th{background:#1e40af;padding:10px 5px;text-align:center;position:sticky;top:0;border-right:1px solid #3b82f6; word-wrap: break-word; white-space: normal; vertical-align: middle;}
 td{padding:0px;border:1px solid #334155;white-space:nowrap;text-align:center; overflow: hidden; text-overflow: ellipsis;}
 .col-num { width: 30px; padding:6px; }
 .col-id { width: 40px; font-weight: bold; padding:6px; }
 .col-reg { width: 110px; font-size: 9px; padding:6px; }
 .col-emp { width: 150px; text-align: center !important; }
 .col-placa { width: 120px; }
 .in-placa { width: 75px !important; font-size: 11px !important; font-weight: bold; height: 25px; }
 .col-est { width: 210px; padding: 0 !important; }
 .sel-est { background:#334155; color:#fff; border:none; padding:4px; font-size:9px; width:100%; height: 100%; cursor:pointer; text-align: center; }
 .col-desp { width: 130px; padding:6px; }
 .col-hfin { width: 115px; font-size: 9px; padding:6px; }
 .col-acc { width: 70px; }
 .acc-cell { display: flex; align-items: center; justify-content: center; gap: 8px; height: 35px; }
 .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:25px;background:#1e293b;padding:20px;border-radius:8px;border:1px solid #2563eb}
 .fg{display:flex;flex-direction:column;gap:4px}
 label{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700}
 input,select,textarea{padding:8px;border-radius:4px;border:none;font-size:11px;color:#000;text-align:center}
 .btn-submit-serious{ grid-column:1/-1; background:#1e40af; color:#fff; padding:12px; cursor:pointer; border:none; font-weight:700; border-radius:6px; display:flex; align-items:center; justify-content:center; gap:10px; transition: background 0.2s; }
 .btn-submit-serious:hover{ background:#1d4ed8; }
 .icon-serious{ width:20px; height:20px; fill:#fff; }
 .btn-xls{background:#556b2f;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer;height:38px;box-sizing:border-box;}
 .btn-stats{background:#4c1d95;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer;text-decoration:none;font-size:13px;height:38px;box-sizing:border-box;display:flex;align-items:center;}
 .container-check-all{background:#2563eb;padding:5px 10px;border-radius:6px;display:flex;align-items:center;gap:5px;height:38px;box-sizing:border-box;}
 .btn-del-mult{background:#ef4444;color:white;padding:10px 15px;border-radius:6px;font-weight:bold;border:none;cursor:pointer;display:none;height:38px;box-sizing:border-box;}
 #busq{padding:10px;width:250px;border-radius:6px;border:1px solid #3b82f6;background:#1e293b;color:white;font-weight:bold;height:38px;box-sizing:border-box;}
 .vence-rojo{background:#dc2626 !important;color:#fff !important;font-weight:bold;animation: blink 2s infinite;cursor:pointer}
 .vence-amarillo{background:#fbbf24 !important;color:#000 !important;font-weight:bold}
 .editable-cell { background: transparent !important; color: #fff !important; border: none !important; width: 100%; height: 32px; text-align: center; cursor: pointer; padding: 0; font-size: 10px; }
 .editable-cell:focus { background: #334155 !important; outline: 1px solid #3b82f6 !important; color: #fff !important; }
 .editable-cell:disabled { color: #94a3b8 !important; cursor: default; }
 @keyframes blink { 0% {opacity:1} 50% {opacity:0.6} 100% {opacity:1} }
 tr:hover td { background: #334155; }
</style>`;

app.get('/stats', async (req, res) => {
  try {
    // 1. OBTENCIÓN DE DATOS DESDE LA BASE DE DATOS
    const cargas = await C.findAll();
    
    // 2. CONFIGURACIÓN DE TIEMPO (ZONA HORARIA BOGOTÁ)
    const hoyDate = new Date();
    
    const hoyStr = hoyDate.toLocaleDateString('en-CA', { 
      timeZone: 'America/Bogota' 
    });
    
    const mesActualStr = hoyStr.substring(0, 7);

    // 3. FILTRADO DE CARGAS PENDIENTES (SIN PLACA ASIGNADA)
    const sinPlaca = cargas.filter(c => {
      return (!c.placa || c.placa.trim() === '') && !c.f_fin;
    });

    const pendientesPorCliente = {};
    
    sinPlaca.forEach(c => { 
      const cliente = (c.cli || 'SIN CLIENTE').toUpperCase(); 
      pendientesPorCliente[cliente] = (pendientesPorCliente[cliente] || 0) + 1; 
    });

    // 4. REQUERIMIENTOS DE VEHÍCULOS POR CIUDAD DE ORIGEN
    const reqPorCiudad = {};
    
    sinPlaca.forEach(c => { 
      const ciudad = (c.orig || 'SIN ORIGEN').toUpperCase(); 
      const tipo = (c.t_v || 'NO ESPECIFICADO').toUpperCase(); 
      
      if (!reqPorCiudad[ciudad]) {
        reqPorCiudad[ciudad] = {};
      }
      
      reqPorCiudad[ciudad][tipo] = (reqPorCiudad[ciudad][tipo] || 0) + 1; 
    });

    // 5. GESTIÓN DE PÉRDIDAS EMERGENTES (CANCELACIONES)
    const cancelTags = [
      'CANCELADO POR CLIENTE', 
      'CANCELADO POR NEGLIGENCIA OPERATIVA', 
      'CANCELADO POR GERENCIA'
    ];

    const perdidosTotal = cargas.filter(c => {
      return cancelTags.includes(c.obs_e);
    });

    const perdidaDiaria = perdidosTotal.filter(c => {
      const fechaCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { 
        timeZone: 'America/Bogota' 
      });
      return fechaCrea === hoyStr;
    }).length;

    const perdidaMesActual = perdidosTotal.filter(c => {
      const fechaCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { 
        timeZone: 'America/Bogota' 
      });
      return fechaCrea.startsWith(mesActualStr);
    }).length;

    const perdidaConteo = perdidosTotal.length;

    // 6. LOG DE PRODUCTIVIDAD POR DESPACHADOR
    const despLog = {};
    
    cargas.forEach(c => { 
      const d = c.desp || 'SIN ASIGNAR'; 
      const fCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { 
        timeZone: 'America/Bogota' 
      }); 
      const mCrea = fCrea.substring(0, 7); 
      
      if (!despLog[d]) {
        despLog[d] = { hoy: 0, mes: 0 };
      }
      
      if (fCrea === hoyStr) {
        despLog[d].hoy++;
      }
      
      if (mCrea === mesActualStr) {
        despLog[d].mes++;
      }
    });

    // 7. CONTADORES PRINCIPALES - LÓGICA DE MEDIANOCHE (00:00)
    const total = cargas.length;
    const fin = cargas.filter(c => c.f_fin).length;

    // --- REGLA: SI SE CREÓ HOY ES "DESPACHADO" ---
    const despachadosCount = cargas.filter(c => {
      const fechaCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { 
        timeZone: 'America/Bogota' 
      });
      return c.placa && !c.f_fin && fechaCrea === hoyStr;
    }).length;

    // --- REGLA: SI SE CREÓ ANTES DE HOY ES "EN RUTA" ---
    const desp = cargas.filter(c => {
      const fechaCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { 
        timeZone: 'America/Bogota' 
      });
      return c.placa && !c.f_fin && fechaCrea < hoyStr;
    }).length;

    const ofis = {}; 
    cargas.forEach(c => { 
      if (c.oficina) {
        ofis[c.oficina] = (ofis[c.oficina] || 0) + 1; 
      }
    });

    // 8. CONSTRUCCIÓN DE LA INTERFAZ (HTML/CSS)
    res.send(`
      <html>
      <head>
        <meta charset="UTF-8">
        <title>KPI - LOGISV20 - SISTEMA CENTRAL</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { 
            background: #0f172a; 
            color: #fff; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 25px; 
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 20px; 
            border-bottom: 1px solid #1e40af; 
            padding-bottom: 15px; 
          }
          .btn-back { 
            background: #2563eb; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
          }
          .kpi-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
            gap: 15px; 
            margin-bottom: 25px; 
          }
          .card { 
            background: #1e293b; 
            padding: 20px; 
            border-radius: 10px; 
            border: 1px solid #334155; 
            text-align: center; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
          }
          .card h3 { 
            margin: 0; 
            font-size: 10px; 
            color: #94a3b8; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
          }
          .card p { 
            margin: 10px 0 0; 
            font-size: 32px; 
            font-weight: bold; 
            color: #3b82f6; 
          }
          .lost-card { 
            border-left: 5px solid #ef4444; 
            background: rgba(239, 68, 68, 0.05); 
          }
          .lost-card p { 
            color: #f87171; 
          }
          .desp-card { 
            border-left: 5px solid #3b82f6; 
            background: rgba(59, 130, 246, 0.15); 
          }
          .desp-card p { 
            color: #60a5fa; 
          }
          .charts { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
            gap: 20px; 
            margin-bottom: 25px; 
          }
          .chart-box { 
            background: #1e293b; 
            padding: 20px; 
            border-radius: 10px; 
            border: 1px solid #334155; 
            text-align: center; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            background: #1e293b; 
            border-radius: 10px; 
            overflow: hidden; 
            margin-bottom: 30px; 
          }
          th { 
            background: #1e40af; 
            padding: 12px; 
            font-size: 11px; 
            text-align: center; 
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #334155; 
            font-size: 13px; 
            text-align: center; 
          }
          .badge { 
            padding: 4px 10px; 
            border-radius: 15px; 
            font-weight: bold; 
            font-size: 12px; 
            color: #fff; 
            margin: 2px; 
            display: inline-block; 
          }
          .req-badge { 
            background: #ef4444; 
            font-size: 10px; 
          }
          .cli-badge { 
            background: #f59e0b; 
            color: #000; 
            font-size: 11px; 
          }
          .prog-wrapper { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 10px; 
          }
          .prog-bg { 
            width: 150px; 
            background: #334155; 
            height: 12px; 
            border-radius: 6px; 
            overflow: hidden; 
          }
          .prog-fill { 
            background: #10b981; 
            height: 100%; 
            border-radius: 6px; 
          }
          .semaforo-dot { 
            height: 12px; 
            width: 12px; 
            border-radius: 50%; 
            display: inline-block; 
            margin-right: 5px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0;">TABLERO DE INDICADORES - LOGISV20</h2>
          <a href="/" class="btn-back">VOLVER</a>
        </div>

        <div class="kpi-grid">
          <div class="card">
            <h3>Total Servicios</h3>
            <p>${total}</p>
          </div>
          <div class="card">
            <h3>Finalizados</h3>
            <p style="color:#10b981">${fin}</p>
          </div>
          
          <div class="card desp-card">
            <h3>Despachados</h3>
            <p>${despachadosCount}</p>
          </div>
          
          <div class="card">
            <h3>En Ruta</h3>
            <p style="color:#fbbf24">${desp}</p>
          </div>
          
          <div class="card lost-card">
            <h3>Pérdida (Día)</h3>
            <p>${perdidaDiaria}</p>
          </div>
          <div class="card lost-card" style="border-left-color: #f87171;">
            <h3>Pérdida (Mes)</h3>
            <p>${perdidaMesActual}</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap:20px;">
          <div>
            <h3 style="color:#f59e0b; border-left: 4px solid #f59e0b; padding-left: 10px; margin-bottom:15px;">CARGAS PENDIENTES POR CLIENTE</h3>
            <table>
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>SIN PLACA</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(pendientesPorCliente).sort((a,b)=>b[1]-a[1]).map(([cli, cant]) => `
                  <tr>
                    <td><b>${cli}</b></td>
                    <td><span class="badge cli-badge">${cant}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 style="color:#ef4444; border-left: 4px solid #ef4444; padding-left: 10px; margin-bottom:15px;">VEHÍCULOS FALTANTES</h3>
            <table>
              <thead>
                <tr>
                  <th>ORIGEN</th>
                  <th>DETALLE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(reqPorCiudad).map(([city, types]) => `
                  <tr>
                    <td><b>${city}</b></td>
                    <td>
                      ${Object.entries(types).map(([t, q]) => `
                        <span class="badge req-badge">${q}</span> ${t}
                      `).join(' | ')}
                    </td>
                    <td>
                      <b style="color:#ef4444">${Object.values(types).reduce((a, b) => a + b, 0)}</b>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="charts">
          <div class="chart-box">
            <h4>ESTADO DE OPERACIÓN</h4>
            <canvas id="c1"></canvas>
          </div>
          <div class="chart-box">
            <h4>SERVICIOS POR OFICINA</h4>
            <canvas id="c2"></canvas>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>DESPACHADOR</th>
              <th>HOY</th>
              <th>MES</th>
              <th>ESTADO</th>
              <th>PRODUCTIVIDAD (%)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(despLog).map(([name, s]) => {
              const prodPerc = total > 0 ? ((s.mes/total)*100).toFixed(1) : 0;
              let semColor = prodPerc >= 25 ? '#10b981' : (prodPerc >= 10 ? '#fbbf24' : '#ef4444');
              return `
                <tr>
                  <td><b>${name}</b></td>
                  <td><span class="badge" style="background:#3b82f6">${s.hoy}</span></td>
                  <td><span class="badge" style="background:#8b5cf6">${s.mes}</span></td>
                  <td><span class="semaforo-dot" style="background:${semColor}"></span></td>
                  <td>
                    <div class="prog-wrapper">
                      <div class="prog-bg">
                        <div style="width:${prodPerc}%;background:${semColor}" class="prog-fill"></div>
                      </div>
                      <b>${prodPerc}%</b>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <script>
          new Chart(document.getElementById('c1'), {
            type: 'doughnut',
            data: {
              labels: ['Finalizado', 'En Ruta', 'Despachado', 'Pérdida', 'Otros'],
              datasets: [{
                data: [
                  ${fin},
                  ${desp},
                  ${despachadosCount},
                  ${perdidaConteo},
                  ${total - fin - desp - despachadosCount - perdidaConteo}
                ],
                backgroundColor: ['#10b981', '#fbbf24', '#3b82f6', '#ef4444', '#475569'],
                borderWidth: 0
              }]
            },
            options: {
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: '#fff' }
                }
              }
            }
          });

          new Chart(document.getElementById('c2'), {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(Object.keys(ofis))},
              datasets: [{
                label: 'Servicios',
                data: ${JSON.stringify(Object.values(ofis))},
                backgroundColor: '#3b82f6'
              }]
            },
            options: {
              scales: {
                y: { beginAtZero: true, ticks: { color: '#fff' } },
                x: { ticks: { color: '#fff' } }
              },
              plugins: { legend: { display: false } }
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (e) { 
    res.send(e.message); 
  }
});

// 9. SINCRONIZACIÓN Y ARRANQUE DEL SERVIDOR
db.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor KPI Node 20 corriendo...");
  });
});

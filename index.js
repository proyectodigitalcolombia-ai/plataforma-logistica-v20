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

app.get('/', async (req, res) => {
  try {
    // Recuperamos todas las cargas ordenadas por fecha de creación descendente
    const cargas = await C.findAll({ order: [['createdAt', 'DESC']] });
    
    // Construcción del HTML Principal con estilos expandidos para mantenimiento
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel de Gestión de Cargas - LOGISV20</title>
        <style>
          :root {
            --bg-dark: #0f172a;
            --card-bg: #1e293b;
            --border-color: #334155;
            --accent-blue: #2563eb;
            --text-main: #f8fafc;
            --text-dim: #94a3b8;
          }

          body { 
            background-color: var(--bg-dark); 
            color: var(--text-main); 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 40px; 
          }

          .navbar { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: var(--card-bg); 
            padding: 20px 30px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
            border: 1px solid var(--border-color); 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .title-section h2 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
          .title-section p { margin: 5px 0 0; color: var(--text-dim); font-size: 13px; }

          .btn-nav-kpi { 
            background: var(--accent-blue); 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
          }

          .btn-nav-kpi:hover { 
            background: #1d4ed8; 
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
          }

          .table-container {
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            overflow: hidden;
            margin-top: 20px;
          }

          table { width: 100%; border-collapse: collapse; text-align: left; }
          
          th { 
            background: #1e40af; 
            color: white; 
            padding: 18px; 
            font-size: 11px; 
            text-transform: uppercase; 
            letter-spacing: 1px;
          }

          td { 
            padding: 16px 18px; 
            border-bottom: 1px solid var(--border-color); 
            font-size: 13px; 
            color: #e2e8f0;
          }

          tr:hover { background: #1e293b; }

          .badge { 
            padding: 6px 12px; 
            border-radius: 20px; 
            font-size: 10px; 
            font-weight: 800; 
            text-transform: uppercase;
          }

          .status-fin { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
          .status-proc { background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid #fbbf24; }
          .status-pend { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; }

          .empty-state { padding: 50px; text-align: center; color: var(--text-dim); }
        </style>
      </head>
      <body>
        <div class="navbar">
          <div class="title-section">
            <h2>LOGISV20 | PANEL DE GESTIÓN</h2>
            <p>Monitoreo en tiempo real de unidades y despachos</p>
          </div>
          <a href="/stats" class="btn-nav-kpi">
            <span>VER INDICADORES (KPIs)</span>
          </a>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID SERVICIO</th>
                <th>CLIENTE</th>
                <th>ORIGEN / RUTA</th>
                <th>PLACA ASIGNADA</th>
                <th>FECHA DE INGRESO</th>
                <th>ESTADO ACTUAL</th>
              </tr>
            </thead>
            <tbody>
              ${cargas.length > 0 ? cargas.map(c => {
                const statusClass = c.f_fin ? 'status-fin' : (c.placa ? 'status-proc' : 'status-pend');
                const statusText = c.f_fin ? 'Finalizado' : (c.placa ? 'En Proceso' : 'Sin Placa');
                return `
                <tr>
                  <td><b>#${c.id}</b></td>
                  <td>${(c.cli || 'CLIENTE NO DEFINIDO').toUpperCase()}</td>
                  <td>${(c.orig || 'N/A').toUpperCase()}</td>
                  <td><span style="color: #3b82f6; font-weight: bold;">${c.placa || '---'}</span></td>
                  <td>${new Date(c.createdAt).toLocaleString('es-CO')}</td>
                  <td><span class="badge ${statusClass}">${statusText}</span></td>
                </tr>`;
              }).join('') : `<tr><td colspan="6" class="empty-state">No hay cargas registradas en la base de datos.</td></tr>`}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `);
  } catch (e) {
    res.status(500).send("<h1>Error del Servidor</h1><p>" + e.message + "</p>");
  }
});

/**
 * RUTA DE INDICADORES (/stats)
 * Descripción: Dashboard de métricas con lógica de transición a medianoche.
 */
app.get('/stats', async (req, res) => {
  try {
    const cargas = await C.findAll();
    const hoyDate = new Date();
    const hoyStr = hoyDate.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    const mesActualStr = hoyStr.substring(0, 7);

    // --- FILTRADO DE PENDIENTES ---
    const sinPlaca = cargas.filter(c => (!c.placa || c.placa.trim() === '') && !c.f_fin);
    const pendientesPorCliente = {};
    sinPlaca.forEach(c => { 
      const cliente = (c.cli || 'SIN CLIENTE').toUpperCase(); 
      pendientesPorCliente[cliente] = (pendientesPorCliente[cliente] || 0) + 1; 
    });

    const reqPorCiudad = {};
    sinPlaca.forEach(c => { 
      const ciudad = (c.orig || 'SIN ORIGEN').toUpperCase(); 
      const tipo = (c.t_v || 'NO ESPECIFICADO').toUpperCase(); 
      if(!reqPorCiudad[ciudad]) reqPorCiudad[ciudad] = {}; 
      reqPorCiudad[ciudad][tipo] = (reqPorCiudad[ciudad][tipo] || 0) + 1; 
    });

    // --- LÓGICA DE CANCELACIONES / PÉRDIDAS ---
    const cancelTags = ['CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 'CANCELADO POR GERENCIA'];
    const perdidosTotal = cargas.filter(c => cancelTags.includes(c.obs_e));
    const perdidaDiaria = perdidosTotal.filter(c => new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }) === hoyStr).length;
    const perdidaMesActual = perdidosTotal.filter(c => new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }).startsWith(mesActualStr)).length;
    const perdidaConteo = perdidosTotal.length;

    // --- LOG DE DESPACHADORES ---
    const despLog = {};
    cargas.forEach(c => { 
      const d = c.desp || 'SIN ASIGNAR'; 
      const fCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); 
      if(!despLog[d]) despLog[d] = { hoy:0, mes:0 }; 
      if(fCrea === hoyStr) despLog[d].hoy++; 
      if(fCrea.substring(0, 7) === mesActualStr) despLog[d].mes++; 
    });

    // --- CONTADORES CON REGLA DE MEDIANOCHE (00:00) ---
    const total = cargas.length;
    const fin = cargas.filter(c => c.f_fin).length;

    // DESPACHADOS: Placa asignada HOY
    const despachadosCount = cargas.filter(c => {
      const fechaCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      return c.placa && !c.f_fin && fechaCrea === hoyStr;
    }).length;

    // EN RUTA: Placa asignada en DÍAS ANTERIORES
    const desp = cargas.filter(c => {
      const fechaCrea = new Date(c.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      return c.placa && !c.f_fin && fechaCrea < hoyStr;
    }).length;

    const ofis = {}; 
    cargas.forEach(c => { if(c.oficina) ofis[c.oficina] = (ofis[c.oficina] || 0) + 1; });

    res.send(`
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Dashboard KPIs - LOGISV20</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { background: #0f172a; color: #fff; font-family: sans-serif; margin: 0; padding: 25px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #1e40af; padding-bottom: 20px; }
          .btn-back { background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; border: 1px solid #334155; font-weight: bold; }
          
          .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px; }
          
          .card { background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #334155; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .card h3 { margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
          .card p { margin: 15px 0 0; font-size: 36px; font-weight: 800; color: #3b82f6; }
          
          .desp-card { border-top: 4px solid #3b82f6; background: rgba(59, 130, 246, 0.05); }
          .ruta-card { border-top: 4px solid #fbbf24; }
          .fin-card { border-top: 4px solid #10b981; }
          .lost-card { border-top: 4px solid #ef4444; }

          .charts-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px; margin-top: 20px; }
          .chart-container { background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #334155; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 30px; background: #1e293b; border-radius: 12px; overflow: hidden; }
          th { background: #1e40af; padding: 15px; font-size: 12px; }
          td { padding: 15px; border-bottom: 1px solid #334155; text-align: center; }
          .badge-num { background: #3b82f6; color: white; padding: 4px 10px; border-radius: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2 style="margin:0; font-size: 28px;">TABLERO DE INDICADORES</h2>
            <p style="margin:5px 0 0; color:#94a3b8;">Corte automático de medianoche activo</p>
          </div>
          <a href="/" class="btn-back">← VOLVER AL PANEL</a>
        </div>

        <div class="kpi-grid">
          <div class="card"><h3>Total Servicios</h3><p>${total}</p></div>
          <div class="card fin-card"><h3>Finalizados</h3><p style="color:#10b981">${fin}</p></div>
          <div class="card desp-card"><h3>Despachados (Hoy)</h3><p style="color:#60a5fa">${despachadosCount}</p></div>
          <div class="card ruta-card"><h3>En Ruta (Transito)</h3><p style="color:#fbbf24">${desp}</p></div>
          <div class="card lost-card"><h3>Pérdida Diaria</h3><p style="color:#f87171">${perdidaDiaria}</p></div>
        </div>

        <div class="charts-section">
          <div class="chart-container">
            <h4 style="margin-top:0; text-align:center; color:#94a3b8;">ESTADO GLOBAL DE OPERACIONES</h4>
            <canvas id="c1"></canvas>
          </div>
          <div class="chart-container">
            <h4 style="margin-top:0; text-align:center; color:#94a3b8;">DISTRIBUCIÓN POR OFICINA</h4>
            <canvas id="c2"></canvas>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>DESPACHADOR</th><th>SERVICIOS HOY</th><th>ACUMULADO MES</th><th>PRODUCTIVIDAD</th></tr>
          </thead>
          <tbody>
            ${Object.entries(despLog).map(([name, s]) => `
              <tr>
                <td><b>${name}</b></td>
                <td><span class="badge-num">${s.hoy}</span></td>
                <td><span class="badge-num" style="background:#8b5cf6">${s.mes}</span></td>
                <td><div style="width:100px; background:#334155; height:8px; border-radius:4px; margin:auto;">
                  <div style="width:${(s.mes/total*100).toFixed(0)}%; background:#10b981; height:100%; border-radius:4px;"></div>
                </div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <script>
          const ctx1 = document.getElementById('c1').getContext('2d');
          new Chart(ctx1, {
            type: 'doughnut',
            data: {
              labels: ['Finalizados', 'En Ruta', 'Despachados', 'Pérdidas'],
              datasets: [{
                data: [${fin}, ${desp}, ${despachadosCount}, ${perdidaConteo}],
                backgroundColor: ['#10b981', '#fbbf24', '#3b82f6', '#ef4444'],
                borderWidth: 0
              }]
            },
            options: { plugins: { legend: { position: 'bottom', labels: { color: '#fff', padding: 20 } } } }
          });

          const ctx2 = document.getElementById('c2').getContext('2d');
          new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(Object.keys(ofis))},
              datasets: [{
                label: 'Cargas',
                data: ${JSON.stringify(Object.values(ofis))},
                backgroundColor: '#3b82f6',
                borderRadius: 5
              }]
            },
            options: {
              scales: {
                y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
              },
              plugins: { legend: { display: false } }
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (e) { res.send("Error en Estadísticas: " + e.message); }
});

// SINCRONIZACIÓN DE BASE DE DATOS Y ARRANQUE DEL SERVIDOR
db.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor LogisV20 operando en puerto 3000");
  });
});

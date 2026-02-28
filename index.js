const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const app = express();

// --- CONFIGURACIÓN DE MIDDLEWARE ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- CONEXIÓN A LA BASE DE DATOS POSTGRESQL ---
const db = new Sequelize(process.env.DATABASE_URL, { 
    dialect: 'postgres', 
    logging: false, 
    dialectOptions: { 
        ssl: { 
            require: true, 
            rejectUnauthorized: false 
        } 
    } 
});

// --- MODELO DE DATOS COMPLETO (38 CAMPOS) ---
const Carga = db.define('Carga', {
    oficina: { type: DataTypes.STRING },
    emp_gen: { type: DataTypes.STRING },
    comercial: { type: DataTypes.STRING },
    pto: { type: DataTypes.STRING },
    refleja: { type: DataTypes.STRING },
    f_doc: { type: DataTypes.STRING },
    h_doc: { type: DataTypes.STRING },
    do_bl: { type: DataTypes.STRING },
    cli: { type: DataTypes.STRING },
    subc: { type: DataTypes.STRING },
    mod: { type: DataTypes.STRING },
    lcl: { type: DataTypes.STRING },
    cont: { type: DataTypes.STRING },
    peso: { type: DataTypes.STRING },
    unid: { type: DataTypes.STRING },
    prod: { type: DataTypes.STRING },
    esq: { type: DataTypes.STRING },
    vence: { type: DataTypes.STRING },
    orig: { type: DataTypes.STRING },
    dest: { type: DataTypes.STRING },
    t_v: { type: DataTypes.STRING },
    ped: { type: DataTypes.STRING },
    f_c: { type: DataTypes.STRING },
    h_c: { type: DataTypes.STRING },
    f_d: { type: DataTypes.STRING },
    h_d: { type: DataTypes.STRING },
    placa: { type: DataTypes.STRING },
    f_p: { type: DataTypes.STRING },
    f_f: { type: DataTypes.STRING },
    obs_e: { type: DataTypes.STRING, defaultValue: 'PENDIENTE INSTRUCCIONES' },
    f_act: { type: DataTypes.STRING },
    obs: { type: DataTypes.TEXT },
    cond: { type: DataTypes.TEXT },
    h_t: { type: DataTypes.STRING },
    muc: { type: DataTypes.STRING },
    desp: { type: DataTypes.STRING },
    f_fin: { type: DataTypes.STRING },
    est_real: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
}, { 
    timestamps: true 
});

// --- LISTAS MAESTRAS DE OPCIONES (DATA) ---
const opciones = {
    oficinas: ['CARTAGENA', 'BOGOTÁ', 'BUENAVENTURA', 'MEDELLÍN'],
    puertos: [
        'SPIA', 'SPRB', 'TCBUEN', 'CONTECAR', 'SPRC', 
        'PUERTO COMPAS CCTO', 'PUERTO BAHÍA', 
        'SOCIEDAD PORTUARIA REGIONAL DE CARTAGENA', 
        'SPIA - AGUADULCE', 'PLANTA ESENTTIA KM 8 VIA MAMONAL', 
        'PLANTA YARA CARTAGENA MAMONAL', 'N/A'
    ],
    clientes: [
        'GEODIS COLOMBIA LTDA', 'MAERSK LOGISTICS SERVICES LTDA', 
        'SAMSUNG SDS COLOMBIA GLOBAL', 'ENVAECOL', 'SEA CARGO COLOMBIA LTDA', 
        'YARA COLOMBIA', 'ESENTTIA SA', 'BRINSA SA', 'ACERIAS PAZ DEL RIO', 
        'TERNIUM DEL ATLANTICO', 'PLASTICOS ESPECIALES SAS', 'INGENIO MAYAGUEZ', 
        'TENARIS', 'CASA LUKER', 'CORONA', 'EDITORIAL NOMOS', 
        'ALIMENTOS POLAR', 'PLEXA SAS ESP', 'FAJOBE'
    ],
    modalidades: [
        'NACIONALIZADO', 'OTM', 'DTA', 'TRASLADO', 
        'NACIONALIZADO EXP', 'ITR', 'VACÍO EN EXPRESO', 
        'VACÍO CONSOLIDADO', 'NACIONALIZADO IMP'
    ],
    tiposCarga: [
        'CARGA SUELTA', 'CONTENEDOR 40', 'CONTENEDOR 20', 
        'REFER 40', 'REFER 20', 'FLAT RACK 20', 'FLAT RACK 40'
    ],
    esquemas: [
        '1 ESCOLTA - SELLO', '2 ESCOLTAS SELLO - SPIA', 'SELLO', 
        '1 ESCOLTA', '2 ESCOLTA', 'NO REQUIERE', 
        '2 ESCOLTAS SELLO', 'INSPECTORES VIALES'
    ],
    vehiculos: [
        'TURBO 2.5 TN', 'TURBO 4.5 TN', 'TURBO SENCILLO', 
        'SENCILLO 9 TN', 'PATINETA 2S3', 'TRACTOMULA 3S2', 
        'TRACTOMULA 3S3', 'CAMA BAJA', 'DOBLE TROQUE'
    ],
    ciudades: [
        'BOGOTÁ', 'MEDELLÍN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 
        'BUENAVENTURA', 'SANTA MARTA', 'CÚCUTA', 'IBAGUÉ', 'PEREIRA', 
        'MANIZALES', 'NEIVA', 'VILLAVICENCIO', 'YOPAL', 'SIBERIA', 
        'FUNZA', 'MOSQUERA', 'MADRID', 'FACATATIVÁ', 'TOCANCIPÁ', 
        'CHÍA', 'CAJICÁ'
    ],
    subclientes: [
        'HIKVISION', 'PAYLESS COLOMBIA', 'INDUSTRIAS DONSSON', 
        'SAMSUNG SDS', 'ÉXITO', 'ALKOSTO', 'FALABELLA', 'SODIMAC', 
        'ENVAECOL', 'ALPLA', 'AMCOR', 'MEXICHEM', 'KOBA D1', 
        'JERONIMO MARTINS', 'TERNIUM', 'BRINSA', 'TENARIS', 
        'CORONA', 'FAJOBE'
    ],
    estados: [
        'ASIGNADO VEHÍCULO', 'PENDIENTE CITA ASIGNADO', 'VEHÍCULO CON CITA', 
        'CANCELADO POR CLIENTE', 'CANCELADO POR NEGLIGENCIA OPERATIVA', 
        'CONTENEDOR EN INSPECCIÓN', 'CONTENEDOR RETIRADO PARA ITR', 
        'DESPACHADO', 'DESPACHADO CON NOVEDAD', 'EN CONSECUCIÓN', 
        'EN PROGRAMACIÓN', 'EN SITIO DE CARGUE', 'FINALIZADO CON NOVEDAD', 
        'FINALIZADO SIN NOVEDAD', 'HOJA DE VIDA EN ESTUDIO', 
        'MERCANCÍA EN INSPECCIÓN', 'NOVEDAD', 'PENDIENTE BAJAR A PATIO', 
        'PENDIENTE INSTRUCCIONES', 'PRE ASIGNADO', 
        'RETIRADO DE PUERTO PENDIENTE CONSOLIDADO', 
        'CANCELADO POR GERENCIA', 'VEHICULO EN RUTA'
    ],
    despachadores: [
        'ABNNER MARTINEZ', 'CAMILO TRIANA', 'FREDY CARRILLO', 
        'RAUL LOPEZ', 'EDDIER RIVAS'
    ]
};

// --- FUNCIÓN DE FECHA ACTUAL (COLOMBIA) ---
function obtenerFechaHoraActual() {
    const ahora = new Date();
    return ahora.toLocaleString('es-CO', { 
        timeZone: 'America/Bogota', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    }).replace(/\//g, '-');
}

// --- ESTILOS CSS DEL DASHBOARD ---
const estilosGlobales = `<style>
    body { background-color: #0f172a; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; }
    .scroll-container { width: 100%; overflow-x: auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .fake-scroll { height: 15px; margin-bottom: 5px; }
    .fake-content { width: 8600px; height: 1px; }
    table { border-collapse: collapse; min-width: 100%; font-size: 11px; table-layout: fixed; }
    #tabla-principal { min-width: 8600px; }
    th { background-color: #1e40af; padding: 15px 8px; text-align: center; position: sticky; top: 0; border-right: 1px solid #3b82f6; z-index: 20; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px; border: 1px solid #334155; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .col-id { width: 50px; font-weight: bold; color: #60a5fa; }
    .col-registro { width: 130px; font-size: 10px; }
    .col-empresa { width: 180px; text-align: left; }
    .col-placa { width: 140px; background-color: #1e293b; }
    .input-placa { width: 90px; padding: 6px; border-radius: 4px; border: 1px solid #475569; font-weight: bold; text-align: center; text-transform: uppercase; }
    .col-estado-celda { width: 230px; padding: 0 !important; }
    .select-estado { width: 100%; height: 100%; background: none; color: #fff; border: none; padding: 10px; cursor: pointer; font-size: 10px; }
    .select-estado:focus { outline: none; background-color: #334155; }
    
    .formulario-registro { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background-color: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #2563eb; margin-bottom: 30px; }
    .campo-grupo { display: flex; flex-direction: column; gap: 6px; }
    .campo-grupo label { font-size: 10px; color: #94a3b8; font-weight: bold; text-transform: uppercase; }
    .campo-grupo input, .campo-grupo select, .campo-grupo textarea { padding: 10px; border-radius: 6px; border: 1px solid #475569; font-size: 12px; background-color: #ffffff; color: #000; }
    
    .boton-registrar { grid-column: 1 / -1; background-color: #2563eb; color: #ffffff; padding: 15px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
    .boton-registrar:hover { background-color: #1d4ed8; }
    
    .vence-critico { background-color: #991b1b !important; color: #ffffff !important; font-weight: bold; animation: parpadeo 1.5s infinite; }
    .vence-advertencia { background-color: #854d0e !important; color: #ffffff !important; }
    @keyframes parpadeo { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
    
    .status-badge { padding: 4px 10px; border-radius: 15px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
    tr:hover td { background-color: #334155; }
</style>`;

// --- RUTA: VISTA PRINCIPAL (DASHBOARD) ---
app.get('/', async (req, res) => {
    try {
        const despachos = await Carga.findAll({ order: [['id', 'DESC']] });
        let cuerpoTabla = '';
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0);

        despachos.forEach((item, index) => {
            const bloqueado = item.f_fin ? 'disabled' : '';
            
            // Lógica de color de estado final
            let statusTexto = 'PENDIENTE';
            let statusEstilo = 'background-color: #475569; color: #cbd5e1;';
            if (item.f_fin) {
                statusTexto = 'FINALIZADO';
                statusEstilo = 'background-color: #1e40af; color: #bfdbfe;';
            } else if (item.placa) {
                statusTexto = 'DESPACHADO';
                statusEstilo = 'background-color: #166534; color: #dcfce7;';
            }

            // Lógica de alertas de vencimiento
            let claseVencimiento = '';
            if (item.vence && !item.f_fin) {
                const fechaVence = new Date(item.vence);
                const diferenciaDias = Math.ceil((fechaVence - fechaHoy) / (1000 * 60 * 60 * 24));
                if (diferenciaDias <= 2) claseVencimiento = 'vence-critico';
                else if (diferenciaDias <= 6) claseVencimiento = 'vence-advertencia';
            }

            cuerpoTabla += `<tr class="fila-datos">
                <td>${index + 1}</td>
                <td class="col-id">${item.id.toString().padStart(4, '0')}</td>
                <td class="col-registro">${new Date(item.createdAt).toLocaleString('es-CO')}</td>
                <td>${item.oficina || ''}</td>
                <td class="col-empresa"><b>${item.emp_gen || ''}</b></td>
                <td>${item.comercial || ''}</td>
                <td>${item.pto || ''}</td>
                <td>${item.refleja || ''}</td>
                <td>${item.f_doc || ''}</td>
                <td>${item.h_doc || ''}</td>
                <td>${item.do_bl || ''}</td>
                <td>${item.cli || ''}</td>
                <td>${item.subc || ''}</td>
                <td>${item.mod || ''}</td>
                <td>${item.lcl || ''}</td>
                <td>${item.cont || ''}</td>
                <td>${item.peso || ''}</td>
                <td>${item.unid || ''}</td>
                <td>${item.prod || ''}</td>
                <td>${item.esq || ''}</td>
                <td class="${claseVencimiento}">${item.vence || ''}</td>
                <td>${item.orig || ''}</td>
                <td>${item.dest || ''}</td>
                <td>${item.t_v || ''}</td>
                <td>${item.ped || ''}</td>
                <td>${item.f_c || ''}</td>
                <td>${item.h_c || ''}</td>
                <td>${item.f_d || ''}</td>
                <td>${item.h_d || ''}</td>
                <td class="col-placa">
                    <form action="/actualizar-placa/${item.id}" method="POST" style="margin:0; display:flex; gap:5px; justify-content:center;">
                        <input name="placa" class="input-placa" value="${item.placa || ''}" ${bloqueado} placeholder="PLACA">
                        <button ${bloqueado} style="background-color:#10b981; border:none; color:white; border-radius:4px; cursor:pointer; padding:5px 8px;">OK</button>
                    </form>
                </td>
                <td>${item.f_p || ''}</td>
                <td>${item.f_f || ''}</td>
                <td class="col-estado-celda">
                    <select class="select-estado" ${bloqueado} onchange="actualizarEstadoRapido(${item.id}, this.value)">
                        ${opciones.estados.map(est => `<option value="${est}" ${item.obs_e === est ? 'selected' : ''}>${est}</option>`).join('')}
                    </select>
                </td>
                <td style="color: #fbbf24; font-size: 10px;">${item.f_act || ''}</td>
                <td><span class="status-badge" style="${statusEstilo}">${statusTexto}</span></td>
                <td style="white-space: normal; text-align: left; min-width: 350px;">${item.obs || ''}</td>
                <td style="white-space: normal; text-align: left; min-width: 350px;">${item.cond || ''}</td>
                <td>${item.h_t || ''}</td>
                <td>${item.muc || ''}</td>
                <td>${item.desp || ''}</td>
                <td>${item.f_fin ? '✅' : (item.placa ? `<a href="/finalizar-servicio/${item.id}" style="color:#10b981; text-decoration:none; font-weight:bold;" onclick="return confirm('¿Finalizar despacho?')">FIN</a>` : '...') }</td>
                <td style="color:#60a5fa;"><b>${item.f_fin || '--'}</b></td>
                <td><a href="javascript:eliminarRegistro(${item.id})" style="text-decoration:none;">🗑️</a> <input type="checkbox" class="check-fila" value="${item.id}"></td>
            </tr>`;
        });

        res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20 - PANEL YEGO ECO T</title>${estilosGlobales}</head><body>
            <h1 style="color:#3b82f6;">SISTEMA DE CONTROL LOGÍSTICO YEGO ECO T S.A.S</h1>
            
            <div style="display:flex; gap:15px; margin-bottom:25px; align-items:center;">
                <input type="text" id="filtro-busqueda" onkeyup="ejecutarFiltro()" placeholder="🔍 Buscar despacho..." style="padding:12px; width:350px; border-radius:8px; border:2px solid #3b82f6; background:#0f172a; color:#fff;">
                <button onclick="exportarExcel()" style="background:#166534; color:#fff; padding:12px 20px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">📊 DESCARGAR EXCEL</button>
                <a href="/indicadores" style="background:#5b21b6; color:#fff; padding:12px 20px; text-decoration:none; border-radius:8px; font-weight:bold;">📈 TABLERO KPI</a>
            </div>

            <form action="/crear-registro" method="POST" class="formulario-registro">
                <div class="campo-grupo"><label>Oficina</label><select name="oficina">${opciones.oficinas.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
                <div class="campo-grupo"><label>Puerto</label><select name="pto">${opciones.puertos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
                <div class="campo-grupo"><label>DO / BL</label><input name="do_bl" required placeholder="Ingrese DO"></div>
                <div class="campo-grupo"><label>Cliente</label><select name="cli">${opciones.clientes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
                <div class="campo-grupo"><label>Contenedor</label><input name="cont" oninput="this.value=this.value.toUpperCase()"></div>
                <div class="campo-grupo"><label>Fecha Vencimiento</label><input name="vence" type="date"></div>
                <div class="campo-grupo"><label>Origen</label><input name="orig" list="lista-ciudades"></div>
                <div class="campo-grupo"><label>Destino</label><input name="dest" list="lista-ciudades"></div>
                <div class="campo-grupo"><label>Tipo Vehículo</label><select name="t_v">${opciones.vehiculos.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
                <div class="campo-grupo"><label>Despachador</label><select name="desp">${opciones.despachadores.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
                <div class="campo-grupo" style="grid-column: span 2"><label>Observaciones de Carga</label><textarea name="obs" rows="1"></textarea></div>
                <datalist id="lista-ciudades">${opciones.ciudades.map(c=>`<option value="${c}">`).join('')}</datalist>
                <input type="hidden" name="emp_gen" value="YEGO ECO-T SAS">
                <input type="hidden" name="comercial" value="RAÚL LÓPEZ">
                <button type="submit" class="boton-registrar">REGISTRAR CARGA EN SISTEMA</button>
            </form>

            <div class="fake-scroll" id="scroll-superior"><div class="fake-content"></div></div>
            <div class="scroll-container" id="scroll-maestro">
                <table id="tabla-principal">
                    <thead>
                        <tr>
                            <th style="width:40px;">#</th><th class="col-id">ID</th><th class="col-registro">FECHA REG</th><th>OFI</th><th class="col-empresa">EMPRESA</th><th>COM</th><th>PTO</th><th>REF</th><th>F.DOC</th><th>H.DOC</th><th>DO/BL</th><th>CLIENTE</th><th>SUB</th><th>MOD</th><th>LCL</th><th>CONT</th><th>KG</th><th>UN</th><th>PROD</th><th>ESQ</th><th>VENCE</th><th>ORIG</th><th>DEST</th><th>VEH</th><th>PED</th><th>FC</th><th>HC</th><th>FD</th><th>HD</th><th class="col-placa">PLACA</th><th>PAG</th><th>FAC</th><th class="col-estado-celda">ESTADO OPERATIVO</th><th>ACTUALIZADO</th><th>STATUS</th><th>OBSERVACIONES</th><th>CONDICIONES</th><th>H.CIT</th><th>MUC</th><th>DESP</th><th>FIN</th><th>H.FINAL</th><th>OPC</th>
                        </tr>
                    </thead>
                    <tbody>${cuerpoTabla}</tbody>
                </table>
            </div>

            <script>
                const sup = document.getElementById('scroll-superior'), mae = document.getElementById('scroll-maestro');
                sup.onscroll = () => mae.scrollLeft = sup.scrollLeft;
                mae.onscroll = () => sup.scrollLeft = mae.scrollLeft;

                function actualizarEstadoRapido(id, valor) {
                    fetch('/actualizar-estado-operativo/' + id, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ nuevoEstado: valor })
                    }).then(() => location.reload());
                }

                function eliminarRegistro(id) {
                    const clave = prompt("Ingrese clave de administrador:");
                    if (clave === "ADMIN123") {
                        if (confirm("¿Está seguro de eliminar este despacho permanentemente?")) {
                            location.href = "/eliminar-despacho/" + id;
                        }
                    }
                }

                function ejecutarFiltro() {
                    const input = document.getElementById("filtro-busqueda").value.toUpperCase();
                    const filas = document.querySelectorAll(".fila-datos");
                    filas.forEach(fila => {
                        fila.style.display = fila.innerText.toUpperCase().includes(input) ? "" : "none";
                    });
                }

                function exportarExcel() {
                    let contenidoCsv = "sep=;\\n";
                    const filas = document.querySelectorAll("#tabla-principal tr");
                    filas.forEach(fila => {
                        const celdas = Array.from(fila.querySelectorAll("td, th")).map(celda => {
                            const control = celda.querySelector("input, select, textarea");
                            return '"' + (control ? control.value : celda.innerText).replace(/;/g, ",") + '"';
                        });
                        contenidoCsv += celdas.slice(0, -1).join(";") + "\\n";
                    });
                    const blob = new Blob(["\\ufeff" + contenidoCsv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "Reporte_Despachos_Yego.csv";
                    link.click();
                }
            </script>
        </body></html>`);
    } catch (err) { res.status(500).send("Error en servidor: " + err.message); }
});

// --- RUTA: INDICADORES (KPI) ---
app.get('/indicadores', async (req, res) => {
    try {
        const todosLosRegistros = await Carga.findAll();
        
        // FILTRO: Solo cargas que NO tienen placa asignada y NO han sido finalizadas
        const pendientesSinPlaca = todosLosRegistros.filter(c => (!c.placa || c.placa.trim() === '') && !c.f_fin);

        // Agrupación por Cliente
        const conteoPorCliente = {};
        pendientesSinPlaca.forEach(c => {
            const clienteKey = (c.cli || 'CLIENTE NO ASIGNADO').toUpperCase();
            conteoPorCliente[clienteKey] = (conteoPorCliente[clienteKey] || 0) + 1;
        });

        // Agrupación por Origen y Tipo de Vehículo
        const necesidadesPorOrigen = {};
        pendientesSinPlaca.forEach(c => {
            const ciudadKey = (c.orig || 'SIN ORIGEN').toUpperCase();
            const vehiculoKey = (c.t_v || 'TRACTO/SENCILLO').toUpperCase();
            if (!necesidadesPorOrigen[ciudadKey]) necesidadesPorOrigen[ciudadKey] = {};
            necesidadesPorOrigen[ciudadKey][vehiculoKey] = (necesidadesPorOrigen[ciudadKey][vehiculoKey] || 0) + 1;
        });

        res.send(`<html><head><meta charset="UTF-8"><title>KPI - SERVICIOS PENDIENTES</title>
        <style>
            body { background: #0f172a; color: #fff; font-family: sans-serif; padding: 40px; }
            .contenedor-kpi { max-width: 1200px; margin: 0 auto; }
            .tarjeta-resumen { background: #1e293b; padding: 30px; border-radius: 15px; border: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
            .tarjeta-resumen h2 { margin: 0; color: #94a3b8; font-size: 14px; text-transform: uppercase; }
            .tarjeta-resumen .valor { font-size: 60px; font-weight: bold; color: #f59e0b; }
            table { width: 100%; border-collapse: collapse; background: #1e293b; margin-top: 20px; border-radius: 10px; overflow: hidden; }
            th { background: #1e40af; padding: 15px; text-align: left; border-bottom: 2px solid #3b82f6; }
            td { padding: 15px; border-bottom: 1px solid #334155; }
            .badge-alerta { background: #f59e0b; color: #000; padding: 5px 12px; border-radius: 15px; font-weight: bold; }
            .btn-regresar { display: inline-block; background: #334155; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; }
        </style></head>
        <body>
            <div class="contenedor-kpi">
                <a href="/" class="btn-regresar">⬅ VOLVER AL DASHBOARD</a>
                <div class="tarjeta-resumen">
                    <div><h2>Servicios Pendientes por Asignar Placa</h2><div class="valor">${pendientesSinPlaca.length}</div></div>
                    <div style="text-align: right;"><h2>Total de Clientes Afectados</h2><div class="valor" style="color:#60a5fa">${Object.keys(conteoPorCliente).length}</div></div>
                </div>

                <h3 style="color:#f59e0b; font-size: 22px;">📊 CARGAS PENDIENTES POR CLIENTE (SIN PLACA)</h3>
                <table>
                    <thead><tr><th>CLIENTE</th><th>CANTIDAD PENDIENTE</th><th>ESTADO CRÍTICO</th></tr></thead>
                    <tbody>
                        ${Object.entries(conteoPorCliente).sort((a,b) => b[1] - a[1]).map(([cli, total]) => `
                        <tr>
                            <td><b>${cli}</b></td>
                            <td><span class="badge-alerta">${total} CARGAS</span></td>
                            <td style="color:#ef4444; font-size: 11px;">⚠️ REQUIERE VEHÍCULO URGENTE</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                <h3 style="color:#3b82f6; font-size: 22px; margin-top: 50px;">📍 REQUERIMIENTOS POR CIUDAD DE ORIGEN</h3>
                <table>
                    <thead><tr><th>CIUDAD</th><th>DETALLE DE VEHÍCULOS SOLICITADOS</th><th>TOTAL</th></tr></thead>
                    <tbody>
                        ${Object.entries(necesidadesPorOrigen).map(([ciudad, vehs]) => {
                            const t = Object.values(vehs).reduce((a, b) => a + b, 0);
                            return `<tr>
                                <td><b>${ciudad}</b></td>
                                <td>${Object.entries(vehs).map(([tipo, cant]) => `<span style="color:#60a5fa">${cant}</span> ${tipo}`).join(' | ')}</td>
                                <td style="font-weight:bold; color:#f59e0b;">${t}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </body></html>`);
    } catch (err) { res.status(500).send("Error KPI: " + err.message); }
});

// --- RUPTAS DE OPERACIONES CRUD ---

app.post('/crear-registro', async (req, res) => {
    req.body.f_act = obtenerFechaHoraActual();
    await Carga.create(req.body);
    res.redirect('/');
});

app.post('/actualizar-placa/:id', async (req, res) => {
    const nuevaPlaca = req.body.placa.toUpperCase();
    await Carga.update({ 
        placa: nuevaPlaca, 
        est_real: 'DESPACHADO', 
        f_act: obtenerFechaHoraActual() 
    }, { 
        where: { id: req.params.id } 
    });
    res.redirect('/');
});

app.post('/actualizar-estado-operativo/:id', async (req, res) => {
    await Carga.update({ 
        obs_e: req.body.nuevoEstado, 
        f_act: obtenerFechaHoraActual() 
    }, { 
        where: { id: req.params.id } 
    });
    res.sendStatus(200);
});

app.get('/finalizar-servicio/:id', async (req, res) => {
    const ahora = obtenerFechaHoraActual();
    await Carga.update({ 
        f_fin: ahora, 
        obs_e: 'FINALIZADO SIN NOVEDAD', 
        est_real: 'FINALIZADO', 
        f_act: ahora 
    }, { 
        where: { id: req.params.id } 
    });
    res.redirect('/');
});

app.get('/eliminar-despacho/:id', async (req, res) => {
    await Carga.destroy({ where: { id: req.params.id } });
    res.redirect('/');
});

// --- INICIALIZACIÓN DEL SERVIDOR ---
db.sync({ alter: true }).then(() => {
    const puerto = process.env.PORT || 3000;
    app.listen(puerto, () => {
        console.log("------------------------------------------");
        console.log("  LOGISV20 CORRIENDO EN PUERTO: " + puerto);
        console.log("  NODE_VERSION: 20");
        console.log("------------------------------------------");
    });
});

// ... (mantenemos la conexión y el modelo anterior)

app.get('/', async (req, res) => {
  try {
    const pendientes = await Carga.findAll({ 
      where: { estado: 'PENDIENTE' },
      order: [['createdAt', 'ASC']] // Las más antiguas primero para prioridad
    });

    const enRuta = await Carga.findAll({ 
      where: { estado: 'EN TRANSITO' },
      order: [['updatedAt', 'DESC']] 
    });

    const renderFilas = (lista) => lista.map(c => `
      <tr class="data-row">
        <td class="cell-id">#${c.id}</td>
        <td class="cell-main">
            <div class="client-name">${c.cliente}</div>
            <div class="timestamp">Registrado: ${c.createdAt.toLocaleTimeString()}</div>
        </td>
        <td class="cell-route">
          <div class="route-container">
            <span class="route-point">📍 ${c.origen}</span>
            <span class="route-arrow">→</span>
            <span class="route-point">🏁 ${c.destino}</span>
          </div>
        </td>
        <td>
            ${c.estado === 'PENDIENTE' 
                ? `<span class="status-pill pendiente">ESPERANDO VEHÍCULO</span>` 
                : `<span class="status-pill en-transito">EN MOVIMIENTO</span>`}
        </td>
        <td class="cell-gest">
          ${c.estado === 'PENDIENTE' ? 
            `<form action="/vincular/${c.id}" method="POST" class="action-form">
              <input name="placa" placeholder="PLACA" required maxlength="7">
              <button type="submit" class="btn-activate">DESPACHAR</button>
            </form>` : `<div class="placa-active">🚚 ${c.placa}</div>`}
        </td>
      </tr>`).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Logisv20 | Terminal de Despacho</title>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root { 
          --bg: #0a0c10; --panel: #151921; --accent: #0070f3; 
          --text: #ffffff; --dim: #94a3b8; --border: #2d3748;
          --warning-glow: rgba(245, 158, 11, 0.3);
        }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; }
        .top-nav { background: #fff; color: #000; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid var(--accent); }
        .main { padding: 30px 40px; }
        
        h3 { font-family: 'Rajdhani'; text-transform: uppercase; letter-spacing: 2px; color: var(--accent); margin-top: 40px; }
        
        .table-card { 
            background: var(--panel); border-radius: 12px; border: 1px solid var(--border); 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden; margin-bottom: 20px;
        }
        
        /* Efecto Agresivo para Pendientes */
        .pending-section { border: 1px solid var(--warning-glow); box-shadow: 0 0 15px var(--warning-glow); }
        
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e293b; color: var(--dim); padding: 15px; font-size: 11px; text-transform: uppercase; text-align: left; }
        td { padding: 15px; border-bottom: 1px solid var(--border); font-size: 13px; }
        
        .timestamp { font-size: 10px; color: var(--dim); margin-top: 4px; }
        .route-container { display: flex; align-items: center; gap: 8px; font-family: 'Rajdhani'; font-weight: 600; }
        .route-point { background: rgba(255,255,255,0.05); padding: 3px 6px; border-radius: 4px; }
        
        .status-pill { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid; }
        .pendiente { color: #f59e0b; border-color: #f59e0b; animation: blink 2s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
        
        .btn-activate { 
            background: var(--accent); color: #fff; border: none; padding: 8px 15px; 
            border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.3s;
        }
        .btn-activate:hover { background: #0056b3; transform: scale(1.05); }
        .placa-active { color: #10b981; font-family: 'Rajdhani'; font-size: 18px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="top-nav">
        <div style="font-family:'Rajdhani'; font-size:22px; font-weight:700;">LOGISV20 <span style="color:var(--accent)">COMMAND CENTER</span></div>
        <div style="font-size: 12px; font-weight: bold;">OPERADOR: ACTIVO</div>
      </div>
      
      <div class="main">
        <h3>⚠️ Cola de Cargas Pendientes (${pendientes.length})</h3>
        <div class="table-card pending-section">
          <table>
            <thead>
              <tr><th>ID</th><th>GENERADOR</th><th>RUTA</th><th>ESTADO CRÍTICO</th><th>ACCIÓN DE DESPACHO</th></tr>
            </thead>
            <tbody>${renderFilas(pendientes) || '<tr><td colspan="5" style="text-align:center; padding:40px;">COLA VACÍA - TODO DESPACHADO</td></tr>'}</tbody>
          </table>
        </div>

        <h3>🚚 Monitoreo en Tiempo Real (${enRuta.length})</h3>
        <div class="table-card">
          <table>
            <thead>
              <tr><th>ID</th><th>GENERADOR</th><th>RUTA</th><th>ESTADO</th><th>VEHÍCULO</th></tr>
            </thead>
            <tbody>${renderFilas(enRuta) || '<tr><td colspan="5" style="text-align:center; padding:40px;">NO HAY VEHÍCULOS EN RUTA</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </body>
    </html>`);
  } catch (e) { res.status(500).send(e.message); }
});
// ... (restos de rutas seed y vincular iguales)

const axios = require('axios');

/**
 * Función para sincronizar la carga con el Robot Worker
 * Activa el monitoreo automático en el navegador.
 */
async function enviarAMonitor(datosCarga) {
    try {
        // URL exacta de tu Robot Worker en Render
        const MONITOR_URL = 'https://yego-robot-worker.onrender.com/api/robot';

        // Estructura de datos que el robot.js espera recibir
        const payload = {
            placa: datosCarga.placa,
            cont: datosCarga.contenedor || datosCarga.cont || "N/A",
            config_gps: {
                url: datosCarga.url_plataforma || datosCarga.url_gps,
                user: datosCarga.usuario_gps || datosCarga.user_gps,
                pass: datosCarga.clave_gps || datosCarga.pass_gps
            }
        };

        console.log(`📡 Enviando datos al Robot para placa: ${payload.placa}...`);

        const response = await axios.post(MONITOR_URL, payload);

        if (response.status === 200) {
            console.log(`✅ Sincronización exitosa con Robot Worker: ${payload.placa}`);
        }
    } catch (error) {
        // El error se muestra en el log de la Plataforma, pero no detiene la operación
        console.error(`⚠️ El Robot no respondió: ${error.message}`);
        console.log("Revisa que el servicio 'yego-robot-worker' esté en verde (Live).");
    }
}

/**
 * Función para actualizar datos en tu base de datos local (Postgres)
 */
async function actualizarUbicacionReal(placa) {
    try {
        console.log(`[DB] Buscando registros locales para placa: ${placa}...`);
        // Aquí va tu lógica original de base de datos si la necesitas
    } catch (error) {
        console.error(`❌ Error en base de datos local:`, error.message);
    }
}

module.exports = { enviarAMonitor, actualizarUbicacionReal };

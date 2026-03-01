const axios = require('axios');

/**
 * Función para sincronizar la carga con el Monitor (Servicio B)
 * y activar el rastreo automático.
 */
async function enviarAMonitor(datosCarga) {
    try {
        // La URL de tu nuevo Servicio B en Render
        const MONITOR_URL = 'https://yego-monitoreo-live.onrender.com/api/recibir-despacho';

        await axios.post(MONITOR_URL, {
            placa: datosCarga.placa,
            nombre_conductor: datosCarga.nombre_conductor || datosCarga.conductor,
            cedula_conductor: datosCarga.cedula_conductor || datosCarga.cedula,
            celular_conductor: datosCarga.celular_conductor || datosCarga.celular,
            url_gps: datosCarga.url_plataforma, 
            user_gps: datosCarga.usuario_gps,
            pass_gps: datosCarga.clave_gps,
            hora_inicio: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        });

        console.log(`✅ Sincronización exitosa con Monitor: ${datosCarga.placa}`);
    } catch (error) {
        // Si el monitor está caído, tu plataforma principal NO se detiene
        console.error(`⚠️ No se pudo enviar a Monitor, pero la logística sigue: ${error.message}`);
    }
}

/**
 * Tu función original (Mantenida por si la usas internamente)
 */
async function actualizarUbicacionReal(placa) {
    try {
        // Mantenemos tu lógica original aquí por si decides 
        // seguir actualizando tu DB local de Postgres
        console.log(`Buscando datos para placa: ${placa}...`);
        // ... (resto de tu código original)
    } catch (error) {
        console.error(`❌ Error vinculando GPS:`, error.message);
    }
}

module.exports = { enviarAMonitor, actualizarUbicacionReal };

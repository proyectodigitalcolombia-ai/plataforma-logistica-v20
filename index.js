// 3. Interfaz para subir y VER las cargas
app.get('/', async (req, res) => {
  try {
    // Consultamos todas las cargas guardadas en Postgres 17
    const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });

    let filasHtml = cargas.map(c => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${c.cliente}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${c.subcliente}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${c.puerto}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${c.destino}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${c.peso}</td>
        <td style="border: 1px solid #ddd; padding: 8px; background: #fff3cd;">${c.estado}</td>
      </tr>
    `).join('');

    res.send(`
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">🚚 Panel de Control Logístico</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3>Importar Nuevas Cargas</h3>
          <form action="/upload" method="POST" encType="multipart/form-data">
            <input type="file" name="excel" accept=".xlsx" />
            <button type="submit" style="background: #007bff; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Subir Excel</button>
          </form>
        </div>

        <h3>Cargas en Sistema (Postgres 17)</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #2c3e50; color: white;">
              <th style="padding: 10px; text-align: left;">Cliente</th>
              <th style="padding: 10px; text-align: left;">Subcliente</th>
              <th style="padding: 10px; text-align: left;">Puerto Origen</th>
              <th style="padding: 10px; text-align: left;">Destino</th>
              <th style="padding: 10px; text-align: left;">Peso (Kg)</th>
              <th style="padding: 10px; text-align: left;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${filasHtml || '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay cargas registradas aún.</td></tr>'}
          </tbody>
        </table>
      </div>
    `);
  } catch (error) {
    res.send("Error cargando el panel: " + error.message);
  }
});

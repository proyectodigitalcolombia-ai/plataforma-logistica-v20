// 3. Panel de Control con Asignación de Tráfico
app.get('/', async (req, res) => {
  try {
    const cargas = await Carga.findAll({ order: [['createdAt', 'DESC']] });

    let filasHtml = cargas.map(c => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${c.cliente}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${c.destino}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${c.peso}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
           <span style="padding: 4px 8px; border-radius: 4px; background: ${c.estado === 'PENDIENTE' ? '#fff3cd' : '#d4edda'};">
             ${c.estado}
           </span>
        </td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          ${c.estado === 'PENDIENTE' ? `
            <form action="/asignar/${c.id}" method="POST" style="display: flex; gap: 5px;">
              <input type="text" name="placa" placeholder="Placa" required style="width: 70px;">
              <input type="text" name="conductor" placeholder="Conductor" required>
              <button type="submit" style="background: #28a745; color: white; border: none; cursor: pointer;">Despachar</button>
            </form>
          ` : `<strong>${c.placa}</strong>`}
        </td>
      </tr>
    `).join('');

    res.send(`
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">🚚 Control de Tráfico - Node 20</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #dee2e6;">
          <strong>Cargar nuevo Excel:</strong>
          <form action="/upload" method="POST" encType="multipart/form-data" style="display: inline-block; margin-left: 10px;">
            <input type="file" name="excel" accept=".xlsx" />
            <button type="submit">Subir</button>
          </form>
        </div>

        <table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #2c3e50; color: white;">
              <th style="padding: 12px; text-align: left;">Cliente</th>
              <th style="padding: 12px; text-align: left;">Destino</th>
              <th style="padding: 12px; text-align: left;">Peso</th>
              <th style="padding: 12px; text-align: left;">Estado</th>
              <th style="padding: 12px; text-align: left;">Acción / Asignación</th>
            </tr>
          </thead>
          <tbody>${filasHtml}</tbody>
        </table>
      </div>
    `);
  } catch (error) { res.send("Error: " + error.message); }
});

// 4. Nueva Ruta para procesar la asignación (El "Salto" a Tráfico)
app.post('/asignar/:id', async (req, res) => {
  const { placa, conductor } = req.body;
  await Carga.update(
    { estado: 'EN TRANSITO', placa: `${

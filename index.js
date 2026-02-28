const express = require('express'), { Sequelize, DataTypes, Op } = require('sequelize'), app = express();
app.use(express.urlencoded({ extended: true })); app.use(express.json());
const db = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } });

// ... (El modelo C y la constante opts se mantienen iguales) ...

const getNow = () => new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', hour12: false });

app.get('/', async (req, res) => {
  try {
    const d = await C.findAll({ order: [['id', 'DESC']] });
    let rows = '';
    // ... (Lógica de fechas y estilos se mantiene igual) ...

    for (let c of d) {
      // ... (Lógica de selectEstado y accionFin se mantiene igual) ...
      
      rows += `<tr>
        <td><b>${c.id}</b></td>
        <td style="display:flex;align-items:center;justify-content:center;gap:10px;height:45px">
          <a href="/d/${c.id}" style="color:#f87171;text-decoration:none;font-weight:bold;font-size:9px" onclick="return confirm('¿Eliminar este registro?')">BORRAR</a>
          
          <input type="checkbox" class="row-check" value="${c.id}" onclick="toggleDelBtn()" style="width:18px;height:18px;cursor:pointer">
        </td>
      </tr>`;
    }

    res.send(`<html><head><meta charset="UTF-8"><title>LOGISV20</title>${css}</head><body>
      <h2 style="color:#3b82f6">SISTEMA DE CONTROL LOGÍSTICO V20</h2>
      
      <div style="display:flex;gap:15px;margin-bottom:15px;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:10px">
          <input type="text" id="busq" onkeyup="buscar()" placeholder="🔍 Filtrar...">
          <button class="btn-xls" onclick="exportExcel()">📥 EXCEL</button>
          
          <button id="btnDelMult" class="btn-del-mult" onclick="eliminarSeleccionados()">🗑️ ELIMINAR SELECCIONADOS (<span id="count">0</span>)</button>
        </div>
        
        <div style="background:#2563eb;padding:8px 15px;border-radius:6px;display:flex;align-items:center;gap:10px">
          <label style="font-size:11px;font-weight:bold;color:#fff">MARCAR TODOS</label>
          <input type="checkbox" id="checkAll" onclick="selectAll(this)">
        </div>
      </div>

      <script>
      function selectAll(source){ 
        const checkboxes = document.getElementsByClassName('row-check'); 
        for(let i=0; i<checkboxes.length; i++) {
          // Solo marcar si la fila es visible (por si hay filtro de búsqueda)
          if(checkboxes[i].closest('tr').style.display !== 'none') {
            checkboxes[i].checked = source.checked;
          }
        }
        toggleDelBtn(); 
      }

      function toggleDelBtn(){ 
        const checked = document.querySelectorAll('.row-check:checked');
        const btn = document.getElementById('btnDelMult');
        document.getElementById('count').innerText = checked.length;
        // Si hay seleccionados, mostramos el botón de ELIMINAR SELECCIONADOS arriba
        btn.style.display = checked.length > 0 ? 'inline-block' : 'none'; 
      }

      function eliminarSeleccionados(){ 
        const checked = document.querySelectorAll('.row-check:checked');
        const ids = Array.from(checked).map(cb => cb.value);
        
        if(!confirm('¿Eliminar definitivamente ' + ids.length + ' registros?')) return; 

        // IMPORTANTE: Enviar los IDs al backend
        fetch('/delete-multiple', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ ids: ids })
        })
        .then(res => {
          if(res.ok) window.location.reload();
          else alert("Error al eliminar masivamente");
        });
      }
      // ... (Resto de funciones: buscar, exportar, etc) ...
      </script></body></html>`);
  } catch (e) { res.send(e.message); }
});

// RUTAS DE BACKEND
app.post('/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    // Sequelize permite pasar un array directamente al operador Op.in
    await C.destroy({ 
      where: { 
        id: { [Op.in]: ids } 
      } 
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Eliminar individual (el link rojo)
app.get('/d/:id', async (req, res) => { 
  await C.destroy({ where: { id: req.params.id } }); 
  res.redirect('/'); 
});

// ... (Resto de rutas) ...
db.sync({ alter: true }).then(() => app.listen(process.env.PORT || 3000));

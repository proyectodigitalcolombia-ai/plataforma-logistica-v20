import React, { useState } from 'react';

const PanelServicios = () => {
  // Estado inicial con tus servicios
  const [servicios, setServicios] = useState([
    { id: 'srv-01', nombre: 'Servicio de Autenticación', seleccionado: false },
    { id: 'srv-02', nombre: 'Servicio de Pagos', seleccionado: false },
  ]);

  // --- LÓGICA DE SELECCIÓN ---

  // Manejar el checkbox "Seleccionar Todo"
  const handleToggleAll = (e) => {
    const isChecked = e.target.checked;
    const nuevoEstado = servicios.map(s => ({ ...s, seleccionado: isChecked }));
    setServicios(nuevoEstado);
  };

  // Manejar un checkbox individual
  const handleToggleOne = (id) => {
    const nuevoEstado = servicios.map(s => 
      s.id === id ? { ...s, seleccionado: !s.seleccionado } : s
    );
    setServicios(nuevoEstado);
  };

  // --- LÓGICA DE ELIMINACIÓN ---

  const eliminarSeleccionados = async () => {
    const seleccionados = servicios.filter(s => s.seleccionado);
    const idsAEliminar = seleccionados.map(s => s.id);

    if (idsAEliminar.length === 0) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar ${idsAEliminar.length} servicio(s)?`
    );

    if (confirmacion) {
      try {
        // En Node 20/React usaríamos fetch para avisar al servidor:
        /* await fetch('/api/servicios/bulk-delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: idsAEliminar })
        });
        */
        
        // Actualizamos el estado local (quitamos los eliminados)
        const restantes = servicios.filter(s => !s.seleccionado);
        setServicios(restantes);
        
        alert("Eliminación completada con éxito.");
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // Cálculos para la UI
  const numSeleccionados = servicios.filter(s => s.seleccionado).length;
  const todosMarcados = servicios.length > 0 && servicios.every(s => s.seleccionado);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestión de Servicios (Node v20)</h2>

      {/* Barra de Acciones Masivas */}
      <div style={styles.actionBar}>
        <label style={styles.checkboxLabel}>
          <input 
            type="checkbox" 
            checked={todosMarcados} 
            onChange={handleToggleAll} 
          />
          <span style={{ marginLeft: '10px' }}>Seleccionar todo</span>
        </label>

        {numSeleccionados > 0 && (
          <button onClick={eliminarSeleccionados} style={styles.deleteBtn}>
            Eliminar seleccionados ({numSeleccionados})
          </button>
        )}
      </div>

      {/* Lista de Servicios */}
      <div style={styles.list}>
        {servicios.length > 0 ? (
          servicios.map(servicio => (
            <div 
              key={servicio.id} 
              style={{
                ...styles.item,
                backgroundColor: servicio.seleccionado ? '#f0f7ff' : '#fff'
              }}
            >
              <input 
                type="checkbox" 
                checked={servicio.seleccionado} 
                onChange={() => handleToggleOne(servicio.id)} 
              />
              <div style={styles.itemInfo}>
                <span style={styles.itemName}>{servicio.nombre}</span>
                <code style={styles.itemCode}>ID: {servicio.id}</code>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.empty}>No quedan servicios activos.</p>
        )}
      </div>
    </div>
  );
};

// Estilos rápidos para que se vea bien
const styles = {
  container: { padding: '20px', maxWidth: '500px', margin: 'auto', fontFamily: 'sans-serif' },
  title: { borderBottom: '2px solid #eee', paddingBottom: '10px' },
  actionBar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '8px'
  },
  deleteBtn: { 
    backgroundColor: '#ff4d4f', 
    color: 'white', 
    border: 'none', 
    padding: '8px 15px', 
    borderRadius: '5px', 
    cursor: 'pointer' 
  },
  list: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' },
  item: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px', 
    borderBottom: '1px solid #eee',
    transition: 'background 0.2s'
  },
  itemInfo: { marginLeft: '15px', display: 'flex', flexDirection: 'column' },
  itemName: { fontWeight: 'bold' },
  itemCode: { fontSize: '12px', color: '#888' },
  empty: { textAlign: 'center', color: '#999', padding: '20px' }
};

export default PanelServicios;

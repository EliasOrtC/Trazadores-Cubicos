import React, { useRef, useEffect, useState } from 'react';

export default function TecladoCientifico({ 
  mostrarTeclado, 
  tecladoPos, 
  insertarEnFuncion, 
  limpiarFuncion, 
  manejarBlur, 
  manejarFocus 
}) {
  const tecladoRef = useRef(null);
  const [blurDeshabilitado, setBlurDeshabilitado] = useState(false);

  // Función para manejar clics en botones del teclado
  const manejarClicBoton = (texto) => {
    // Deshabilitar blur temporalmente
    setBlurDeshabilitado(true);
    
    if (insertarEnFuncion) {
      insertarEnFuncion(texto);
    }
    
    // Rehabilitar blur después de un breve delay
    setTimeout(() => {
      setBlurDeshabilitado(false);
    }, 100);
  };

  // Función para manejar el mouseDown en botones
  const manejarMouseDownBoton = (e) => {
    // Deshabilitar blur temporalmente
    setBlurDeshabilitado(true);
    e.preventDefault();
    e.stopPropagation();
  };

  // Función para manejar el mouseUp en botones
  const manejarMouseUpBoton = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Función para manejar blur del teclado
  const manejarBlurTeclado = (e) => {
    if (!blurDeshabilitado) {
      manejarBlur(e);
    }
  };

  return (
    <div 
      data-teclado="true"
      ref={tecladoRef}
      tabIndex={-1}
      style={{ 
        position: 'fixed',
        top: `${tecladoPos.top}px`,
        left: `${tecladoPos.left}px`,
        width: '285px',
        border: '1px solid #ccc', 
        borderTop: 'none',
        padding: '1em', 
        borderRadius: '0 0 8px 8px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxHeight: '250px',
        overflowY: 'auto',
        transition: 'all 0.3s ease',
        opacity: mostrarTeclado ? 1 : 0,
        transform: mostrarTeclado ? 'translateY(0)' : 'translateY(-20px)',
        pointerEvents: mostrarTeclado ? 'auto' : 'none',
        transformOrigin: 'top',
      }}
      onBlur={manejarBlurTeclado}
      onFocus={manejarFocus}
      onMouseDown={(e) => {
        // Prevenir que el teclado pierda el foco al hacer clic
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        // Prevenir que el evento se propague
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5em' }}>
        <h4 style={{ margin: 0, textAlign: 'center', flex: 1 }}>Teclado científico</h4>
      </div>
      
      {/* Variables y operadores básicos */}
      <div style={{ marginBottom: '0.5em', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3em' }}>
        <button type="button" onClick={() => manejarClicBoton('x ')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>x</button>
        <button type="button" onClick={() => manejarClicBoton(' + ')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>+</button>
        <button type="button" onClick={() => manejarClicBoton('- ')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>-</button>
        <button type="button" onClick={() => manejarClicBoton('* ')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>×</button>
        <button type="button" onClick={() => manejarClicBoton('/ ( ')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>÷</button>
        <button type="button" onClick={() => manejarClicBoton(' (')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>(</button>
        <button type="button" onClick={() => manejarClicBoton(') ')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>)</button>
      </div>
      
      {/* Potencias */}
      <div style={{ marginBottom: '0.5em', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3em' }}>
        <button type="button" onClick={() => manejarClicBoton('^2')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>x²</button>
        <button type="button" onClick={() => manejarClicBoton('^3')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>x³</button>
        <button type="button" onClick={() => manejarClicBoton('ʸ')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>xʸ</button>
      </div>
      
      {/* Funciones trigonométricas */}
      <div style={{ marginBottom: '0.5em', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3em' }}>
        <button type="button" onClick={() => manejarClicBoton('sin(x)')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9em' }}>sin(x)</button>
        <button type="button" onClick={() => manejarClicBoton('cos(x)')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9em' }}>cos(x)</button>
        <button type="button" onClick={() => manejarClicBoton('tan(x)')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9em' }}>tan(x)</button>
      </div>
      
      {/* Funciones logarítmicas y exponenciales */}
      <div style={{ marginBottom: '0.5em', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.3em' }}>
        <button type="button" onClick={() => manejarClicBoton('log(x)')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9em' }}>log(x)</button>
        <button type="button" onClick={() => manejarClicBoton('ln(x)')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9em' }}>ln(x)</button>
        <button type="button" onClick={() => manejarClicBoton('e^x')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9em' }}>eˣ</button>
        <button type="button" onClick={() => manejarClicBoton('√x')} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9em' }}>√x</button>
      </div>
      
      {/* Controles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3em' }}>
        <button type="button" onClick={() => {
          setBlurDeshabilitado(true);
          if (limpiarFuncion) {
            limpiarFuncion();
          }
          setTimeout(() => {
            setBlurDeshabilitado(false);
          }, 100);
        }} onMouseDown={manejarMouseDownBoton} onMouseUp={manejarMouseUpBoton} style={{ padding: '0.5em', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Limpiar</button>
      </div>
    </div>
  );
} 
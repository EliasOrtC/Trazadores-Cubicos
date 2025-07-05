import React, { useRef } from 'react';
import TecladoCientifico from './TecladoCientifico';
import { funcionVisual } from '../utils/formateadoresMatematicos';

// Función para convertir potencias personalizadas escritas directamente
const convertirPotenciasPersonalizadas = (texto) => {
  return texto.replace(/([a-zA-Z0-9]+)\^\(([^)]+)\)/g, (match, base, exponente) => {
    // Convertir el exponente a superíndices
    const superindice = exponente
      .replace(/0/g, '⁰')
      .replace(/1/g, '¹')
      .replace(/2/g, '²')
      .replace(/3/g, '³')
      .replace(/4/g, '⁴')
      .replace(/5/g, '⁵')
      .replace(/6/g, '⁶')
      .replace(/7/g, '⁷')
      .replace(/8/g, '⁸')
      .replace(/9/g, '⁹')
      .replace(/\+/g, '⁺')
      .replace(/-/g, '⁻')
      .replace(/\*/g, '·')
      .replace(/\//g, '⁄')
      .replace(/x/g, 'ˣ')
      .replace(/y/g, 'ʸ')
      .replace(/z/g, 'ᶻ')
      .replace(/a/g, 'ᵃ')
      .replace(/b/g, 'ᵇ')
      .replace(/c/g, 'ᶜ')
      .replace(/d/g, 'ᵈ')
      .replace(/e/g, 'ᵉ')
      .replace(/f/g, 'ᶠ')
      .replace(/g/g, 'ᵍ')
      .replace(/h/g, 'ʰ')
      .replace(/i/g, 'ⁱ')
      .replace(/j/g, 'ʲ')
      .replace(/k/g, 'ᵏ')
      .replace(/l/g, 'ˡ')
      .replace(/m/g, 'ᵐ')
      .replace(/n/g, 'ⁿ')
      .replace(/o/g, 'ᵒ')
      .replace(/p/g, 'ᵖ')
      .replace(/q/g, 'ᵠ')
      .replace(/r/g, 'ʳ')
      .replace(/s/g, 'ˢ')
      .replace(/t/g, 'ᵗ')
      .replace(/u/g, 'ᵘ')
      .replace(/v/g, 'ᵛ')
      .replace(/w/g, 'ʷ')
      .replace(/\(/g, '⁽')
      .replace(/\)/g, '⁾');
    return `${base}${superindice}`;
  });
};

export default function EntradaFuncion({
  modoEntrada,
  funcion,
  manejarCambioInput,
  manejarFocus,
  manejarBlur,
  mostrarTeclado,
  tecladoPos,
  insertarEnFuncion,
  limpiarFuncion,
  inputRef,
  setMostrarTeclado
}) {
  if (modoEntrada !== "funcion") return null;

  // Funciones específicas para el teclado
  const manejarFocusTeclado = () => {
    // Mantener el teclado visible cuando se hace foco en él
    setMostrarTeclado(true);
  };

  const manejarBlurTeclado = (e) => {
    // Prevenir que el teclado se oculte inmediatamente
    // Solo ocultar después de un delay más largo
    setTimeout(() => {
      const elementoActivo = document.activeElement;
      const tecladoElement = e.currentTarget;
      const inputElement = inputRef.current;
      
      // Verificar si el elemento activo está dentro del teclado o es el input
      const estaEnTeclado = tecladoElement && (
        tecladoElement === elementoActivo || 
        tecladoElement.contains(elementoActivo) ||
        elementoActivo.closest('[data-teclado="true"]')
      );
      const estaEnInput = inputElement && inputElement === elementoActivo;
      
      if (estaEnTeclado || estaEnInput) {
        // Si el foco está en el teclado o en el input, no ocultar
        return;
      }
      setMostrarTeclado(false);
    }, 300); // Aumentar significativamente el timeout
  };

  return (
    <div style={{ marginTop: '1em' }}>
      <div style={{ marginBottom: '1em', position: 'relative' }}>
        <label>
          Función f(x) = 
          <input
            type="text"
            value={convertirPotenciasPersonalizadas(funcionVisual(funcion))}
            onChange={manejarCambioInput}
            onFocus={manejarFocus}
            onBlur={manejarBlur}
            placeholder="Ej: x² + 2*x + 1 o x^(15x+12x)"
            style={{ marginLeft: '0.5em', width: '300px', padding: '0.5em', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px' }}
            ref={inputRef}
            id="funcion-input"
            name="funcion"
          />
        </label>
      
        <TecladoCientifico 
          mostrarTeclado={mostrarTeclado}
          tecladoPos={tecladoPos}
          insertarEnFuncion={insertarEnFuncion}
          limpiarFuncion={limpiarFuncion}
          manejarBlur={manejarBlurTeclado}
          manejarFocus={manejarFocusTeclado}
        />
      </div>
    </div>
  );
} 
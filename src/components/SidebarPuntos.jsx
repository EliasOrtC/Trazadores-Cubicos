import React, { useState } from 'react';
import MathJax from 'react-mathjax';
import { parse, simplify, derivative } from 'mathjs';
import { convertirPotenciasASuperindices, formatearValor } from '../utils/formateadoresMatematicos';

function jsToLatex(funcion) {
  let latex = funcion;
  // Primero, convierte potencias ** dentro de paréntesis
  latex = latex.replace(/\*\*([0-9]+)/g, '^{ $1 }');
  // Luego, convierte (numerador)/(denominador) en fracción LaTeX y elimina paréntesis externos
  latex = latex.replace(/\(([^\)]+)\)\s*\/\s*\(([^\)]+)\)/g, (match, num, den) => `\\frac{${num}}{${den}}`);
  // Multiplicación: * => \cdot (solo si no es parte de una potencia)
  latex = latex.replace(/([a-zA-Z0-9_\)])\*([a-zA-Z0-9_\(])/g, '$1 \\cdot $2');
  // Espacios para operadores + y -
  latex = latex.replace(/\+/g, ' + ');
  latex = latex.replace(/-/g, ' - ');
  return latex;
}

export default function SidebarPuntos({ puntos, polinomiosSj, visible, onClose, onOpen, funcion, modoEntrada, tipoFrontera }) {
  const [abierto, setAbierto] = useState(visible);

  // Si el control de visibilidad viene de fuera, sincronizar
  React.useEffect(() => {
    setAbierto(visible);
  }, [visible]);

  // Obtener LaTeX de la función y su derivada simbólica
  let funcionLatex = '';
  let derivadaLatex = '';
  let derivadaEvaluada = [];
  
  if (modoEntrada === 'funcion' && funcion && funcion.trim()) {
    try {
      const expr = parse(funcion);
      funcionLatex = expr.toTex();
      if (tipoFrontera === 'sujeta') {
        const deriv = simplify(derivative(expr, 'x'));
        derivadaLatex = deriv.toTex();
        // Calcular valores de la derivada evaluada en cada punto
        derivadaEvaluada = puntos.map(p => {
          let val = null;
          try {
            val = deriv.evaluate({ x: parseFloat(p.x) });
          } catch {
            val = 'NaN';
          }
          return { x: p.x, y: val };
        });
      }
    } catch (e) {
      funcionLatex = 'Error al analizar la función';
      derivadaLatex = '';
    }
  }

  return (
    <>
      {/* Pestaña para mostrar el sidebar cuando está oculto */}
      {!abierto && (
        <div
          style={{
            position: 'fixed',
            top: '40%',
            right: 0,
            zIndex: 2000,
            background: '#1976d2',
            color: '#fff',
            borderRadius: '8px 0 0 8px',
            padding: '1em 0.7em',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0002',
            fontWeight: 'bold',
            fontSize: '1.2em',
            transition: 'right 0.3s',
          }}
          onClick={() => { setAbierto(true); if (onOpen) onOpen(); }}
        >
          <b>{'<'}</b>
        </div>
      )}
      {/* Sidebar fijo */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: abierto ? 0 : '-350px',
          width: 350,
          height: '100vh',
          background: '#f8f8ff',
          boxShadow: abierto ? '-4px 0 16px #0002' : 'none',
          zIndex: 2100,
          transition: 'right 0.3s',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Botón para ocultar */}
        <div style={{ textAlign: 'right', padding: '0.5em 1em 0.5em 0', background: '#1976d2', color: '#fff', borderRadius: '0 0 0 12px' }}>
          <button
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.3em', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => { setAbierto(false); if (onClose) onClose(); }}
            title="Ocultar info"
          >
            ×
          </button>
        </div>
        <div style={{ padding: '1.5em 1.2em', overflowY: 'auto', flex: 1 }}>
          {/* Mostrar función y derivada simbólica si corresponde */}
          {modoEntrada === "funcion" && funcion && (
            <div style={{ marginBottom: '1.5em', background:'#e6e6e6', borderRadius:'1em', padding:'1.2em', boxShadow:'0 2px 12px #0001', fontFamily:'Times New Roman', border:'1px solid #0001' }}>
              <h3 style={{fontSize:'1.1em'}}>Función original{tipoFrontera === 'sujeta' ? ' y derivada simbólica' : ''}</h3>
              <MathJax.Provider>
                <div style={{fontSize:'1.15em', marginBottom:'0.5em'}}>
                  <span>F(x) = </span>
                  <MathJax.Node inline formula={funcionLatex} />
                </div>
                {tipoFrontera === 'sujeta' && derivadaLatex && (
                  <div style={{fontSize:'1.15em', marginBottom:'0.5em'}}>
                    <span>F'(x) = </span>
                    <MathJax.Node inline formula={derivadaLatex} />
                  </div>
                )}
              </MathJax.Provider>
            </div>
          )}
          <h3 style={{marginTop:0}}>Tabla de puntos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '1.1em', marginBottom: '2em' }}>
            <thead>
              <tr style={{ background: '#e3e3f7' }}>
                <th style={{ border: '1px solid #bbb', padding: '6px' }}>x</th>
                <th style={{ border: '1px solid #bbb', padding: '6px' }}>y</th>
              </tr>
            </thead>
            <tbody>
              {puntos && puntos.map((p, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #bbb', padding: '6px', textAlign: 'center' }}>{p.x}</td>
                  <td style={{ border: '1px solid #bbb', padding: '6px', textAlign: 'center' }}>{p.y}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Nueva tabla de valores de f'(x) */}
          {tipoFrontera === 'sujeta' && derivadaEvaluada.length > 0 && (
            <>
              <h3 style={{marginTop:0}}>Valores de f'(x)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '1.1em', marginBottom: '2em' }}>
                <thead>
                  <tr style={{ background: '#e3e3f7' }}>
                    <th style={{ border: '1px solid #bbb', padding: '6px' }}>x</th>
                    <th style={{ border: '1px solid #bbb', padding: '6px' }}>y'(x)</th>
                  </tr>
                </thead>
                <tbody>
                  {derivadaEvaluada.map((p, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #bbb', padding: '6px', textAlign: 'center' }}>
                        {typeof p.x === 'number' ? p.x.toFixed(4) : p.x}
                      </td>
                      <td style={{ border: '1px solid #bbb', padding: '6px', textAlign: 'center' }}>
                        {typeof p.y === 'number' ? p.y.toFixed(6) : p.y}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          
          <h3>Polinomios S<sub>j</sub> (Paso 1)</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>
            {polinomiosSj && polinomiosSj.length > 0 ? (
              polinomiosSj.map((sj, idx) => (
                <div key={idx} style={{ marginBottom: '0.7em' }}>{convertirPotenciasASuperindices(sj)}</div>
              ))
            ) : (
              <div>No hay polinomios.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 
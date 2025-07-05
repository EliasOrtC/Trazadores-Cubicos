import React from 'react';

export default function TablaPuntos({ 
  puntos, 
  setPuntos, 
  modoEntrada, 
  actualizarPunto 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginBottom: '0.5em' }}>
        <h3 style={{ margin: 0 }}>Puntos (x, y)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
          <button
            type="button"
            onClick={() => setPuntos(p => p.length > 2 ? p.slice(0, -1) : p)}
            style={{
              width: '2em', 
              height: '2em', 
              fontSize: '1.2em', 
              borderRadius: '50%', 
              border: '1px solid #ccc', 
              background: '#fff', 
              cursor: puntos.length > 2 ? 'pointer' : 'not-allowed', 
              color: puntos.length > 2 ? '#333' : '#aaa', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: 0
            }}
            disabled={puntos.length <= 2}
          >
            -
          </button>
          <span style={{ minWidth: '2em', textAlign: 'center', fontWeight: 'bold' }}>
            {puntos.length}
          </span>
          <button
            type="button"
            onClick={() => setPuntos(p => [...p, { x: '', y: '' }])}
            style={{
              width: '2em', 
              height: '2em', 
              fontSize: '1.2em', 
              borderRadius: '50%', 
              border: '1px solid #ccc', 
              background: '#fff', 
              cursor: 'pointer', 
              color: '#333', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: 0
            }}
          >
            +
          </button>
        </div>
      </div>
      <table style={{ borderCollapse: 'collapse', margin: '0 auto', minWidth: '220px', background: 'rgba(255,255,255,0.85)', borderRadius: '0.7em', boxShadow: '0 2px 12px rgba(0,0,0,0.07)'}}>
        <thead style={{display: 'flow', justifyContent: 'space-around', width:'195%'}}>
        <tr style={{display: 'flex', justifyContent: 'space-around'}}>
          <th
            style={{
              textAlign: 'center',
              padding: '0.5em 1.2em',
              fontSize: '1.2em',
              fontWeight: '600',
              color: '#222', // o un color oscuro que contraste
              letterSpacing: '0.05em',
            }}
          >
            x
          </th>
          <th
            style={{
              textAlign: 'center',
              padding: '0.5em 1.2em',
              fontSize: '1.2em',
              fontWeight: '600',
              color: '#222',
              letterSpacing: '0.05em',
            }}
          >
            y
          </th>
        </tr>
        </thead>
        <tbody style={{padding:'2em 0'}}>
          {puntos.map((p, i) => (
            <tr key={i}>
              <td style={{ padding: '0.2em 0.7em' }}>
                <input
                  type="number"
                  step="any"
                  value={p.x}
                  onChange={e => actualizarPunto(i, "x", e.target.value)}
                  required
                  id={`punto-x-${i}`}
                  name={`punto-x-${i}`}
                  style={{ width: '4.5em', textAlign: 'center', fontSize: '1.1em', borderRadius: '0.4em', border: '1px solid #bbb', background: '#fff' }}
                />
              </td>
              <td style={{ padding: '0.2em 0.7em' }}>
                <input
                  type="number"
                  step="any"
                  value={p.y}
                  onChange={e => actualizarPunto(i, "y", e.target.value)}
                  required
                  disabled={modoEntrada === "funcion"}
                  id={`punto-y-${i}`}
                  name={`punto-y-${i}`}
                  style={{ width: '4.5em', textAlign: 'center', fontSize: '1.1em', borderRadius: '0.4em', border: '1px solid #bbb', background: '#fff' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
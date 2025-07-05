import React, { useState, useEffect } from 'react';
import { 
  convertirPotenciasASuperindices, 
  formatearValor, 
  convertirSubindices,
  formatearCoeficiente
} from '../utils/formateadoresMatematicos';
import MathJax from 'react-mathjax';
import { 
  construirMatrizAModificada, 
  construirVectorBModificado, 
  invertirMatriz, 
  calcularVectorSolucion 
} from '../utils/CalculosTrazadores';
import { parse, derivative, simplify } from 'mathjs';

// Función para construir la matriz A real según las ecuaciones de trazadores cúbicos
function construirMatrizA(puntos, fronteraLibre = true) {
  // Verificar que puntos existe y tiene elementos
  if (!puntos || !Array.isArray(puntos) || puntos.length === 0) {
    return { matrizA: [], encabezados: [] };
  }
  
  const puntosOrdenados = puntos
    .map((p, i) => ({ ...p, x: parseFloat(p.x), y: parseFloat(p.y), idx: i }))
    .sort((a, b) => a.x - b.x);
  const n = puntosOrdenados.length;
  
  // Verificar que tenemos al menos 2 puntos
  if (n < 2) {
    return { matrizA: [], encabezados: [] };
  }
  
  const polinomios = n - 1;
  
  // Generar encabezados dinámicamente
  let encabezados = [];
  for (let j = 0; j < polinomios; j++) encabezados.push(`b${j}`);
  for (let j = 0; j < polinomios; j++) { 
    if (fronteraLibre && j === 0) continue; 
    encabezados.push(`c${j}`); 
  }
  for (let j = 0; j < polinomios; j++) encabezados.push(`d${j}`);
  
  const numIncognitas = encabezados.length;
  const matrizA = Array.from({length: numIncognitas}, () => Array.from({length: numIncognitas}, () => 0));
  
  let filaActual = 0;
  
  // Paso 2 (Imágenes) - ecuación del último punto
  if (n > 1) {
    const j = n - 1;
    const Xj = puntosOrdenados[j].x;
    const Xj_1 = puntosOrdenados[j-1].x;
    const dx = +(Xj - Xj_1).toFixed(4);
    const dx2 = +(Math.pow(Xj - Xj_1, 2)).toFixed(4);
    const dx3 = +(Math.pow(Xj - Xj_1, 3)).toFixed(4);
    
    // Encontrar índices de las columnas
    const idxB = encabezados.indexOf(`b${j-1}`);
    const idxC = encabezados.indexOf(`c${j-1}`);
    const idxD = encabezados.indexOf(`d${j-1}`);
    
    if (idxB >= 0) matrizA[filaActual][idxB] = parseFloat(dx);
    if (idxC >= 0) matrizA[filaActual][idxC] = parseFloat(dx2);
    if (idxD >= 0) matrizA[filaActual][idxD] = parseFloat(dx3);
    filaActual++;
  }
  
  // Paso 3 (Continuidad)
  for (let j = 0; j < n - 2; j++) {
    const Xj = puntosOrdenados[j].x;
    const Xj_1 = puntosOrdenados[j+1].x;
    const dx = +(Xj_1 - Xj).toFixed(4);
    const dx2 = +(Math.pow(Xj_1 - Xj, 2)).toFixed(4);
    const dx3 = +(Math.pow(Xj_1 - Xj, 3)).toFixed(4);
    
    const idxB = encabezados.indexOf(`b${j}`);
    const idxC = encabezados.indexOf(`c${j}`);
    const idxD = encabezados.indexOf(`d${j}`);
    
    if (idxB >= 0) matrizA[filaActual][idxB] = parseFloat(dx);
    if (idxC >= 0) matrizA[filaActual][idxC] = parseFloat(dx2);
    if (idxD >= 0) matrizA[filaActual][idxD] = parseFloat(dx3);
    filaActual++;
  }
  
  // Paso 4 (Primera Derivada)
  for (let j = 0; j < n - 2; j++) {
    const Xj = puntosOrdenados[j].x;
    const Xj_1 = puntosOrdenados[j+1].x;
    const dx = +(Xj_1 - Xj).toFixed(4);
    
    const idxB = encabezados.indexOf(`b${j}`);
    const idxC = encabezados.indexOf(`c${j}`);
    const idxD = encabezados.indexOf(`d${j}`);
    const idxBNext = encabezados.indexOf(`b${j+1}`);
    
    if (idxB >= 0) matrizA[filaActual][idxB] = 1;
    if (idxC >= 0) matrizA[filaActual][idxC] = 2 * dx;
    if (idxD >= 0) matrizA[filaActual][idxD] = 3 * Math.pow(dx, 2);
    if (idxBNext >= 0) matrizA[filaActual][idxBNext] = -1;
    filaActual++;
  }
  
  // Paso 5 (Segunda Derivada)
  for (let j = 0; j < n - 2; j++) {
    const Xj = puntosOrdenados[j].x;
    const Xj_1 = puntosOrdenados[j+1].x;
    const dx = +(Xj_1 - Xj);
    
    const idxC = encabezados.indexOf(`c${j}`);
    const idxD = encabezados.indexOf(`d${j}`);
    const idxCNext = encabezados.indexOf(`c${j+1}`);
    
    if (idxC >= 0) matrizA[filaActual][idxC] = 2;
    if (idxD >= 0) matrizA[filaActual][idxD] = 6 * dx;
    if (idxCNext >= 0) matrizA[filaActual][idxCNext] = -2;
    filaActual++;
  }
  
  // Frontera natural final
  const jFinal = n - 2;
  const dxFinal = +(puntosOrdenados[n-1].x - puntosOrdenados[jFinal].x);
  const idxCFinal = encabezados.indexOf(`c${jFinal}`);
  const idxDFinal = encabezados.indexOf(`d${jFinal}`);
  
  if (idxCFinal >= 0) matrizA[filaActual][idxCFinal] = 2;
  if (idxDFinal >= 0) matrizA[filaActual][idxDFinal] = 6 * dxFinal;
  
  return { matrizA, encabezados };
}



// Función para resaltar coeficientes según el tipo de frontera
function resaltarCoeficiente(linea, tipoFrontera) {
  const esFronteraSujeta = tipoFrontera === 'sujeta';
  const coeficiente = esFronteraSujeta ? 'b₀|b0' : 'c₀|c0';
  const color = esFronteraSujeta ? 'green' : 'red';
  const colorBorde = esFronteraSujeta ? '#2e7d32' : '#d32f2f';
  const colorFondo = esFronteraSujeta ? '#f0f8f0' : '#fff0f0';
  
  // Recuadro para coeficiente+variable = valor (frontera sujeta) o = 0 (frontera libre)
  const regexCuadro = esFronteraSujeta 
    ? new RegExp(`([+-]?\\d*\\.?\\d*)?(${coeficiente})\\s*=\\s*[^\\s]+`, 'g')
    : new RegExp(`([+-]?\\d*\\.?\\d*)?(${coeficiente})\\s*=\\s*0`, 'g');
  const partesCuadro = [];
  let lastIndexCuadro = 0;
  let matchCuadro;
  while ((matchCuadro = regexCuadro.exec(linea)) !== null) {
    if (matchCuadro.index > lastIndexCuadro) {
      partesCuadro.push(linea.slice(lastIndexCuadro, matchCuadro.index));
    }
    partesCuadro.push(
      <span
        key={'cuadro-' + matchCuadro.index}
        style={{
          color: color,
          fontWeight: 'bold',
          border: `2px solid ${colorBorde}`,
          borderRadius: '6px',
          background: colorFondo,
          padding: '2px 8px',
          margin: '0 4px',
          display: 'inline-block',
          fontSize: '1.2em'
        }}
      >
        {matchCuadro[0]}
      </span>
    );
    lastIndexCuadro = regexCuadro.lastIndex;
  }
  if (lastIndexCuadro < linea.length) {
    partesCuadro.push(linea.slice(lastIndexCuadro));
  }

  // Resalta el coeficiente con paréntesis anidados y superíndices
  return partesCuadro.flatMap((fragment, i) => {
    if (typeof fragment !== 'string') return fragment;
    const partes = [];
    let lastIndex = 0;
    let idx = 0;
    while (idx < fragment.length) {
      // Busca el coeficiente correspondiente
      const regexCoeficiente = new RegExp(`([+-]?\\d*\\.?\\d*)?(${coeficiente})`);
      const match = fragment.slice(idx).match(regexCoeficiente);
      if (!match) {
        partes.push(fragment.slice(idx));
        break;
      }
      const start = idx + match.index;
      if (start > lastIndex) {
        partes.push(fragment.slice(lastIndex, start));
      }
      let end = start + match[0].length;
      // Si hay paréntesis, busca el cierre correspondiente (anidado)
      if (fragment[end] === '(') {
        let parCount = 1;
        let j = end + 1;
        while (j < fragment.length && parCount > 0) {
          if (fragment[j] === '(') parCount++;
          else if (fragment[j] === ')') parCount--;
          j++;
        }
        end = j;
      }
      // Si hay superíndice después
      const superMatch = fragment.slice(end).match(/(\^\d+|[\u00B2\u00B3\u2070-\u2079])/);
      if (superMatch && superMatch.index === 0) {
        end += superMatch[0].length;
      }
      partes.push(
        <span key={i + '-' + start} style={{ color: color, fontWeight: 'bold' }}>
          {fragment.slice(start, end)}
        </span>
      );
      idx = end;
      lastIndex = end;
    }
    return partes;
  });
}

export default function VisualizacionResultados({ 
  resultado, 
  generarPlanteamiento, 
  puntos,
  tipoFrontera,
  funcion
}) {
  if (!resultado) return null;

  // Verificar que puntos existe y tiene elementos
  if (!puntos || !Array.isArray(puntos) || puntos.length === 0) {
    return (
      <div style={{background:'rgba(255, 255, 255, 0.92)', borderRadius:'1.2em', boxShadow:'0 4px 32px rgba(0,0,0,0.10)', padding:'2.5em 2em', margin:'2em 0'}}>
        <h2>Error</h2>
        <p>No se han proporcionado puntos válidos para calcular los trazadores cúbicos.</p>
      </div>
    );
  }

  // --- Variables principales definidas una sola vez ---
  const puntosOrdenados = puntos
    .map((p, i) => ({ ...p, x: parseFloat(p.x), y: parseFloat(p.y), idx: i }))
    .sort((a, b) => a.x - b.x);
  const n = puntosOrdenados.length;
  
  // Verificar que tenemos al menos 2 puntos
  if (n < 2) {
    return (
      <div style={{background:'rgba(255, 255, 255, 0.92)', borderRadius:'1.2em', boxShadow:'0 4px 32px rgba(0,0,0,0.10)', padding:'2.5em 2em', margin:'2em 0'}}>
        <h2>Error</h2>
        <p>Se necesitan al menos 2 puntos para calcular trazadores cúbicos.</p>
      </div>
    );
  }
  
  const X0 = puntosOrdenados[0].x;
  const Xn = puntosOrdenados[n-1].x;
  const jFinal = n - 2;

  // --- Derivada y tabla para TODOS los casos (no solo frontera sujeta) ---
  let derivadaLatex = '';
  let derivadaEvaluada = [];
  let funcionLatex = '';
  let valorDerivadaX0 = null;
  let valorDerivadaXn = null;
  
  // Calcular función y derivada siempre que haya función y puntos
  if (funcion && funcion.trim() && puntos && puntos.length > 0) {
    try {
      // Derivada simbólica
      const expr = parse(funcion);
      const deriv = simplify(derivative(expr, 'x'));
      derivadaLatex = deriv.toTex();
      funcionLatex = expr.toTex();
      // Evaluar en cada x
      derivadaEvaluada = puntos.map(p => {
        let val = null;
        try {
          val = deriv.evaluate({ x: parseFloat(p.x) });
        } catch {
          val = 'NaN';
        }
        return { x: p.x, y: val };
      });
      // Calcular valores de derivada en X0 y Xn
      valorDerivadaX0 = deriv.evaluate({ x: X0 });
      valorDerivadaXn = deriv.evaluate({ x: Xn });
      console.log('valorDerivadaX0:', valorDerivadaX0, 'valorDerivadaXn:', valorDerivadaXn, 'derivadaEvaluada:', derivadaEvaluada);
    } catch (e) {
      derivadaLatex = 'Error al derivar';
    }
  }

  // MathJS para visualización de función y derivada (siempre se calcula)
  let funcionLatexMathjs = '';
  let derivadaLatexMathjs = '';
  try {
    if (funcion && funcion.trim()) {
      const expr = parse(funcion);
      funcionLatexMathjs = expr.toTex();
      const deriv = derivative(expr, 'x');
      derivadaLatexMathjs = deriv.toTex();
    }
  } catch (e) {
    funcionLatexMathjs = '';
    derivadaLatexMathjs = '';
  }

  return (
    <div style={{background:'rgba(255, 255, 255, 0.92)', borderRadius:'1.2em', boxShadow:'0 4px 32px rgba(0,0,0,0.10)', padding:'2.5em 2em', margin:'2em 0'}}>
      {/* <h2>{generarPlanteamiento()?.titulo}</h2>
      <pre style={{ 
        backgroundColor: '#f8f8ff', 
        padding: '1em', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '1.5em'
      }}>
        {convertirSubindices(convertirPotenciasASuperindices(generarPlanteamiento()?.contenido))}
      </pre> */}

      {/* Paso 1: Definir S(X) */}
      <h2>{generarPlanteamiento()?.titulo}</h2>
      <pre style={{ background: '#f8f8ff', padding: '1em', borderRadius: '5px', marginBottom: '1em', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '1.3em' }}>
        {(() => {
          const numTrazadores = n - 1;
          
          let out = [];
          out.push(convertirSubindices(convertirPotenciasASuperindices((`S(X) en [X₀, X${n-1}] = [${formatearValor(X0)}, ${formatearValor(Xn)}]`))));
          out.push("");
          
          for (let j = 0; j < numTrazadores; j++) {
            const xj = puntosOrdenados[j].x;
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j} = a${j} + b${j}(x - ${formatearValor(xj)}) + c${j}(x - ${formatearValor(xj)})^2 + d${j}(x - ${formatearValor(xj)})^3`)));
          }
          
          return out.map((line, idx) =>
            <React.Fragment key={idx}>{resaltarCoeficiente(line, tipoFrontera)}<br /></React.Fragment>
          );
        })()}
      </pre>

      {/* Paso 2: Imágenes S(Xj) = F(Xj) */}
      <h2>Paso 2: Imágenes S(Xⱼ) = F(Xⱼ)</h2>
      <pre style={{ background: '#f8f8ff', padding: '1em', borderRadius: '5px', marginBottom: '1em', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '1.3em' }}>
        {(() => {
          let out = [];
          out.push("");
          out.push(convertirSubindices(`S(Xⱼ) = F(Xⱼ) para j=0,1,...,${n-1}`));
          out.push("");
          for (let j = 0; j < n - 1; j++) {
            const Xj = puntosOrdenados[j].x;
            const Yj = formatearValor(puntosOrdenados[j].y);
            out.push(convertirSubindices(`j = ${j}`));
            out.push(convertirSubindices(`S${j}(X${j}) = F(X${j})`));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}(X${j}) = a${j} + b${j}(X${j} - ${formatearValor(Xj)}) + c${j}(X${j} - ${formatearValor(Xj)})^2 + d${j}(X${j} - ${formatearValor(Xj)})^3`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`       = a${j} + b${j}(${formatearValor(Xj)} - ${formatearValor(Xj)}) + c${j}(${formatearValor(Xj)} - ${formatearValor(Xj)})^2 + d${j}(${formatearValor(Xj)} - ${formatearValor(Xj)})^3`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`       = a${j} + b${j}(0) + c${j}(0)^2 + d${j}(0)^3`)));
            out.push(convertirSubindices(`S${j}(X${j}) = a${j}`));
            out.push(convertirSubindices(`S${j}(X${j}) = F(X${j}) = ${(Yj)}`));
            out.push(convertirSubindices(`\nentonces a${j} = ${Yj}`));
            out.push("");
          }
          if (n > 1) {
            const j = n - 1;
            const Xj = formatearValor(puntosOrdenados[j].x);
            const Yj = formatearValor(puntosOrdenados[j].y);
            const Xj_1 = formatearValor(puntosOrdenados[j-1].x);
            const Yj_1 = formatearValor(puntosOrdenados[j-1].y);
            const dx = +(Xj - Xj_1);
            const dx2 = +(Math.pow(Xj - Xj_1, 2));
            const dx3 = +(Math.pow(Xj - Xj_1, 3));
            out.push(convertirSubindices(`j = ${j}`));
            out.push(convertirSubindices(`S${j-1}(X${j}) = F(X${j})`));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j-1}(X${j}) = a${j-1} + b${j-1}(X${j} - ${formatearValor(Xj_1)}) + c${j-1}(X${j} - ${formatearValor(Xj_1)})^2 + d${j-1}(X${j} - ${formatearValor(Xj_1)})^3`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`       = a${j-1} + b${j-1}(${formatearValor(Xj)} - ${formatearValor(Xj_1)}) + c${j-1}(${formatearValor(Xj)} - ${formatearValor(Xj_1)})^2 + d${j-1}(${formatearValor(Xj)} - ${formatearValor(Xj_1)})^3`)));
            out.push(convertirSubindices(`       = a${j-1} + b${j-1}(${formatearValor(dx)}) + c${j-1}(${formatearValor(dx2)}) + d${j-1}(${formatearValor(dx3)})`));
            out.push(convertirSubindices(`S${j-1}(X${j}) = F(X${j}) = ${Yj}`));
            out.push('');
            out.push(convertirSubindices(`\nTenemos que a${j-1} = ${Yj_1} entonces,`));
            out.push('');
            out.push(convertirSubindices(`\n${Yj_1} + b${j-1}(${formatearValor(dx)}) + c${j-1}(${formatearValor(dx2)}) + d${j-1}(${formatearValor(dx3)}) = ${Yj}`));
            out.push(convertirSubindices(`b${j-1}(${formatearValor(dx)}) + c${j-1}(${formatearValor(dx2)}) + d${j-1}(${formatearValor(dx3)}) = ${Yj} - ${Yj_1}`));
            out.push(`__AZUL__${convertirSubindices(`\nb${j-1}(${formatearValor(dx)}) + c${j-1}(${formatearValor(dx2)}) + d${j-1}(${formatearValor(dx3)}) = ${formatearValor(Yj - Yj_1)}`)}`);
            out.push("");
          }
          return out.map((line, idx) =>
            line.startsWith('j =')
              ? <b key={idx} style={{ fontSize: '1.2em', color: '#000' }}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></b>
              : line.startsWith('__AZUL__')
                ? <b key={idx} style={{ fontSize: '1.3em', color: '#00579E' }}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></b>
                : <React.Fragment key={idx}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></React.Fragment>
          );
        })()}
      </pre>

      {/* Paso 3: Continuidad */}
      <h2>Paso 3: Continuidad</h2>
      <pre style={{ background: '#f8f8ff', padding: '1em', borderRadius: '5px', marginBottom: '1em', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '1.3em' }}>
        {(() => {
          let out = [];
          for (let j = 0; j < n - 2; j++) {
            out.push(convertirSubindices(`j = ${j}`));
            out.push("");
            out.push(convertirSubindices("Tenemos que Sⱼ(Xⱼ₊₁) = Sⱼ₊₁(Xⱼ₊₁) entonces,"));
            out.push("");
            out.push(convertirSubindices(`S${j}(X${j+1}) = S${j+1}(X${j+1})`));
            const Xj = (puntosOrdenados[j].x);
            const Xj_1 = (puntosOrdenados[j+1].x);
            const Yj_1 = (puntosOrdenados[j+1].y);
            const Yj = (puntosOrdenados[j].y);
            const dx = +(Xj_1 - Xj);
            const dx2 = +(Math.pow(Xj_1 - Xj, 2));
            const dx3 = +(Math.pow(Xj_1 - Xj, 3));
            out.push(convertirSubindices(`S${j}(${(Xj_1)}) = S${j+1}(${(Xj_1)}) = ${formatearValor(Yj_1)}`));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}(${(Xj_1)}) = a${j} + b${j}(${formatearValor(Xj_1)}-${formatearValor(Xj)}) + c${j}(${formatearValor(Xj_1)}-${formatearValor(Xj)})^2 + d${j}(${formatearValor(Xj_1)}-${formatearValor(Xj)})^3`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}(${(Xj_1)}) = a${j} + b${j}(${formatearValor(dx)}) + c${j}(${formatearValor(dx2)}) + d${j}(${formatearValor(dx3)})`)));
            out.push("");
            out.push(convertirSubindices(`a${j} = ${formatearValor(Yj)} `));
            out.push("");
            out.push(convertirSubindices(`${formatearValor(Yj)} + b${j}(${formatearValor(dx)}) + c${j}(${formatearValor(dx2)}) + d${j}(${formatearValor(dx3)}) = ${formatearValor(Yj_1)}`));
            out.push(convertirSubindices(`b${j}(${formatearValor(dx)}) + c${j}(${formatearValor(dx2)}) + d${j}(${formatearValor(dx3)}) = ${formatearValor(Yj_1)} - ${formatearValor(Yj)}`));
            out.push(`__AZUL__${convertirSubindices(`\nb${j}(${formatearValor(dx)}) + c${j}(${formatearValor(dx2)}) + d${j}(${formatearValor(dx3)}) = ${formatearValor(Yj_1 - Yj)}`)}`);
            out.push("");
          }
          return out.map((line, idx) =>
            line.startsWith('j =')
              ? <b key={idx} style={{ fontSize: '1.2em', color: '#000' }}>{resaltarCoeficiente(line, tipoFrontera)}<br /></b>
              : line.startsWith('__AZUL__')
                ? <b key={idx} style={{ fontSize: '1.3em', color: '#00579E' }}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></b>
              : <React.Fragment key={idx}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></React.Fragment>
          );
        })()}
      </pre>

      {/* Paso 4: Primera Derivada */}
      <h2>Paso 4: Primera Derivada</h2>
      <pre style={{ background: '#f8f8ff', padding: '1em', borderRadius: '5px', marginBottom: '1em', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '1.3em' }}>
        {(() => {
          let out = [];
            // Explicación general al principio
            out.push(convertirSubindices("Sⱼ'(Xⱼ₊₁) = Sⱼ₊₁'(Xⱼ₊₁) para cada j=0,1,2,...,n-2"));
            out.push("");
            out.push(convertirSubindices("S'(X):"));
            for (let j = 0; j < n - 1; j++) {
              let xref = puntosOrdenados[j].x < 0 ? `X+${formatearValor(puntosOrdenados[j].x)}` : `X-${formatearValor(puntosOrdenados[j].x)}`;
              out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}'(X) = b${j} + 2c${j}(${xref}) + 3d${j}(${xref})^2 ; [${formatearValor(puntosOrdenados[j].x)} ≤ x ${j < n-2 ? '<' : '≤'} ${formatearValor(puntosOrdenados[j+1].x)};]`)));
            }
            out.push("");
          for (let j = 0; j < n - 2; j++) {
            out.push(convertirSubindices(`j = ${j}`));
            out.push("");
            out.push(convertirSubindices("Tenemos que Sⱼ'(Xⱼ₊₁) = Sⱼ₊₁'(Xⱼ₊₁) entonces,"));
            out.push("");
            out.push(convertirSubindices(`S${j}'(X${j+1}) = S${j+1}'(X${j+1})`));
            const Xj = puntosOrdenados[j].x.toFixed(4);
            const Xj_1 = puntosOrdenados[j+1].x.toFixed(4);
            const dx = +(Xj_1 - Xj).toFixed(4);
            const dx2 = +(Math.pow(Xj_1 - Xj, 2)).toFixed(4);
            const dx3 = +(Math.pow(Xj_1 - Xj, 3)).toFixed(4);
            // S_j'(X_{j+1})
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}'(${formatearValor(Xj_1)}) = b${j} + 2c${j}(${formatearValor(Xj_1)} - ${formatearValor(Xj)}) + 3d${j}(${formatearValor(Xj_1)} - ${formatearValor(Xj)})^2`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}'(${formatearValor(Xj_1)}) = b${j} + 2c${j}(${formatearValor(dx)}) + 3d${j}(${formatearValor(dx)})^2`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}'(${formatearValor(Xj_1)}) = b${j} + c${j}(${2*dx}) + d${j}(${3*Math.pow(dx,2).toFixed(4)})`)));
            out.push("");
            // S_{j+1}'(X_{j+1})
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j+1}'(${formatearValor(Xj_1)}) = b${j+1} + 2c${j+1}(${formatearValor(Xj_1)} - ${formatearValor(Xj_1)}) + 3d${j+1}(${formatearValor(Xj_1)} - ${formatearValor(Xj_1)})^2`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j+1}'(${formatearValor(Xj_1)}) = b${j+1} + 2c${j+1}(0) + 3d${j+1}(0)`)));
            out.push(convertirSubindices(`S${j+1}'(${formatearValor(Xj_1)}) = b${j+1}`));
            out.push("");
            out.push(convertirSubindices(`Si S${j}'(${formatearValor(Xj_1)}) es igual a S${j+1}'(${formatearValor(Xj_1)}) entonces,`));
            out.push("");
            out.push(convertirSubindices(`S${j}'(${formatearValor(Xj_1)}) = S${j+1}'(${formatearValor(Xj_1)})`));
            out.push(convertirSubindices(`b${j} + c${j}(${2*dx}) + d${j}(${3*Math.pow(dx,2).toFixed(4)}) = b${j+1}`));
            out.push(`__AZUL__${convertirSubindices(`\nb${j} + c${j}(${2*dx}) + d${j}(${3*Math.pow(dx,2).toFixed(4)}) - b${j+1} = 0`)}`);
            out.push("");
          }
                    return out.map((line, idx) =>
            line.startsWith('j =')
              ? <b key={idx} style={{ fontSize: '1.2em', color: '#000' }}>{resaltarCoeficiente(line, tipoFrontera)}<br /></b>
              : line.startsWith('__AZUL__')
                ? <b key={idx} style={{ fontSize: '1.3em', color: '#00579E' }}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></b>
                : <React.Fragment key={idx}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></React.Fragment>
          );
        })()}
      </pre>

      {/* Paso 5: Segunda Derivada */}
      <h2>Paso 5: Segunda Derivada</h2>
      <pre style={{ background: '#f8f8ff', padding: '1em', borderRadius: '5px', marginBottom: '1em', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '1.3em' }}>
        {(() => {
          const puntosOrdenados = puntos
            .map((p, i) => ({ ...p, x: parseFloat(p.x), y: parseFloat(p.y), idx: i }))
            .sort((a, b) => a.x - b.x);
          const n = puntosOrdenados.length;
          if (n < 2) return "Se necesitan al menos 2 puntos para calcular la segunda derivada.";
          let out = [];
          // Explicación general al principio
          out.push(convertirSubindices("Sⱼ''(Xⱼ₊₁) = Sⱼ₊₁''(Xⱼ₊₁) para cada j=0,1,2,...,n-2"));
          out.push("");
          out.push(convertirSubindices("S''(X):"));
          for (let j = 0; j < n - 1; j++) {
            let xref = puntosOrdenados[j].x < 0 ? `X+${formatearValor(puntosOrdenados[j].x)}` : `X-${formatearValor(puntosOrdenados[j].x)}`;
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}''(X) = 2c${j} + 6d${j}(${xref}) ; [${formatearValor(puntosOrdenados[j].x)} ≤ x ${j < n-2 ? '<' : '≤'} ${formatearValor(puntosOrdenados[j+1].x)};]`)));
          }
          out.push("");
          out.push("");
            // Desarrollo para cada j = 0, ..., n-2
            for (let j = 0; j < n - 2; j++) {
            out.push(convertirSubindices(`j = ${j}`));
            out.push("");
            out.push(convertirSubindices("Tenemos que Sⱼ''(Xⱼ₊₁) = Sⱼ₊₁''(Xⱼ₊₁) entonces,"));
            out.push("");
            out.push(convertirSubindices(`S${j}''(X${j+1}) = S${j+1}''(X${j+1})`));
            const Xj = puntosOrdenados[j].x;
            const Xj_1 = puntosOrdenados[j+1].x;
            // S_j''(X_{j+1})
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}''(${formatearValor(Xj_1)}) = 2c${j} + 6d${j}(${formatearValor(Xj_1)} - ${formatearValor(Xj)})`)));
            const dx = +(Xj_1 - Xj).toFixed(4);
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}''(${formatearValor(Xj_1)}) = 2c${j} + 6d${j}(${dx})`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j}''(${formatearValor(Xj_1)}) = 2c${j} + d${j}(${formatearValor(6*dx)})`)));
            out.push("");
            // S_{j+1}''(X_{j+1})
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j+1}''(${formatearValor(Xj_1)}) = 2c${j+1} + 6d${j+1}(${formatearValor(Xj_1)} - ${formatearValor(Xj_1)})`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${j+1}''(${formatearValor(Xj_1)}) = 2c${j+1} + 6d${j+1}(${formatearValor(Xj_1) -formatearValor(Xj_1)})`)));
            out.push(convertirSubindices(`        = 2c${j+1}`));
            out.push("");
            out.push(convertirSubindices(`Si S${j}''(${formatearValor(Xj_1)}) es igual a S${j+1}''(${formatearValor(Xj_1)}) entonces,`));
            out.push("");
            out.push(convertirSubindices(`S${j}''(${formatearValor(Xj_1)}) = S${j+1}''(${formatearValor(Xj_1)})`));
            out.push(convertirSubindices(`2c${j} + d${j}(${formatearValor(6*dx)}) = 2c${j+1}`));
            out.push(`__AZUL__${convertirSubindices(`\n2c${j} + d${j}(${formatearValor(6*dx)}) - 2c${j+1} = 0`)}`);
            out.push("");
            }
          // Paso 5: Condiciones de frontera
          if (tipoFrontera === 'sujeta') {
            // --- BLOQUE ESPECIAL FRONTERA SUJETA ---
            out.push(convertirSubindices("Condiciones de frontera Sujeta [S'(X₀) = F'(X₀) y S'(Xₙ) = F'(Xₙ)]:"));
            // Mostrar función y derivada (ya renderizadas arriba)
            // Tabla de x/y' (ya renderizada arriba)
            // Desarrollo algebraico de las ecuaciones de frontera sujeta
            // Primer punto
            const dxFinal = +(Xn - puntosOrdenados[jFinal].x);
            // S0'(X0) = b0 + 2c0(X0-X0) + 3d0(X0-X0) = F'(X0)
            out.push('');
            out.push(convertirSubindices(`S₀'(X₀) = F'(X₀)`));
            out.push(convertirSubindices(`S₀'(${formatearValor(X0)}) = F'(${formatearValor(X0)})`));
            out.push(convertirSubindices(`       = b₀ + 2c₀(X₀-${formatearValor(X0)}) + 3d₀(X₀-${formatearValor(X0)}) = F'(${formatearValor(X0)})`));
            out.push(convertirSubindices(`       = b₀ + 2c₀(${formatearValor(X0)}-${formatearValor(X0)}) + 3d₀(${formatearValor(X0)}-${formatearValor(X0)}) = F'(${formatearValor(X0)})`));
            out.push(convertirSubindices(`       = b₀ + 2c₀(0) + 3d₀(0) = ${valorDerivadaX0 !== null ? formatearValor(valorDerivadaX0) : '?'}`));
            out.push('');
            out.push(convertirSubindices(`b₀ = ${valorDerivadaX0 !== null ? formatearValor(valorDerivadaX0) : '?'}`));
            out.push('');
            // Sj'(Xn) = bj + 2cj(Xn-Xj) + 3dj(Xn-Xj) = F'(Xn)
            out.push(convertirSubindices(convertirPotenciasASuperindices((`S${jFinal}'(Xₙ) = F'(Xₙ)`))));
            out.push(convertirSubindices(convertirPotenciasASuperindices((`S${jFinal}'(Xₙ) = b${jFinal} + 2c${jFinal}(Xₙ-${formatearValor(puntosOrdenados[jFinal].x)}) + 3d${jFinal}(Xₙ-${formatearValor(puntosOrdenados[jFinal].x)})^2 = F'(Xₙ)`))));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${jFinal}'(${formatearValor(Xn)}) = b${jFinal} + 2c${jFinal}(${formatearValor(Xn)}-${formatearValor(puntosOrdenados[jFinal].x)}) + 3d${jFinal}(${formatearValor(Xn)}-${formatearValor(puntosOrdenados[jFinal].x)})^2 = F'(${formatearValor(Xn)})`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`        = b${jFinal} + 2c${jFinal}(${formatearValor(dxFinal)}) + 3d${jFinal}(${formatearValor(dxFinal)})^2 = ${valorDerivadaXn !== null ? formatearValor(valorDerivadaXn) : '?'}`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`        = b${jFinal} + ${2*dxFinal !== 0 ? formatearValor(2*dxFinal) + 'c' + jFinal + ' + ' : ''}${3*Math.pow(dxFinal,2) !== 0 ? formatearValor(3*Math.pow(dxFinal,2)) + 'd' + jFinal : ''} = ${valorDerivadaXn !== null ? formatearValor(valorDerivadaXn) : '?'}`)));
            out.push('');
            out.push(`__AZUL__${convertirSubindices(`b${jFinal} + ${2*dxFinal !== 0 ? formatearValor(2*dxFinal) + 'c' + jFinal + ' + ' : ''}${3*Math.pow(dxFinal,2) !== 0 ? formatearValor(3*Math.pow(dxFinal,2)) + 'd' + jFinal : ''} = ${valorDerivadaXn !== null ? formatearValor(valorDerivadaXn) : '?'}`)}`);
            out.push('');

            // Solo mostrar el bloque especial si es frontera sujeta
              out.push("__BLOQUE_ESPECIAL__");
          } else {
            // Condiciones de frontera natural
            out.push(convertirSubindices("Condiciones de frontera libre o natural [S''(X0) = S''(Xn)]:"));
            // S0''(X0) = 0
            out.push("");
            out.push(convertirSubindices(`S₀''(X₀) = 0`));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S₀''(${formatearValor(X0)}) = 2c₀ + 6d₀(${formatearValor(X0)} - ${formatearValor(X0)})`)));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S₀''(${formatearValor(X0)}) = 2c₀ + 6d₀(0)`)));
            out.push(convertirSubindices(`\n2c₀ = 0`));
            out.push(convertirSubindices(`c₀ = 0`));
            out.push("");
            // S_{n-2}''(Xn) = 0
            out.push(convertirSubindices(`S${jFinal}''(Xₙ) = 0`));
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${jFinal}''(${formatearValor(Xn)}) = 2c${jFinal} + 6d${jFinal}(${formatearValor(Xn)} - ${formatearValor(puntosOrdenados[jFinal].x)})`)));
            const dxFinal = +(Xn - puntosOrdenados[jFinal].x);
            out.push(convertirSubindices(convertirPotenciasASuperindices(`S${jFinal}''(${formatearValor(Xn)}) = 2c${jFinal} + 6d${jFinal}(${formatearValor(dxFinal)})`)));
            out.push(convertirSubindices(`2c${jFinal} + 6d${jFinal}(${formatearValor(dxFinal)}) = 0`));
            out.push(`__AZUL__${convertirSubindices(`\n2c${jFinal} + d${jFinal}(${formatearValor(6*dxFinal)}) = 0`)}`);
            out.push("");
            // No mostrar el bloque especial para frontera natural
          }
            
          /* // Si es frontera sujeta, agregar el bloque especial después del paso 5
          if (tipoFrontera === 'sujeta' && funcion && funcion.trim()) {
            out.push("");
            out.push("__BLOQUE_ESPECIAL__");
          } */
          
          return out.map((line, idx) => {
            if (line === "__BLOQUE_ESPECIAL__") {
              return (
                <React.Fragment key={idx}>
                  {/* Función original y derivada simbólica */}
                  <MathJax.Provider>
                    <div style={{position:'relative', margin:'2em 0', background:'#rgb(230, 230, 230)', borderRadius:'1em', padding:'1.5em', boxShadow:'0 2px 12px #0001', display:'flex', gap:'2.5em', alignItems:'flex-start', justifyContent:'center', fontFamily:'Times New Roman', border:'1px solid #0001'}}>
                      <div style={{flex:'2 1 0', minWidth:'320px', maxWidth:'600px'}}>
                        <h3 style={{fontSize:'1.3em'}}>Función original y derivada simbólica</h3>
                        <div style={{fontSize:'1.2em', marginBottom:'0.5em'}}>
                          <span>{'F(x) = '}</span>
                          <MathJax.Node inline formula={funcionLatexMathjs} />
                        </div>
                        <div style={{fontSize:'1.2em', marginBottom:'0.7em'}}>
                          <span>{`F'(x) = `}</span>
                          <MathJax.Node inline formula={derivadaLatexMathjs} />
                        </div>
                      </div>
                      {/* Tabla de valores de la derivada en la esquina superior derecha */}
                      <div style={{position:'static', top:'1.5em', right:'2em', minWidth:'180px', maxWidth:'260px', alignSelf:'flex-start', zIndex:2}}>
                        <table style={{margin:'0 0 0 auto', borderCollapse:'collapse', fontSize:'1.1em', width:'100%'}}>
                          <thead>
                            <tr style={{background:'#4C4C4D', color:'#fff'}}>
                              <th style={{padding:'0.5em 1.2em', border:'1px solid #878788'}}>x</th>
                              <th style={{padding:'0.5em 1.2em', border:'1px solid #878788'}}>f'(x)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {derivadaEvaluada.length > 0 ? (
                              derivadaEvaluada.map((p, i) => (
                                <tr key={i} style={{background:'#fff'}}>
                                  <td style={{textAlign:'center', padding:'0.4em 1.2em', border:'1px solid #878788'}}>{
                                    typeof p.x === 'number' ? p.x.toFixed(4) : p.x
                                  }</td>
                                  <td style={{textAlign:'center', padding:'0.4em 1.2em', border:'1px solid #878788'}}>{
                                    typeof p.y === 'number' ? p.y.toFixed(6) : p.y
                                  }</td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan={2} style={{textAlign:'center', color:'#888'}}>No hay valores de derivada disponibles.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </MathJax.Provider>
                </React.Fragment>
              );
            }
            
            return line.startsWith('j =') || line.startsWith('Condiciones')
              ? <b key={idx} style={{ fontSize: '1.2em', color: '#000' }}>{resaltarCoeficiente(line, tipoFrontera)}<br /></b>
              : line.startsWith('__AZUL__')
                ? <b key={idx} style={{ fontSize: '1.3em', color: '#00579E' }}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></b>
                : <React.Fragment key={idx}>{resaltarCoeficiente(line.replace('__AZUL__', ''), tipoFrontera)}<br /></React.Fragment>
          });
        })()}
      </pre>

      {/* Paso 6: Sistema de ecuaciones */}
      <h2>Paso 6: Sistema de ecuaciones</h2>
      <div style={{ marginBottom: '1em', display: 'flex', background: '#f8f8ff', justifyContent: 'center' }}>
        <pre style={{
          padding: '1em',
          border: '1px solid #fff',
          borderRadius: '10px',
          fontFamily: 'monospace',
          fontSize: '1.3em',
          margin: '2em',
          background: '#fff',
          boxShadow: '0px 5px 25px #121212'
        }}>
          
          {(() => {
            // Recolectar ecuaciones azules de los pasos anteriores
            const ecuacionesAzules = [];
            if (tipoFrontera === 'sujeta') {
              // Frontera sujeta - b₀ = valor y ecuación del último punto
              ecuacionesAzules.push(convertirSubindices(`b₀ = ${valorDerivadaX0 !== null ? formatearValor(valorDerivadaX0) : '?'}`));
              ecuacionesAzules.push("");
            } else {
              // Frontera natural
              ecuacionesAzules.push(convertirSubindices(`c₀ = 0`));
              ecuacionesAzules.push("");
            }
            
            // Paso 2 (Imágenes)
            (() => {
              if (n > 1) {
                const j = n - 1;
                const Xj = puntosOrdenados[j].x;
                const Yj = puntosOrdenados[j].y;
                const Xj_1 = puntosOrdenados[j-1].x;
                const Yj_1 = puntosOrdenados[j-1].y;
                const dx = +(Xj - Xj_1).toFixed(4);
                const dx2 = +(Math.pow(Xj - Xj_1, 2)).toFixed(4);
                const dx3 = +(Math.pow(Xj - Xj_1, 3)).toFixed(4);
                ecuacionesAzules.push(
                  convertirSubindices(`${formatearCoeficiente(dx, `b${j-1}`)} + ${formatearCoeficiente(dx2, `c${j-1}`)} + ${formatearCoeficiente(dx3, `d${j-1}`)} = ${formatearValor(Yj - Yj_1)}`)
                );
              }
            })();
            // Paso 3 (Continuidad)
            (() => {
              for (let j = 0; j < n - 2; j++) {
                const Xj = puntosOrdenados[j].x;
                const Xj_1 = puntosOrdenados[j+1].x;
                const Yj_1 = puntosOrdenados[j+1].y;
                const Yj = puntosOrdenados[j].y;
                const dx = +(Xj_1 - Xj).toFixed(4);
                const dx2 = +(Math.pow(Xj_1 - Xj, 2)).toFixed(4);
                const dx3 = +(Math.pow(Xj_1 - Xj, 3)).toFixed(4);
                ecuacionesAzules.push(
                  convertirSubindices(`${formatearCoeficiente(dx, `b${j}`)} + ${formatearCoeficiente(dx2, `c${j}`)} + ${formatearCoeficiente(dx3, `d${j}`)} = ${formatearValor(Yj_1 - Yj)}`)
                );
              }
            })();
            // Paso 4 (Primera Derivada)
            (() => {
              for (let j = 0; j < n - 2; j++) {
                const Xj = puntosOrdenados[j].x;
                const Xj_1 = puntosOrdenados[j+1].x;
                const dx = +(Xj_1 - Xj).toFixed(4);
                const dx2 = +(Math.pow(Xj_1 - Xj, 2)).toFixed(4);
                const dx3 = +(Math.pow(Xj_1 - Xj, 3)).toFixed(4);
                ecuacionesAzules.push(
                  convertirSubindices(`${formatearCoeficiente(1, `b${j}`)} + ${formatearCoeficiente(2*dx, `c${j}`)} + ${formatearCoeficiente(3*Math.pow(dx,2), `d${j}`)} - b${j+1} = 0`)
                );
              }
            })();
            // Paso 5 (Segunda Derivada)
            (() => {
              for (let j = 0; j < n - 2; j++) {
                const Xj = puntosOrdenados[j].x;
                const Xj_1 = puntosOrdenados[j+1].x;
                const dx = +(Xj_1 - Xj);
                ecuacionesAzules.push(
                  convertirSubindices(`${formatearCoeficiente(2, `c${j}`)} + ${formatearCoeficiente(6*dx, `d${j}`)} - 2c${j+1} = 0`)
                );
              }
              // Solo agregar ecuación de frontera natural si no es frontera sujeta
              if (tipoFrontera !== 'sujeta') {
                const dxFinal = +(puntosOrdenados[n-1].x - puntosOrdenados[jFinal].x);
                ecuacionesAzules.push(convertirSubindices(`${formatearCoeficiente(2, `c${jFinal}`)} + ${formatearCoeficiente(6*dxFinal, `d${jFinal}`)} = 0`));
              }
            })();

            // Paso 6 (Frontera)
            // Frontera según el tipo
            if (tipoFrontera === 'sujeta') {
              // Ecuación del último punto para frontera sujeta
              const dxFinal = +(Xn - puntosOrdenados[jFinal].x);
              ecuacionesAzules.push(convertirSubindices(`b${jFinal} + ${2*dxFinal !== 0 ? formatearValor(2*dxFinal) + 'c' + jFinal + ' + ' : ''}${3*Math.pow(dxFinal,2) !== 0 ? formatearValor(3*Math.pow(dxFinal,2)) + 'd' + jFinal : ''} = ${valorDerivadaXn !== null ? formatearValor(valorDerivadaXn) : '?'}`));
            }
            return ecuacionesAzules.map((line, idx) =>
              <b key={idx} style={{ color: '#1976d2', fontSize: '1.3em' }}>{resaltarCoeficiente(line, tipoFrontera)}<br /></b>
            );
          })()}
          
        </pre>

        {tipoFrontera === 'sujeta' && (
          <pre style={{
            padding: '1em',
            border: '1px solid #fff',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '1.3em',
            margin: '2em',
            background: '#fff',
            boxShadow: '0px 5px 25px #121212'
          }}>
            
            {(() => {
              // Recolectar ecuaciones azules de los pasos anteriores
              const ecuacionesAzules = [];
              if (tipoFrontera === 'sujeta') {
                // Frontera sujeta - b₀ = valor y ecuación del último punto
                ecuacionesAzules.push(convertirSubindices(`b₀ = ${valorDerivadaX0 !== null ? formatearValor(valorDerivadaX0) : '?'}`));
                ecuacionesAzules.push("");
              } else {
                // Frontera natural
                ecuacionesAzules.push(convertirSubindices(`c₀ = 0`));
                ecuacionesAzules.push("");
              }
              
              // Paso 2 (Imágenes)
              (() => {
                if (n > 1) {
                  const j = n - 1;
                  const Xj = puntosOrdenados[j].x;
                  const Yj = puntosOrdenados[j].y;
                  const Xj_1 = puntosOrdenados[j-1].x;
                  const Yj_1 = puntosOrdenados[j-1].y;
                  const dx = +(Xj - Xj_1).toFixed(4);
                  const dx2 = +(Math.pow(Xj - Xj_1, 2)).toFixed(4);
                  const dx3 = +(Math.pow(Xj - Xj_1, 3)).toFixed(4);
                  ecuacionesAzules.push(
                    convertirSubindices(`${formatearCoeficiente(dx, `b${j-1}`)} + ${formatearCoeficiente(dx2, `c${j-1}`)} + ${formatearCoeficiente(dx3, `d${j-1}`)} = ${formatearValor(Yj - Yj_1)}`)
                  );
                }
              })();
              
              // Paso 3 (Continuidad) - con sustitución de b₀
              (() => {
                for (let j = 0; j < n - 2; j++) {
                  const Xj = puntosOrdenados[j].x;
                  const Xj_1 = puntosOrdenados[j+1].x;
                  const Yj_1 = puntosOrdenados[j+1].y;
                  const Yj = puntosOrdenados[j].y;
                  const dx = +(Xj_1 - Xj).toFixed(4);
                  const dx2 = +(Math.pow(Xj_1 - Xj, 2)).toFixed(4);
                  const dx3 = +(Math.pow(Xj_1 - Xj, 3)).toFixed(4);
                  
                  if (j === 0) {
                    // Para j=0, sustituir b₀
                    const valorB0 = valorDerivadaX0;
                    const terminoB0 = dx * valorB0;
                    const nuevoTerminoIndependiente = (Yj_1 - Yj) - terminoB0;
                    ecuacionesAzules.push(
                      convertirSubindices(`${formatearCoeficiente(dx2, `c${j}`)} + ${formatearCoeficiente(dx3, `d${j}`)} = ${formatearValor(nuevoTerminoIndependiente)}`)
                    );
                  } else {
                    ecuacionesAzules.push(
                      convertirSubindices(`${formatearCoeficiente(dx, `b${j}`)} + ${formatearCoeficiente(dx2, `c${j}`)} + ${formatearCoeficiente(dx3, `d${j}`)} = ${formatearValor(Yj_1 - Yj)}`)
                    );
                  }
                }
              })();
              
              // Paso 4 (Primera Derivada) - con sustitución de b₀
              (() => {
                for (let j = 0; j < n - 2; j++) {
                  const Xj = puntosOrdenados[j].x;
                  const Xj_1 = puntosOrdenados[j+1].x;
                  const dx = +(Xj_1 - Xj).toFixed(4);
                  const dx2 = +(Math.pow(Xj_1 - Xj, 2)).toFixed(4);
                  const dx3 = +(Math.pow(Xj_1 - Xj, 3)).toFixed(4);
                  
                  if (j === 0) {
                    // Para j=0, sustituir b₀
                    const valorB0 = valorDerivadaX0;
                    const nuevoTerminoIndependiente = -valorB0;
                    ecuacionesAzules.push(
                      convertirSubindices(`${formatearCoeficiente(2*dx, `c${j}`)} + ${formatearCoeficiente(3*Math.pow(dx,2), `d${j}`)} - b${j+1} = ${formatearValor(nuevoTerminoIndependiente)}`)
                    );
                  } else {
                    ecuacionesAzules.push(
                      convertirSubindices(`${formatearCoeficiente(1, `b${j}`)} + ${formatearCoeficiente(2*dx, `c${j}`)} + ${formatearCoeficiente(3*Math.pow(dx,2), `d${j}`)} - b${j+1} = 0`)
                    );
                  }
                }
              })();
              
              // Paso 5 (Segunda Derivada)
              (() => {
                for (let j = 0; j < n - 2; j++) {
                  const Xj = puntosOrdenados[j].x;
                  const Xj_1 = puntosOrdenados[j+1].x;
                  const dx = +(Xj_1 - Xj);
                  ecuacionesAzules.push(
                    convertirSubindices(`${formatearCoeficiente(2, `c${j}`)} + ${formatearCoeficiente(6*dx, `d${j}`)} - 2c${j+1} = 0`)
                  );
                }
              })();

              // Paso 6 (Frontera sujeta)
              (() => {
                // Ecuación del último punto para frontera sujeta
                const dxFinal = +(Xn - puntosOrdenados[jFinal].x);
                ecuacionesAzules.push(convertirSubindices(`b${jFinal} + ${2*dxFinal !== 0 ? formatearValor(2*dxFinal) + 'c' + jFinal + ' + ' : ''}${3*Math.pow(dxFinal,2) !== 0 ? formatearValor(3*Math.pow(dxFinal,2)) + 'd' + jFinal : ''} = ${valorDerivadaXn !== null ? formatearValor(valorDerivadaXn) : '?'}`));
              })();
              
              return ecuacionesAzules.map((line, idx) =>
                <b key={idx} style={{ color: '#1976d2', fontSize: '1.3em' }}>{resaltarCoeficiente(line, tipoFrontera)}<br /></b>
              );
            })()}
            
          </pre>
        )}
      </div>

      {/* Matriz A y Matriz B */}
      <div style={{ display: 'flex', gap: '4em', margin: '3em 0', background: '#f8f8ff', justifyContent: 'center' }}>
        {/* Tabla Matriz A */}
        <div style={{padding: '3em 0'}}>
          <h4 style={{fontSize: '2em' , margin: '0 0 1em 0'}}>Matriz A</h4>
          <table style={{ 
            border: '1px solid #ccc', 
            borderCollapse: 'collapse',
            fontSize: '1.5em',
            fontFamily: 'monospace',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                {(() => {
                  const { encabezados } = construirMatrizAModificada(puntos, tipoFrontera);
                  if (!encabezados || encabezados.length === 0) {
                    return <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Sin datos</th>;
                  }
                  // Ordenar encabezados: primero b, luego c, luego d
                  const ordenDeseado = (a, b) => {
                    const [letraA, numA] = [a[0], parseInt(a.slice(1))];
                    const [letraB, numB] = [b[0], parseInt(b.slice(1))];
                    if (letraA !== letraB) return 'bcd'.indexOf(letraA) - 'bcd'.indexOf(letraB);
                    return numA - numB;
                  };
                  const encabezadosOrdenados = [...encabezados].sort(ordenDeseado);
                  // Guardar para usar en el tbody
                  window._encabezadosOrdenados = encabezadosOrdenados;
                  return encabezadosOrdenados.map((enc, idx) => (
                    <th key={idx} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{convertirSubindices(enc)}</th>
                  ));
                })()}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const { matrizA, encabezados } = construirMatrizAModificada(puntos, tipoFrontera);
                if (!matrizA || matrizA.length === 0) {
                  return <tr><td style={{textAlign:'center',color:'red'}}>No hay datos</td></tr>;
                }
                // Usar el mismo orden de encabezados que en el thead
                const encabezadosOrdenados = window._encabezadosOrdenados || encabezados;
                return matrizA.map((fila, idx) => (
                  <tr key={idx}>
                    {encabezadosOrdenados.map((enc, colIdx) => (
                      <td key={colIdx} style={{ 
                        border: '1px solid #ccc', 
                        padding: '8px', 
                        textAlign: 'center',
                        backgroundColor: Number(fila[encabezados.indexOf(enc)]) !== 0 ? '#e8f5e8' : '#fff'
                      }}>
                        {formatearValor(fila[encabezados.indexOf(enc)])}
                      </td>
                    ))}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        
        {/* Tabla Matriz B */}
        <div style={{padding: '3em 0'}}>
          <h4 style={{fontSize: '2em', margin: '0 0 1em 0'}}>Matriz B</h4>
          <table style={{ 
            border: '1px solid #ccc', 
            borderCollapse: 'collapse',
            fontSize: '1.5em',
            fontFamily: 'monospace'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>B</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const vectorB = construirVectorBModificado(puntos, tipoFrontera, valorDerivadaX0, valorDerivadaXn);
                return vectorB.map((valor, idx) => (
                  <tr key={idx}>
                    <td style={{ 
                      border: '1px solid #ccc', 
                      padding: '8px', 
                      textAlign: 'center',
                      backgroundColor: Number(valor) !== 0 ? '#e8f5e8' : '#fff'
                    }}>
                      {formatearValor(valor)}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matriz Inversa de A y Matriz B (debajo) */}
      <div style={{ display: 'flex', gap: '2em', margin: '3em 0', background: '#f8f8ff', justifyContent: 'center' }}>
        {/* Matriz Inversa de A */}
        <div style={{padding: '3em 0'}}>
          <h4 style={{fontSize: '1.5em', margin: '0 0 1em 0'}}>Matriz A⁻¹</h4>
          <table style={{ 
            border: '1px solid #ccc', 
            borderCollapse: 'collapse',
            fontSize: '1.1em',
            fontFamily: 'monospace',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                {(() => {
                  const { encabezados } = construirMatrizAModificada(puntos, tipoFrontera);
                  if (!encabezados || encabezados.length === 0) {
                    return <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Sin datos</th>;
                  }
                  return encabezados.map((enc, idx) => (
                    <th key={idx} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{convertirSubindices(enc)}</th>
                  ));
                })()}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const { matrizA, encabezados } = construirMatrizAModificada(puntos, tipoFrontera);
                const numIncognitas = encabezados.length;
                
                // Chequeo para evitar errores si la matriz no es cuadrada
                if (!matrizA || matrizA.length === 0 || !matrizA[0] || matrizA.length !== matrizA[0].length) {
                  return <tr><td colSpan={numIncognitas} style={{textAlign:'center',color:'red'}}>No invertible</td></tr>;
                }
                
                const inversa = invertirMatriz(matrizA);
                if (!inversa) {
                  return <tr><td colSpan={numIncognitas} style={{textAlign:'center',color:'red'}}>No invertible</td></tr>;
                }
                
                return inversa.map((fila, i) => (
                  <tr key={i}>
                    {fila.map((valor, j) => (
                      <td key={j} style={{ 
                        border: '1px solid #ccc', 
                        padding: '8px', 
                        textAlign: 'center', 
                        backgroundColor: Number(valor) !== 0 ? '#e8f5e8' : '#fff' 
                      }}>
                        {formatearValor(valor)}
                      </td>
                    ))}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        
        {/* Matriz B */}
        <div style={{padding: '3em 0'}}>
          <h4 style={{fontSize: '1.5em', margin: '0 0 1em 0'}}>Matriz B</h4>
          <table style={{ 
            border: '1px solid #ccc', 
            borderCollapse: 'collapse',
            fontSize: '1.1em',
            fontFamily: 'monospace',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>B</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const vectorB = construirVectorBModificado(puntos, tipoFrontera, valorDerivadaX0, valorDerivadaXn);
                return vectorB.map((valor, idx) => (
                  <tr key={idx}>
                    <td style={{ 
                      border: '1px solid #ccc', 
                      padding: '8px', 
                      textAlign: 'center',
                      backgroundColor: Number(valor) !== 0 ? '#e8f5e8' : '#fff'
                    }}>
                      {formatearValor(valor)}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vector solución X = A⁻¹ · B */}
      <div style={{ margin: '2em 0', display: 'flex', justifyContent: 'center', background: '#f8f8ff', padding: '2em' }}>
        {(() => {
          const { matrizA, encabezados } = construirMatrizAModificada(puntos, tipoFrontera);
          const vectorB = construirVectorBModificado(puntos, tipoFrontera, valorDerivadaX0, valorDerivadaXn);
          
          // Verificar que tenemos una matriz válida
          if (!matrizA || matrizA.length === 0 || !encabezados || encabezados.length === 0) {
            return (
              <div style={{textAlign: 'center', padding: '2em'}}>
                <p>No se puede construir la matriz con los puntos proporcionados.</p>
              </div>
            );
          }
          
          // Calcular vector solución usando las nuevas funciones
          const vectorSolucion = calcularVectorSolucion(matrizA, vectorB);
          if (!vectorSolucion) return null;
          return (
            <div>
              <div style={{display:'flex', justifyContent:'center'}}>
              <h4 style={{fontSize: '2em'}}>Solución X = A⁻¹ * B </h4>
              </div>
              <div style={{display:'flex', justifyContent:'center'}}>
              <table style={{
                border: '1px solid #ccc',
                borderCollapse: 'collapse',
                fontSize: '1.5em',
                fontFamily: 'monospace'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    {encabezados.map((enc, idx) => (
                      <th key={idx} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{convertirSubindices(enc)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {vectorSolucion.map((valor, idx) => (
                      <td key={idx} style={{
                        border: '1px solid #ccc',
                        padding: '8px',
                        textAlign: 'center',
                        backgroundColor: Number(valor) !== 0 ? '#e8f5e8' : '#fff'
                      }}>
                        {formatearValor(valor)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              </div>
              {/* Planteamiento simbólico y valores de los polinomios S_j */}
              {(() => {
                if (!vectorSolucion.length || puntos.length < 2) return null;
                const polinomios = puntosOrdenados.length - 1;
                // a_j = y_j siempre
                const a = puntosOrdenados.map(p => p.y);
                // Extraer b, c, d del vectorSolucion según encabezados
                const { encabezados } = construirMatrizAModificada(puntos, tipoFrontera);
                if (!encabezados || encabezados.length === 0) {
                  return <div style={{textAlign: 'center', padding: '2em'}}>
                    <p>No se pueden extraer los coeficientes.</p>
                  </div>;
                }
                const b = Array(polinomios).fill(0), c = Array(polinomios).fill(0), d = Array(polinomios).fill(0);
                
                // Para frontera sujeta, b₀ ya se conoce
                if (tipoFrontera === 'sujeta') {
                  b[0] = valorDerivadaX0 || 0;
                }
                
                encabezados.forEach((enc, idx) => {
                  if (/^b(\d+)$/.test(enc)) {
                    const j = parseInt(enc.slice(1));
                    b[j] = vectorSolucion[idx];
                  }
                  if (/^c(\d+)$/.test(enc)) {
                    const j = parseInt(enc.slice(1));
                    c[j] = vectorSolucion[idx];
                  }
                  if (/^d(\d+)$/.test(enc)) {
                    const j = parseInt(enc.slice(1));
                    d[j] = vectorSolucion[idx];
                  }
                });
                
                // Planteamiento simbólico
                let out = [];
                out.push(
                  <div key="bloque-pol-cubico" style={{background:'#f8f8ff', borderRadius:'10px', padding:'0', marginBottom:'1.5em'}}>
                    <div style={{margin:'1.5em 0 0.5em 0', fontSize:'1.5em'}}><b>S(X) en [X₀, X{puntosOrdenados.length-1}] = [{formatearValor(puntosOrdenados[0].x)}, {formatearValor(puntosOrdenados[puntosOrdenados.length-1].x)}]</b></div>
                    {Array.from({length: polinomios}).map((_, j) =>
                      <div key={"simbolico-"+j} style={{fontFamily:'monospace', fontSize:'1.2em'}}>
                        S{subIndice(j)} = a{subIndice(j)} + b{subIndice(j)}(x - {formatearValor(puntosOrdenados[j].x)}) + c{subIndice(j)}(x - {formatearValor(puntosOrdenados[j].x)})² + d{subIndice(j)}(x - {formatearValor(puntosOrdenados[j].x)})³
                      </div>
                    )}
                  </div>
                );
                // Valores de coeficientes
                out.push(<div key="coef" style={{margin:'1.5em 0 0.7em 0', fontSize:'1.4em'}}><b>Valores de los coeficientes:</b></div>);
                out.push(
                  <div key="coef-block" style={{background:'#fff', borderRadius:'8px', padding:'0', marginBottom:'0.7em', fontFamily:'monospace', fontSize:'1.2em'}}>
                    {Array.from({length: polinomios}).map((_, j) => [
                      <div key={"a-"+j}>a{subIndice(j)} = {formatearValor(a[j])}</div>,
                      <div key={"b-"+j}>b{subIndice(j)} = {formatearValor(b[j])}</div>,
                      <div key={"c-"+j}>c{subIndice(j)} = {formatearValor(c[j])}</div>,
                      <div key={"d-"+j}>d{subIndice(j)} = {formatearValor(d[j])}</div>
                    ])}
                  </div>
                );
                // Polinomios con valores sustituidos
                out.push(<div key="subs" style={{margin:'1.5em 0 0.7em 0', fontSize:'1.4em'}}><b>Polinomios con valores sustituidos:</b></div>);
                for (let j = 0; j < polinomios; j++) {
                  const xj = puntosOrdenados[j].x;
                  const xj1 = puntosOrdenados[j+1].x;
                  out.push(<div key={"poly-"+j} style={{fontFamily:'monospace', fontSize:'1em', marginBottom:'0.8em'}}>
                    S{subIndice(j)}(x) = {formatearValor(a[j])} + {formatearValor(b[j])}(x - {formatearValor(xj)}) + {formatearValor(c[j])}(x - {formatearValor(xj)})² + {formatearValor(d[j])}(x - {formatearValor(xj)})³; <b>[&#123;{formatearValor(xj)} ≤ x {j < polinomios-1 ? '<' : '≤'} {formatearValor(xj1)}&#125;]</b>
                  </div>);
                }
                
                return <div style={{marginBottom:'1.5em', padding:'1.5em', fontSize:'1.2em'}}>{out}</div>;
                function subIndice(j) { return <sub>{j}</sub>; }
              })()}
            </div>
          );
        })()}
      </div>


    </div>
  );
} 



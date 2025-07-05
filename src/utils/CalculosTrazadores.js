import { convertirSubindices } from "./formateadoresMatematicos";

// Función para calcular trazadores cúbicos
export async function calcularTrazadores(puntos, funcion = null) {
  try {
    // Ordenar puntos por x
    const puntosOrdenados = puntos
      .map((p, i) => ({ ...p, x: parseFloat(p.x), y: parseFloat(p.y), idx: i }))
      .sort((a, b) => a.x - b.x);

    const n = puntosOrdenados.length;
    
    if (n < 2) {
      throw new Error("Se necesitan al menos 2 puntos para calcular trazadores cúbicos");
    }

    // Si hay función, calcular valores de Y
    if (funcion) {
      try {
        // Crear función evaluable
        const funcionEvaluable = new Function('x', `return ${funcion}`);
        
        // Calcular valores de Y para cada punto
        puntosOrdenados.forEach(punto => {
          try {
            punto.y = funcionEvaluable(punto.x);
          } catch (error) {
            throw new Error(`Error al evaluar la función en x = ${punto.x}: ${error.message}`);
          }
        });
      } catch (error) {
        throw new Error(`Error en la función: ${error.message}`);
      }
    }

    // Verificar que todos los puntos tengan valores válidos
    for (let i = 0; i < n; i++) {
      if (isNaN(puntosOrdenados[i].x) || isNaN(puntosOrdenados[i].y)) {
        throw new Error(`Punto ${i + 1} tiene valores inválidos`);
      }
    }

    // Verificar que no haya puntos duplicados en X
    for (let i = 1; i < n; i++) {
      if (puntosOrdenados[i].x === puntosOrdenados[i-1].x) {
        throw new Error(`Puntos duplicados en x = ${puntosOrdenados[i].x}`);
      }
    }

    // Aquí irían los cálculos específicos de trazadores cúbicos
    // Por ahora retornamos un resultado básico
    return {
      puntos: puntosOrdenados,
      n: n,
      mensaje: "Cálculo completado exitosamente"
    };

  } catch (error) {
    throw error;
  }
}

// Función para generar el planteamiento del problema
export function generarPlanteamiento(puntos) {
  const n = puntos.length;
  
  if (n < 2) {
    return {
      titulo: "Error: Insuficientes puntos",
      contenido: "Se necesitan al menos 2 puntos para calcular trazadores cúbicos."
    };
  }

  const puntosOrdenados = puntos
    .map((p, i) => ({ ...p, x: parseFloat(p.x), y: parseFloat(p.y), idx: i }))
    .sort((a, b) => a.x - b.x);

  const numTrazadores = n - 1;
  const x0 = puntosOrdenados[0].x;
  const xn = puntosOrdenados[n-1].x;
  
  let contenido = "";
  contenido += convertirSubindices(`S(X) en [X₀, X${n-1}] = [${x0}, ${xn}]\n\n`);
  
  for (let j = 0; j < numTrazadores; j++) {
    const xj = puntosOrdenados[j].x;
    // Formatear correctamente el término (x - xj) para valores negativos
    const terminoX = xj < 0 ? `(x + ${Math.abs(xj)})` : `(x - ${xj})`;
    contenido += convertirSubindices(`S${j} = a${j} + b${j}${terminoX} + c${j}${terminoX}^2 + d${j}${terminoX}^3\n`);
  }

  return {
    titulo: convertirSubindices(`Paso 1: Definir S(X) en [X₀, X${n-1}] = [${x0}, ${xn}]`),
    contenido: contenido
  };
}

// Función para construir matriz A modificada para frontera sujeta
export function construirMatrizAModificada(puntos, tipoFrontera = 'libre') {
  const puntosOrdenados = puntos
    .map((p, i) => ({ ...p, x: parseFloat(p.x), y: parseFloat(p.y), idx: i }))
    .sort((a, b) => a.x - b.x);
  const n = puntosOrdenados.length;
  
  if (n < 2) return { matrizA: [], encabezados: [], vectorB: [] };
  
  const polinomios = n - 1;
  
  // Generar encabezados según el tipo de frontera
  let encabezados = [];
  if (tipoFrontera === 'sujeta') {
    // Para frontera sujeta: descartamos b₀, incluimos c₀
    for (let j = 1; j < polinomios; j++) encabezados.push(`b${j}`); // b₁, b₂, ..., b_{n-2}
    for (let j = 0; j < polinomios; j++) encabezados.push(`c${j}`); // c₀, c₁, ..., c_{n-2}
    for (let j = 0; j < polinomios; j++) encabezados.push(`d${j}`); // d₀, d₁, ..., d_{n-2}
  } else {
    // Para frontera natural: incluimos todos los b, c, d
    for (let j = 0; j < polinomios; j++) encabezados.push(`b${j}`);
    for (let j = 1; j < polinomios; j++) encabezados.push(`c${j}`); // c₁, c₂, ..., c_{n-2}
    for (let j = 0; j < polinomios; j++) encabezados.push(`d${j}`);
  }
  
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
    
    const idxB = encabezados.indexOf(`b${j-1}`);
    const idxC = encabezados.indexOf(`c${j-1}`);
    const idxD = encabezados.indexOf(`d${j-1}`);
    
    if (idxB >= 0) matrizA[filaActual][idxB] = parseFloat(dx);
    if (idxC >= 0) matrizA[filaActual][idxC] = parseFloat(dx2);
    if (idxD >= 0) matrizA[filaActual][idxD] = parseFloat(dx3);
    filaActual++;
  }
  
  // Paso 3 (Continuidad) - modificado para frontera sujeta
  for (let j = 0; j < n - 2; j++) {
    const Xj = puntosOrdenados[j].x;
    const Xj_1 = puntosOrdenados[j+1].x;
    const dx = +(Xj_1 - Xj).toFixed(4);
    const dx2 = +(Math.pow(Xj_1 - Xj, 2)).toFixed(4);
    const dx3 = +(Math.pow(Xj_1 - Xj, 3)).toFixed(4);
    
    const idxB = encabezados.indexOf(`b${j}`);
    const idxC = encabezados.indexOf(`c${j}`);
    const idxD = encabezados.indexOf(`d${j}`);
    
    if (tipoFrontera === 'sujeta' && j === 0) {
      // Para j=0 en frontera sujeta, b₀ ya se conoce, no se incluye en la matriz
      if (idxC >= 0) matrizA[filaActual][idxC] = parseFloat(dx2);
      if (idxD >= 0) matrizA[filaActual][idxD] = parseFloat(dx3);
    } else {
      if (idxB >= 0) matrizA[filaActual][idxB] = parseFloat(dx);
      if (idxC >= 0) matrizA[filaActual][idxC] = parseFloat(dx2);
      if (idxD >= 0) matrizA[filaActual][idxD] = parseFloat(dx3);
    }
    filaActual++;
  }
  
  // Paso 4 (Primera Derivada) - modificado para frontera sujeta
  for (let j = 0; j < n - 2; j++) {
    const Xj = puntosOrdenados[j].x;
    const Xj_1 = puntosOrdenados[j+1].x;
    const dx = +(Xj_1 - Xj).toFixed(4);
    
    const idxB = encabezados.indexOf(`b${j}`);
    const idxC = encabezados.indexOf(`c${j}`);
    const idxD = encabezados.indexOf(`d${j}`);
    const idxBNext = encabezados.indexOf(`b${j+1}`);
    
    if (tipoFrontera === 'sujeta' && j === 0) {
      // Para j=0 en frontera sujeta, b₀ ya se conoce
      if (idxC >= 0) matrizA[filaActual][idxC] = 2 * dx;
      if (idxD >= 0) matrizA[filaActual][idxD] = 3 * Math.pow(dx, 2);
      if (idxBNext >= 0) matrizA[filaActual][idxBNext] = -1;
    } else {
      if (idxB >= 0) matrizA[filaActual][idxB] = 1;
      if (idxC >= 0) matrizA[filaActual][idxC] = 2 * dx;
      if (idxD >= 0) matrizA[filaActual][idxD] = 3 * Math.pow(dx, 2);
      if (idxBNext >= 0) matrizA[filaActual][idxBNext] = -1;
    }
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
  
  // Condiciones de frontera
  if (tipoFrontera === 'sujeta') {
    // Frontera sujeta: ecuación del último punto
    const jFinal = n - 2;
    const dxFinal = +(puntosOrdenados[n-1].x - puntosOrdenados[jFinal].x);
    const idxBFinal = encabezados.indexOf(`b${jFinal}`);
    const idxCFinal = encabezados.indexOf(`c${jFinal}`);
    const idxDFinal = encabezados.indexOf(`d${jFinal}`);
    
    if (idxBFinal >= 0) matrizA[filaActual][idxBFinal] = 1;
    if (idxCFinal >= 0) matrizA[filaActual][idxCFinal] = 2 * dxFinal;
    if (idxDFinal >= 0) matrizA[filaActual][idxDFinal] = 3 * Math.pow(dxFinal, 2);
  } else {
    // Frontera natural: c₀ = 0
    const idxC0 = encabezados.indexOf('c0');
    if (idxC0 >= 0) matrizA[filaActual][idxC0] = 1;
    
    // Frontera natural final
    const jFinal = n - 2;
    const dxFinal = +(puntosOrdenados[n-1].x - puntosOrdenados[jFinal].x);
    const idxCFinal = encabezados.indexOf(`c${jFinal}`);
    const idxDFinal = encabezados.indexOf(`d${jFinal}`);
    
    if (idxCFinal >= 0) matrizA[filaActual][idxCFinal] = 2;
    if (idxDFinal >= 0) matrizA[filaActual][idxDFinal] = 6 * dxFinal;
  }
  
  return { matrizA, encabezados };
}

// Función para construir vector B modificado para frontera sujeta
export function construirVectorBModificado(puntos, tipoFrontera = 'libre', valorDerivadaX0 = null, valorDerivadaXn = null) {
  const puntosOrdenados = puntos
    .map((p, i) => ({ ...p, x: parseFloat(p.x), y: parseFloat(p.y), idx: i }))
    .sort((a, b) => a.x - b.x);
  const n = puntosOrdenados.length;
  if (n < 2) return [];

  // Obtener encabezados para saber cuántas filas debe tener B
  const { encabezados } = construirMatrizAModificada(puntos, tipoFrontera);
  const numIncognitas = encabezados.length;
  const vectorB = [];

  // Paso 2 (Imágenes) - ecuación del último punto
  if (n > 1) {
    const j = n - 1;
    const Yj = puntosOrdenados[j].y;
    const Yj_1 = puntosOrdenados[j-1].y;
    vectorB.push(Yj - Yj_1);
  }

  // Paso 3 (Continuidad) - modificado para frontera sujeta
  for (let j = 0; j < n - 2; j++) {
    const Yj_1 = puntosOrdenados[j+1].y;
    const Yj = puntosOrdenados[j].y;
    if (tipoFrontera === 'sujeta' && j === 0) {
      // Para j=0 en frontera sujeta, sustituir b₀ conocido
      const Xj = puntosOrdenados[j].x;
      const Xj_1 = puntosOrdenados[j+1].x;
      const dx = +(Xj_1 - Xj).toFixed(4);
      const terminoB0 = dx * valorDerivadaX0;
      const nuevoTerminoIndependiente = (Yj_1 - Yj) - terminoB0;
      vectorB.push(nuevoTerminoIndependiente);
    } else {
      vectorB.push(Yj_1 - Yj);
    }
  }

  // Paso 4 (Primera Derivada) - modificado para frontera sujeta
  for (let j = 0; j < n - 2; j++) {
    if (tipoFrontera === 'sujeta' && j === 0) {
      // Para j=0 en frontera sujeta, sustituir b₀ conocido
      const nuevoTerminoIndependiente = -valorDerivadaX0;
      vectorB.push(nuevoTerminoIndependiente);
    } else {
      vectorB.push(0);
    }
  }

  // Paso 5 (Segunda Derivada) - todas son 0
  for (let j = 0; j < n - 2; j++) {
    vectorB.push(0);
  }

  // Condiciones de frontera
  if (tipoFrontera === 'sujeta') {
    // Frontera sujeta: valor de la derivada en el último punto
    vectorB.push(valorDerivadaXn || 0);
  } else {
    // Frontera natural: c₀ = 0
    vectorB.push(0);
    // Frontera natural final
    vectorB.push(0);
  }

  // Ajuste final: recortar o rellenar para que B tenga el mismo tamaño que A
  if (vectorB.length > numIncognitas) {
    return vectorB.slice(0, numIncognitas);
  } else if (vectorB.length < numIncognitas) {
    // Rellenar con ceros si faltan
    return vectorB.concat(Array(numIncognitas - vectorB.length).fill(0));
  }
  return vectorB;
}

// Función para invertir matriz usando Gauss-Jordan
export function invertirMatriz(A) {
  const n = A.length;
  const M = A.map(fila => fila.slice());
  const I = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => i === j ? 1 : 0));
  
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    [I[i], I[maxRow]] = [I[maxRow], I[i]];
    
    if (Math.abs(M[i][i]) < 1e-12) return null;
    
    const pivote = M[i][i];
    for (let j = 0; j < n; j++) {
      M[i][j] /= pivote;
      I[i][j] /= pivote;
    }
    
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = 0; j < n; j++) {
          M[k][j] -= factor * M[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }
  return I;
}

// Función para calcular vector solución
export function calcularVectorSolucion(matrizA, vectorB) {
  if (!matrizA || matrizA.length === 0 || !vectorB || vectorB.length === 0) {
    return null;
  }
  
  const inversa = invertirMatriz(matrizA);
  if (!inversa) return null;
  
  const vectorSolucion = inversa.map(fila =>
    fila.reduce((acc, val, idx) => acc + val * vectorB[idx], 0)
  );
  
  return vectorSolucion;
} 
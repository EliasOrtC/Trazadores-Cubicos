// Validaciones para puntos de entrada
export function validarPuntos(puntos) {
  const errores = [];
  
  if (puntos.length < 2) {
    errores.push("Se necesitan al menos 2 puntos para calcular trazadores cúbicos");
    return errores;
  }

  // Verificar que todos los puntos tengan valores válidos
  for (let i = 0; i < puntos.length; i++) {
    const punto = puntos[i];
    
    if (punto.x === "" || punto.y === "") {
      errores.push(`Punto ${i + 1}: Los valores X e Y no pueden estar vacíos`);
      continue;
    }
    
    const x = parseFloat(punto.x);
    const y = parseFloat(punto.y);
    
    if (isNaN(x)) {
      errores.push(`Punto ${i + 1}: El valor X (${punto.x}) no es un número válido`);
    }
    
    if (isNaN(y)) {
      errores.push(`Punto ${i + 1}: El valor Y (${punto.y}) no es un número válido`);
    }
  }

  // Verificar que no haya puntos duplicados en X
  const puntosOrdenados = puntos
    .map((p, i) => ({ ...p, x: parseFloat(p.x), y: parseFloat(p.y), idx: i }))
    .sort((a, b) => a.x - b.x);

  for (let i = 1; i < puntosOrdenados.length; i++) {
    if (puntosOrdenados[i].x === puntosOrdenados[i-1].x) {
      errores.push(`Puntos duplicados en x = ${puntosOrdenados[i].x}`);
    }
  }

  return errores;
}

// Validaciones para función matemática
export function validarFuncion(funcion) {
  const errores = [];
  
  if (!funcion || funcion.trim() === "") {
    errores.push("La función no puede estar vacía");
    return errores;
  }

  try {
    // Intentar crear una función evaluable
    const funcionEvaluable = new Function('x', `return ${funcion}`);
    
    // Probar con algunos valores
    const valoresPrueba = [-1, 0, 1, 2];
    for (const valor of valoresPrueba) {
      try {
        funcionEvaluable(valor);
      } catch (error) {
        errores.push(`Error al evaluar la función en x = ${valor}: ${error.message}`);
      }
    }
  } catch (error) {
    errores.push(`Error en la sintaxis de la función: ${error.message}`);
  }

  return errores;
}

// Validación general del formulario
export function validarFormulario(puntos, modoEntrada, funcion) {
  const errores = [];
  
  // Validar puntos
  const erroresPuntos = validarPuntos(puntos);
  errores.push(...erroresPuntos);
  
  // Si es modo función, validar también la función
  if (modoEntrada === "funcion") {
    const erroresFuncion = validarFuncion(funcion);
    errores.push(...erroresFuncion);
  }
  
  return errores;
}

// Validación de cantidad de puntos
export function validarCantidadPuntos(cantidad) {
  if (cantidad < 2) {
    return "Se necesitan al menos 2 puntos";
  }
  
  if (cantidad > 20) {
    return "Se recomienda no más de 20 puntos para evitar cálculos muy complejos";
  }
  
  return null;
} 
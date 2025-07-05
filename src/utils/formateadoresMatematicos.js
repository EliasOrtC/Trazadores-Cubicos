// Función para convertir potencias a superíndices en texto
export function convertirPotenciasASuperindices(texto) {
  return texto
    .replace(/\^1/g, '¹')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^5/g, '⁵')
    .replace(/\^6/g, '⁶')
    .replace(/\^7/g, '⁷')
    .replace(/\^8/g, '⁸')
    .replace(/\^9/g, '⁹')
    .replace(/\^0/g, '⁰')
    .replace(/\^\(([^)]+)\)/g, (match, valor) => {
      // Convertir el valor a superíndices
      const superindice = valor
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
        .replace(/\(/g, '⁽')
        .replace(/\)/g, '⁾');
      return superindice;
    });
}

// Función utilitaria para formatear valores numéricos (si es negativo, entre paréntesis)
export function formatearValor(valor) {
  // Redondea a 4 decimales y elimina ceros innecesarios
  const num = parseFloat(Number(valor).toFixed(4));
  if (num < 0) return `(${num})`;
  return num.toString();
}

// Función para convertir notación interna a visual para mostrar
export function funcionVisual(funcion) {
  return funcion
    // Primero manejar potencias personalizadas escritas directamente
    .replace(/([a-zA-Z0-9]+)\^\(([^)]+)\)/g, (match, base, exponente) => {
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
        .replace(/\(/g, '⁽')
        .replace(/\)/g, '⁾');
      return `${base}${superindice}`;
    })
    .replace(/\^1/g, '¹')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\(([^)]+)\)\^\(([^)]+)\)/g, (match, expresion, valor) => {
      // Convertir el valor a superíndices
      const superindice = valor
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
        .replace(/\(/g, '⁽')
        .replace(/\)/g, '⁾');
      return `(${expresion})${superindice}`;
    })
    .replace(/\^\(([^)]+)\)/g, (match, valor) => {
      // Convertir el valor a superíndices para x^(valor)
      const superindice = valor
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
        .replace(/\(/g, '⁽')
        .replace(/\)/g, '⁾');
      return `x${superindice}`;
    });
}

// Función para convertir notación visual a interna para cálculos
export function funcionInterna(funcion) {
  console.log("funcionInterna - entrada:", funcion);
  
  // Función auxiliar para convertir superíndices a números
  const convertirSuperindices = (superindices) => {
    return superindices
      .replace(/⁰/g, '0')
      .replace(/¹/g, '1')
      .replace(/²/g, '2')
      .replace(/³/g, '3')
      .replace(/⁴/g, '4')
      .replace(/⁵/g, '5')
      .replace(/⁶/g, '6')
      .replace(/⁷/g, '7')
      .replace(/⁸/g, '8')
      .replace(/⁹/g, '9');
  };
  
  let resultado = funcion;
  
  // Primero detectar y manejar potencias de fracciones completas (caso especial)
  const fraccionCompletaConPotencia = /\(([^)]+)\)\/([^)]+)\)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g;
  if (fraccionCompletaConPotencia.test(resultado)) {
    resultado = resultado.replace(fraccionCompletaConPotencia, (match, numerador, denominador, superindices) => {
      const potencia = convertirSuperindices(superindices);
      console.log("Detectada potencia de fracción completa:", match, "→ potencia:", potencia);
      return `Math.pow((${numerador})/(${denominador}), ${potencia})`;
    });
  }
  
  // Manejar potencias de fracciones que ya están en formato ^()
  // Solo cuando la potencia afecta a toda la fracción: (a)/(b)^(c) → Math.pow((a)/(b), c)
  const fraccionCompletaConPotenciaFormato = /\(([^)]+)\)\/([^)]+)\)\^\(([^)]+)\)/g;
  if (fraccionCompletaConPotenciaFormato.test(resultado)) {
    resultado = resultado.replace(fraccionCompletaConPotenciaFormato, (match, numerador, denominador, potencia) => {
      console.log("Detectada potencia de fracción completa en formato ^():", match, "→ potencia:", potencia);
      return `Math.pow((${numerador})/(${denominador}), ${potencia})`;
    });
  }
  
  // Manejar potencias que solo afectan al denominador: (a)/(b^(c)) → (a)/(Math.pow(b, c))
  // Solo cuando el denominador es simple (sin paréntesis)
  const denominadorSimpleConPotencia = /\(([^)]+)\)\/([^()]+)\^\(([^)]+)\)/g;
  resultado = resultado.replace(denominadorSimpleConPotencia, (match, numerador, denominador, potencia) => {
    console.log("=== DEBUG POTENCIA DENOMINADOR SIMPLE ===");
    console.log("Match completo:", match);
    console.log("Numerador:", numerador);
    console.log("Denominador:", denominador);
    console.log("Potencia:", potencia);
    console.log("Resultado:", `(${numerador})/(Math.pow(${denominador}, ${potencia}))`);
    console.log("=========================================");
    return `(${numerador})/(Math.pow(${denominador}, ${potencia}))`;
  });
  
  // Luego procesar el resto de las conversiones
  resultado = resultado
    // Convertir potencias personalizadas con superíndices de vuelta a notación interna
    .replace(/([a-zA-Z0-9]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻·⁄ˣʸ⁽⁾]+)/g, (match, base, superindices) => {
      // Convertir superíndices a notación normal
      const exponente = superindices
        .replace(/⁰/g, '0')
        .replace(/¹/g, '1')
        .replace(/²/g, '2')
        .replace(/³/g, '3')
        .replace(/⁴/g, '4')
        .replace(/⁵/g, '5')
        .replace(/⁶/g, '6')
        .replace(/⁷/g, '7')
        .replace(/⁸/g, '8')
        .replace(/⁹/g, '9')
        .replace(/⁺/g, '+')
        .replace(/⁻/g, '-')
        .replace(/·/g, '*')
        .replace(/⁄/g, '/')
        .replace(/ˣ/g, 'x')
        .replace(/ʸ/g, 'y')
        .replace(/⁽/g, '(')
        .replace(/⁾/g, ')');
      return `${base}^(${exponente})`;
    })
    // Luego manejar las potencias simples
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\(([^)]+)\)⁰/g, 'Math.pow($1, 0)')
    .replace(/\(([^)]+)\)¹/g, 'Math.pow($1, 1)')
    .replace(/\(([^)]+)\)²/g, 'Math.pow($1, 2)')
    .replace(/\(([^)]+)\)³/g, 'Math.pow($1, 3)')
    .replace(/\(([^)]+)\)⁴/g, 'Math.pow($1, 4)')
    .replace(/\(([^)]+)\)⁵/g, 'Math.pow($1, 5)')
    .replace(/\(([^)]+)\)⁶/g, 'Math.pow($1, 6)')
    .replace(/\(([^)]+)\)⁷/g, 'Math.pow($1, 7)')
    .replace(/\(([^)]+)\)⁸/g, 'Math.pow($1, 8)')
    .replace(/\(([^)]+)\)⁹/g, 'Math.pow($1, 9)')
    .replace(/\(([^)]+)\)⁺/g, 'Math.pow($1, +)')
    .replace(/\(([^)]+)\)⁻/g, 'Math.pow($1, -)')
    .replace(/\(([^)]+)\)·/g, 'Math.pow($1, *)')
    .replace(/\(([^)]+)\)⁄/g, 'Math.pow($1, /)')
    .replace(/\(([^)]+)\)ˣ/g, 'Math.pow($1, x)')
    .replace(/\(([^)]+)\)ʸ/g, 'Math.pow($1, y)')
    .replace(/\(([^)]+)\)⁽/g, 'Math.pow($1, ()')
    .replace(/\(([^)]+)\)⁾/g, 'Math.pow($1, ))');
  
  // Limpiar asteriscos erróneos en Math.pow
  resultado = resultado
    .replace(/M\*a\*t\*h\.pow/g, 'Math.pow')
    .replace(/Math\.p\*o\*w/g, 'Math.pow');
  
  console.log("funcionInterna - salida:", resultado);
  return resultado;
  // No convertir x^(valor) porque ya está en formato interno
}

// Función para convertir subíndices numéricos a formato visual
export function convertirSubindices(texto) {
  return texto
    // Convertir patrones _número a subíndices
    .replace(/_0/g, '₀')
    .replace(/_1/g, '₁')
    .replace(/_2/g, '₂')
    .replace(/_3/g, '₃')
    .replace(/_4/g, '₄')
    .replace(/_5/g, '₅')
    .replace(/_6/g, '₆')
    .replace(/_7/g, '₇')
    .replace(/_8/g, '₈')
    .replace(/_9/g, '₉')
    // Convertir números que aparecen después de letras a subíndices
    .replace(/([a-zA-Z])0/g, '$1₀')
    .replace(/([a-zA-Z])1/g, '$1₁')
    .replace(/([a-zA-Z])2/g, '$1₂')
    .replace(/([a-zA-Z])3/g, '$1₃')
    .replace(/([a-zA-Z])4/g, '$1₄')
    .replace(/([a-zA-Z])5/g, '$1₅')
    .replace(/([a-zA-Z])6/g, '$1₆')
    .replace(/([a-zA-Z])7/g, '$1₇')
    .replace(/([a-zA-Z])8/g, '$1₈')
    .replace(/([a-zA-Z])9/g, '$1₉');
}

export function formatearCoeficiente(valor, variable) {
  const num = parseFloat(Number(valor).toFixed(4));
  if (num === 1) return variable;
  if (num === -1) return `(-1)${variable}`;
  return `${formatearValor(num)}${variable}`;
} 
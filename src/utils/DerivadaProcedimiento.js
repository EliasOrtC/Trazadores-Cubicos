import { parse, derivative, simplify, create, all } from 'mathjs';
const math = create(all);

function limpiarCdot(latex) {
  // Limpieza robusta de coeficientes y residuos de \cdot
  return latex
    // Quita '1\cdot' y '-1\cdot' en cualquier contexto
    .replace(/(?:^|[^\d])1\\cdot\s*/g, '')
    .replace(/-1\\cdot\s*/g, '-')
    // Quita 'cdot' pegado a números o variables
    .replace(/\\cdot\s*([a-zA-Z0-9({\[])/g, ' \\cdot $1')
    .replace(/cdot([0-9a-zA-Z]+)/g, ' \\cdot $1')
    // Quita cualquier '1cdot', '-1cdot', 'cdot2', 'cdot1', 'cdot', etc. literal
    .replace(/1cdot/g, '')
    .replace(/-1cdot/g, '-')
    .replace(/cdot[0-9a-zA-Z]+/g, '')
    .replace(/cdot/g, '')
    // Otros residuos
    .replace(/\\r/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\+ -/g, '- ')
    .replace(/\(\s*\)/g, '') // elimina paréntesis vacíos
    .trim();
}

function limpiarErroresMathjsLatex(latex) {
  let out = latex
    // Corrige \left(2right) o \left(2\right) => \left( y \right)
    .replace(/\\left\(([0-9]+)\\right\)/g, '\\left(')
    .replace(/\\left\(([0-9]+)right\)/g, '\\left(')
    .replace(/\\left\(([0-9]+)\)/g, '\\left(')
    .replace(/([0-9]+)\\right\)/g, '\\right)')
    .replace(/([0-9]+)right\)/g, '\\right)')
    // Corrige casos de right y left pegados a números
    .replace(/([0-9]+)right/g, '\\right')
    .replace(/([0-9]+)left/g, '\\left')
    // Corrige casos sin número: left(, right)
    .replace(/([^\\])left\(/g, '$1\\left(')
    .replace(/([^\\])right\)/g, '$1\\right)')
    // Elimina dobles llaves innecesarias
    .replace(/\{\{\s*/g, '{')
    .replace(/\s*\}\}/g, '}')
    // Limpia espacios extra
    .replace(/\s+/g, ' ')
    .trim();
  return out;
}

/**
 * Analiza una expresión para determinar qué reglas de derivación aplicar
 */
function analizarExpresion(expr) {
  if (expr.isOperatorNode) {
    switch (expr.op) {
      case '+':
      case '-':
        return { tipo: 'suma', args: expr.args };
      case '*':
        return { tipo: 'producto', args: expr.args };
      case '/':
        return { tipo: 'cociente', args: expr.args };
      case '^':
        return { tipo: 'potencia', base: expr.args[0], exponente: expr.args[1] };
      default:
        return { tipo: 'otro', expr };
    }
  } else if (expr.isFunctionNode) {
    const funcName = expr.fn.name;
    if (['sin', 'cos', 'tan', 'sec', 'csc', 'cot'].includes(funcName)) {
      return { tipo: 'trigonometrica', funcion: funcName, arg: expr.args[0] };
    } else if (['exp', 'log', 'ln'].includes(funcName)) {
      return { tipo: 'exponencial', funcion: funcName, arg: expr.args[0] };
    } else if (funcName === 'sqrt') {
      return { tipo: 'raiz', arg: expr.args[0] };
    }
  } else if (expr.isSymbolNode && expr.name === 'x') {
    return { tipo: 'variable' };
  } else if (expr.isConstantNode) {
    return { tipo: 'constante', valor: expr.value };
  }
  return { tipo: 'otro', expr };
}

/**
 * Genera el procedimiento paso a paso en LaTeX para la derivada de una función.
 * @param {string} funcionStr - La función a derivar, como string.
 * @returns {Array<{tipo: 'texto'|'formula', contenido: string}>} - Array de pasos.
 */
export function generarProcedimientoDerivada(funcionStr) {
  let pasos = [];
  let expr;
  try {
    expr = parse(funcionStr);
  } catch {
    pasos.push({ tipo: 'texto', contenido: 'Error al analizar la función.' });
    return pasos;
  }

  const analisis = analizarExpresion(expr);
  
  // 1. FUNCIONES POLINÓMICAS
  if (analisis.tipo === 'suma') {
    return generarProcedimientoSuma(expr, pasos);
  } else if (analisis.tipo === 'potencia') {
    return generarProcedimientoPotencia(expr, pasos);
  } else if (analisis.tipo === 'producto') {
    return generarProcedimientoProducto(expr, pasos);
  }
  
  // 2. FUNCIONES TRIGONOMÉTRICAS
  else if (analisis.tipo === 'trigonometrica') {
    return generarProcedimientoTrigonometrica(expr, pasos);
  }
  
  // 3. FUNCIONES EXPONENCIALES Y LOGARÍTMICAS
  else if (analisis.tipo === 'exponencial') {
    return generarProcedimientoExponencial(expr, pasos);
  }
  
  // 4. REGLA DE LA CADENA (composición de funciones)
  else if (esComposicionFunciones(expr)) {
    return generarProcedimientoReglaCadena(expr, pasos);
  }
  
  // 5. COCIENTE (ya implementado)
  else if (analisis.tipo === 'cociente') {
    return generarProcedimientoCociente(expr, pasos);
  }
  
  // Caso por defecto
  pasos.push({ tipo: 'texto', contenido: 'Derivada directa:' });
  const derivada = simplify(derivative(expr, 'x'));
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(derivada.toTex()) });

  console.log('funcion:', funcionStr);
  console.log('funcionLatex:', expr.toTex());
  console.log('derivadaLatex:', derivada.toTex());

  return pasos;
}

/**
 * Genera procedimiento para suma/resta de funciones
 */
function generarProcedimientoSuma(expr, pasos) {
  pasos.push({ tipo: 'texto', contenido: 'Regla de la suma: La derivada de una suma es la suma de las derivadas.' });
  pasos.push({ tipo: 'formula', contenido: "(f + g)' = f' + g'" });
  
  const derivadas = expr.args.map(arg => {
    const deriv = simplify(derivative(arg, 'x'));
    return { original: arg.toTex(), derivada: limpiarCdot(deriv.toTex()) };
  });
  
  pasos.push({ tipo: 'texto', contenido: 'Derivamos cada término:' });
  derivadas.forEach((item, i) => {
    pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(${item.original}) = ${item.derivada}` });
  });
  
  pasos.push({ tipo: 'texto', contenido: 'Sumamos todas las derivadas:' });
  const sumaDerivadas = derivadas.map(d => d.derivada).join(' + ');
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(sumaDerivadas) });
  
  // Resultado final
  const derivadaFinal = simplify(derivative(expr, 'x'));
  pasos.push({ tipo: 'texto', contenido: 'Resultado final:' });
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(limpiarCdot(derivadaFinal.toTex())) });
  
  return pasos;
}

/**
 * Genera procedimiento para potencias
 */
function generarProcedimientoPotencia(expr, pasos) {
  const base = expr.args[0];
  const exponente = expr.args[1];
  
  // Caso especial: exponente constante
  if (exponente.isConstantNode) {
    const n = exponente.value;
    pasos.push({ tipo: 'texto', contenido: 'Regla de la potencia: Para f(x) = x^n, f\'(x) = n·x^(n-1)' });
    pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(x^n) = n \\cdot x^{n-1}` });
    
    if (base.isSymbolNode && base.name === 'x') {
      pasos.push({ tipo: 'texto', contenido: `En nuestro caso: n = ${n}` });
      pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(x^{${n}}) = ${n} \\cdot x^{${n-1}}` });
    } else {
      pasos.push({ tipo: 'texto', contenido: 'Aplicamos la regla de la cadena para funciones compuestas:' });
      pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}([f(x)]^n) = n \\cdot [f(x)]^{n-1} \\cdot f'(x)` });
      
      const derivBase = simplify(derivative(base, 'x'));
      pasos.push({ tipo: 'texto', contenido: 'Derivada de la base:' });
      pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(${base.toTex()}) = ${limpiarCdot(derivBase.toTex())}` });
      
      pasos.push({ tipo: 'texto', contenido: 'Aplicamos la regla:' });
      const resultado = `${n} \\cdot (${base.toTex()})^{${n-1}} \\cdot (${limpiarCdot(derivBase.toTex())})`;
      pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(resultado) });
    }
  } else {
    // Caso general: exponente variable
    pasos.push({ tipo: 'texto', contenido: 'Para potencias con exponente variable, usamos la regla de la cadena.' });
    pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(f(x)^{g(x)}) = f(x)^{g(x)} \\cdot (g'(x) \\cdot \\ln(f(x)) + g(x) \\cdot \\frac{f'(x)}{f(x)})` });
  }
  
  const derivadaFinal = simplify(derivative(expr, 'x'));
  pasos.push({ tipo: 'texto', contenido: 'Resultado final:' });
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(limpiarCdot(derivadaFinal.toTex())) });
  
  return pasos;
}

/**
 * Genera procedimiento para producto de funciones
 */
function generarProcedimientoProducto(expr, pasos) {
    const u = expr.args[0];
    const v = expr.args[1];
  
  pasos.push({ tipo: 'texto', contenido: 'Regla del producto: (u·v)\' = u\'·v + u·v\'' });
  pasos.push({ tipo: 'formula', contenido: "\\frac{d}{dx}(u \\cdot v) = u' \\cdot v + u \\cdot v'" });
  
  pasos.push({ tipo: 'texto', contenido: 'Identificamos:' });
  pasos.push({ tipo: 'formula', contenido: `u = ${u.toTex()} \\quad v = ${v.toTex()}` });
  
    const uDeriv = simplify(derivative(u, 'x'));
    const vDeriv = simplify(derivative(v, 'x'));
  
  pasos.push({ tipo: 'texto', contenido: 'Calculamos las derivadas:' });
  pasos.push({ tipo: 'formula', contenido: `u' = ${limpiarCdot(uDeriv.toTex())} \\quad v' = ${limpiarCdot(vDeriv.toTex())}` });
  
  pasos.push({ tipo: 'texto', contenido: 'Aplicamos la regla del producto:' });
  const resultado = `${limpiarCdot(uDeriv.toTex())} \\cdot ${v.toTex()} + ${u.toTex()} \\cdot ${limpiarCdot(vDeriv.toTex())}`;
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(resultado) });
  
  // Simplificar si es posible
  try {
    const resultadoSimplificado = simplify(parse(resultado)).toTex();
    if (resultadoSimplificado !== resultado) {
      pasos.push({ tipo: 'texto', contenido: 'Simplificamos:' });
      pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(limpiarCdot(resultadoSimplificado)) });
    }
  } catch {}
  
  const derivadaFinal = simplify(derivative(expr, 'x'));
  pasos.push({ tipo: 'texto', contenido: 'Resultado final:' });
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(limpiarCdot(derivadaFinal.toTex())) });
  
  return pasos;
}

/**
 * Genera procedimiento para funciones trigonométricas
 */
function generarProcedimientoTrigonometrica(expr, pasos) {
  const funcName = expr.fn.name;
  const arg = expr.args[0];
  
  const reglasTrig = {
    'sin': { derivada: 'cos', formula: "\\frac{d}{dx}(\\sin(x)) = \\cos(x)" },
    'cos': { derivada: '-sin', formula: "\\frac{d}{dx}(\\cos(x)) = -\\sin(x)" },
    'tan': { derivada: 'sec^2', formula: "\\frac{d}{dx}(\\tan(x)) = \\sec^2(x)" },
    'sec': { derivada: 'sec*tan', formula: "\\frac{d}{dx}(\\sec(x)) = \\sec(x) \\cdot \\tan(x)" },
    'csc': { derivada: '-csc*cot', formula: "\\frac{d}{dx}(\\csc(x)) = -\\csc(x) \\cdot \\cot(x)" },
    'cot': { derivada: '-csc^2', formula: "\\frac{d}{dx}(\\cot(x)) = -\\csc^2(x)" }
  };
  
  const regla = reglasTrig[funcName];
  pasos.push({ tipo: 'texto', contenido: `Regla para ${funcName}(x):` });
  pasos.push({ tipo: 'formula', contenido: regla.formula });
  
  if (arg.isSymbolNode && arg.name === 'x') {
    // Caso simple: sin(x), cos(x), etc.
    pasos.push({ tipo: 'texto', contenido: `Derivada directa: ${funcName}'(x) = ${regla.derivada.replace('*', '·')}` });
  } else {
    // Caso compuesto: sin(f(x)), cos(f(x)), etc.
    pasos.push({ tipo: 'texto', contenido: 'Aplicamos la regla de la cadena:' });
    pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(${funcName}(f(x))) = ${funcName}'(f(x)) \\cdot f'(x)` });
    
    const derivArg = simplify(derivative(arg, 'x'));
    pasos.push({ tipo: 'texto', contenido: 'Derivada del argumento:' });
    pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(${arg.toTex()}) = ${limpiarCdot(derivArg.toTex())}` });
    
    pasos.push({ tipo: 'texto', contenido: 'Aplicamos la regla:' });
    const resultado = `${regla.derivada.replace('*', '·')}(${arg.toTex()}) \\cdot (${limpiarCdot(derivArg.toTex())})`;
    pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(resultado) });
  }
  
  const derivadaFinal = simplify(derivative(expr, 'x'));
  pasos.push({ tipo: 'texto', contenido: 'Resultado final:' });
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(limpiarCdot(derivadaFinal.toTex())) });
  
  return pasos;
}

/**
 * Genera procedimiento para funciones exponenciales y logarítmicas
 */
function generarProcedimientoExponencial(expr, pasos) {
  const funcName = expr.fn.name;
  const arg = expr.args[0];
  
  if (funcName === 'exp') {
    pasos.push({ tipo: 'texto', contenido: 'Regla para exponencial: (e^x)\' = e^x' });
    pasos.push({ tipo: 'formula', contenido: "\\frac{d}{dx}(e^x) = e^x" });
    
    if (arg.isSymbolNode && arg.name === 'x') {
      pasos.push({ tipo: 'texto', contenido: 'Derivada directa: (e^x)\' = e^x' });
    } else {
      pasos.push({ tipo: 'texto', contenido: 'Aplicamos la regla de la cadena:' });
      pasos.push({ tipo: 'formula', contenido: "\\frac{d}{dx}(e^{f(x)}) = e^{f(x)} \\cdot f'(x)" });
      
      const derivArg = simplify(derivative(arg, 'x'));
      pasos.push({ tipo: 'texto', contenido: 'Derivada del exponente:' });
      pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(${arg.toTex()}) = ${limpiarCdot(derivArg.toTex())}` });
      
      const resultado = `e^{${arg.toTex()}} \\cdot (${limpiarCdot(derivArg.toTex())})`;
      pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(resultado) });
    }
  } else if (funcName === 'log' || funcName === 'ln') {
    pasos.push({ tipo: 'texto', contenido: `Regla para logaritmo: (ln(x))' = 1/x` });
    pasos.push({ tipo: 'formula', contenido: "\\frac{d}{dx}(\\ln(x)) = \\frac{1}{x}" });
    
    if (arg.isSymbolNode && arg.name === 'x') {
      pasos.push({ tipo: 'texto', contenido: 'Derivada directa: (ln(x))\' = 1/x' });
    } else {
      pasos.push({ tipo: 'texto', contenido: 'Aplicamos la regla de la cadena:' });
      pasos.push({ tipo: 'formula', contenido: "\\frac{d}{dx}(\\ln(f(x))) = \\frac{f'(x)}{f(x)}" });
      
      const derivArg = simplify(derivative(arg, 'x'));
      pasos.push({ tipo: 'texto', contenido: 'Derivada del argumento:' });
      pasos.push({ tipo: 'formula', contenido: `\\frac{d}{dx}(${arg.toTex()}) = ${limpiarCdot(derivArg.toTex())}` });
      
      const resultado = `\\frac{${limpiarCdot(derivArg.toTex())}}{${arg.toTex()}}`;
      pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(resultado) });
    }
  }
  
  const derivadaFinal = simplify(derivative(expr, 'x'));
  pasos.push({ tipo: 'texto', contenido: 'Resultado final:' });
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(limpiarCdot(derivadaFinal.toTex())) });
  
  return pasos;
}

/**
 * Detecta si una expresión es una composición de funciones
 */
function esComposicionFunciones(expr) {
  if (expr.isFunctionNode) {
    // Verificar si el argumento de la función no es simplemente 'x'
    const arg = expr.args[0];
    return !(arg.isSymbolNode && arg.name === 'x');
  }
  return false;
}

/**
 * Genera procedimiento para la regla de la cadena
 */
function generarProcedimientoReglaCadena(expr, pasos) {
  pasos.push({ tipo: 'texto', contenido: 'Regla de la cadena: Para f(g(x)), la derivada es f\'(g(x))·g\'(x)' });
  pasos.push({ tipo: 'formula', contenido: "\\frac{d}{dx}(f(g(x))) = f'(g(x)) \\cdot g'(x)" });
  
  const funcName = expr.fn.name;
  const arg = expr.args[0];
  
  pasos.push({ tipo: 'texto', contenido: 'Identificamos:' });
  pasos.push({ tipo: 'formula', contenido: `f(x) = ${funcName}(x) \\quad g(x) = ${arg.toTex()}` });
  
  // Derivada de la función exterior
  let derivFuncExterior = '';
  if (funcName === 'sin') derivFuncExterior = 'cos';
  else if (funcName === 'cos') derivFuncExterior = '-sin';
  else if (funcName === 'tan') derivFuncExterior = 'sec^2';
  else if (funcName === 'exp') derivFuncExterior = 'exp';
  else if (funcName === 'ln' || funcName === 'log') derivFuncExterior = '1/x';
  else derivFuncExterior = `${funcName}'`;
  
  pasos.push({ tipo: 'texto', contenido: 'Derivada de la función exterior:' });
  pasos.push({ tipo: 'formula', contenido: `f'(x) = ${derivFuncExterior}` });
  
  // Derivada de la función interior
  const derivArg = simplify(derivative(arg, 'x'));
  pasos.push({ tipo: 'texto', contenido: 'Derivada de la función interior:' });
  pasos.push({ tipo: 'formula', contenido: `g'(x) = \\frac{d}{dx}(${arg.toTex()}) = ${limpiarCdot(derivArg.toTex())}` });
  
  pasos.push({ tipo: 'texto', contenido: 'Aplicamos la regla de la cadena:' });
  const resultado = `${derivFuncExterior}(${arg.toTex()}) \\cdot (${limpiarCdot(derivArg.toTex())})`;
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(resultado) });
  
  const derivadaFinal = simplify(derivative(expr, 'x'));
  pasos.push({ tipo: 'texto', contenido: 'Resultado final:' });
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(limpiarCdot(derivadaFinal.toTex())) });
  
  return pasos;
}

/**
 * Genera procedimiento para cociente (ya implementado, pero mejorado)
 */
function generarProcedimientoCociente(expr, pasos) {
  const u = expr.args[0];
  const v = expr.args[1];
  
    pasos.push({ tipo: 'texto', contenido: 'Regla del cociente:' });
    pasos.push({ tipo: 'formula', contenido: "\\left( \\frac{u}{v} \\right)' = \\frac{u'v - uv'}{v^2}" });
    pasos.push({ tipo: 'texto', contenido: 'Identificamos:' });
  pasos.push({ tipo: 'formula', contenido: `u = ${u.toTex()} \\quad v = ${v.toTex()}` });
  
  const uDeriv = simplify(derivative(u, 'x'));
  const vDeriv = simplify(derivative(v, 'x'));
  
    pasos.push({ tipo: 'texto', contenido: 'Calculamos:' });
  pasos.push({ tipo: 'formula', contenido: `u' = ${limpiarCdot(uDeriv.toTex())} \\quad v' = ${limpiarCdot(vDeriv.toTex())}` });
    pasos.push({ tipo: 'texto', contenido: 'Sustituimos en la fórmula:' });
  
  let numerador = `${limpiarCdot(uDeriv.toTex())} \\cdot ${v.toTex()} - ${u.toTex()} \\cdot ${limpiarCdot(vDeriv.toTex())}`;
  let denominador = `${v.toTex()}^{2}`;
  numerador = limpiarCdot(numerador);
  denominador = limpiarCdot(denominador);
    const sustitucionLatex = `\\frac{${numerador}}{${denominador}}`;
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(sustitucionLatex) });

    // --- Pasos intermedios algebraicos ---
    // Paso 1: Mostrar la fracción derivada (ya hecho arriba)
    // Paso 2: Expandir el numerador
    let numeradorExpandido = '';
    try {
      numeradorExpandido = math.expand(parse(numerador)).toTex();
      numeradorExpandido = limpiarCdot(numeradorExpandido);
      pasos.push({ tipo: 'texto', contenido: 'Expandimos el numerador:' });
    pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(numeradorExpandido) });
    } catch {}
  
    // Paso 3: Simplificar el numerador
    let numeradorSimplificado = '';
    try {
      numeradorSimplificado = simplify(parse(numerador)).toTex();
      numeradorSimplificado = limpiarCdot(numeradorSimplificado);
      pasos.push({ tipo: 'texto', contenido: 'Simplificamos el numerador:' });
    pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(numeradorSimplificado) });
    } catch {}
  
    // Paso 4: Fracción con numerador simplificado
    if (numeradorSimplificado) {
      const fraccionSimplificada = `\\frac{${numeradorSimplificado}}{${denominador}}`;
      pasos.push({ tipo: 'texto', contenido: 'Fracción con numerador simplificado:' });
    pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(fraccionSimplificada) });
    }
  
    // Paso 5: Fracción completamente simplificada
    const derivada = simplify(derivative(expr, 'x'));
    pasos.push({ tipo: 'texto', contenido: 'Fracción completamente simplificada:' });
  pasos.push({ tipo: 'formula', contenido: limpiarErroresMathjsLatex(limpiarCdot(derivada.toTex())) });

  return pasos;
} 
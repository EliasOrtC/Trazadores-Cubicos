import React, { useState, useRef, useEffect } from "react";
import TablaPuntos from './TablaPuntos';
import TecladoCientifico from './TecladoCientifico';
import VisualizacionResultados from './VisualizacionResultados';
import EntradaFuncion from './EntradaFuncion';
import { 
  convertirPotenciasASuperindices, 
  formatearValor, 
  convertirSubindices, 
  funcionVisual, 
  funcionInterna 
} from '../utils/formateadoresMatematicos';
import '../assets/background2.jpg';
import SidebarPuntos from './SidebarPuntos';

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
import { calcularTrazadores, generarPlanteamiento } from '../utils/CalculosTrazadores';
import { validarFormulario } from '../utils/Validaciones';

// Agregar estilo global para el fondo
if (typeof window !== 'undefined') {
  document.body.style.backgroundImage = "url('/src/assets/background2.jpg')";
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundAttachment = 'fixed';
  document.body.style.backgroundPosition = 'center';
}

export default function TrazadoresForm() {
  const [puntos, setPuntos] = useState([{ x: "", y: "" }]);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [modoEntrada, setModoEntrada] = useState("valores"); // "valores" o "funcion"
  const [funcion, setFuncion] = useState("");
  const [mostrarModalPotencia, setMostrarModalPotencia] = useState(false);
  const [potenciaPersonalizada, setPotenciaPersonalizada] = useState("");
  const [posicionInsercion, setPosicionInsercion] = useState({ start: 0, end: 0 });
  const [mostrarTeclado, setMostrarTeclado] = useState(false);
  const inputRef = useRef(null);
  const tecladoRef = useRef(null);
  const [tecladoPos, setTecladoPos] = useState({ top: 0, left: 0, width: 300 });
  const [tipoFrontera, setTipoFrontera] = useState("libre"); // 'libre' o 'sujeta'
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [mostrarPestanaSidebar, setMostrarPestanaSidebar] = useState(false);
  const formRef = useRef(null);

  // Actualizar la posición del teclado cuando el input tiene foco o al hacer scroll/resize
  useEffect(() => {
    function actualizarPosicionTeclado() {
      if (inputRef.current && mostrarTeclado) {
        const rect = inputRef.current.getBoundingClientRect();
        setTecladoPos({
          top: rect.bottom, // 4px de separación
          left: rect.left,
          width: rect.width
        });
      }
    }
    let observer;
    let interval;
    if (mostrarTeclado) {
      actualizarPosicionTeclado();
      window.addEventListener('resize', actualizarPosicionTeclado);
      if (window.ResizeObserver && inputRef.current) {
        observer = new ResizeObserver(actualizarPosicionTeclado);
        observer.observe(inputRef.current);
      }
      // Actualizar posición cada 100ms para seguir el input aunque haya scroll en cualquier contenedor
      interval = setInterval(actualizarPosicionTeclado, 100);
    }
    return () => {
      window.removeEventListener('resize', actualizarPosicionTeclado);
      if (observer && inputRef.current) observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [mostrarTeclado]);

  // Mostrar la pestaña del sidebar solo si el usuario ha hecho scroll más allá de la mitad del div de entrada
  useEffect(() => {
    function handleScroll() {
      if (formRef.current) {
        const rect = formRef.current.getBoundingClientRect();
        const mitad = rect.height / 2;
        if (rect.bottom < mitad) {
          setMostrarPestanaSidebar(true);
        } else {
          setMostrarPestanaSidebar(false);
          setSidebarVisible(false);
        }
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calcular Y en tiempo real cuando cambia la función o los valores de x
  useEffect(() => {
    if (modoEntrada === "funcion" && funcion.trim()) {
      try {
        const nuevosPuntos = puntos.map(p => {
          if (p.x) {
            const x = parseFloat(p.x);
            let funcionEvaluada = funcionInterna(funcion);
            console.log("Función interna original:", funcionEvaluada);
            
            funcionEvaluada = funcionEvaluada
              // Limpiar espacios extra
              .replace(/\s+/g, '') // Eliminar todos los espacios
              // Convertir potencias que vienen de funcionInterna: x^(2) → Math.pow(x, 2)
              .replace(/([a-zA-Z])\^\(([^)]+)\)/g, 'Math.pow($1, $2)')
              .replace(/([a-zA-Z])\^(\d+)/g, 'Math.pow($1, $2)')
              // Convertir potencias de paréntesis: (expresión)^n o (expresión)^(n)
              .replace(/\(([^()]+)\)\^(\d+)/g, 'Math.pow($1, $2)')
              .replace(/\(([^()]+)\)\^\(([^()]+)\)/g, 'Math.pow($1, $2)')
              // Convertir multiplicación implícita: número seguido de variable o paréntesis
              .replace(/(\d+)x/gi, '$1*x')
              .replace(/(\d+)\(/g, '$1*(')
              .replace(/(\d+)y/gi, '$1*y')
              // Convertir multiplicación implícita: variable seguida de variable
              .replace(/xx/gi, 'x*x')
              .replace(/xy/gi, 'x*y')
              .replace(/yx/gi, 'y*x')
              .replace(/yy/gi, 'y*y')
              // Convertir multiplicación implícita: variable seguida de paréntesis
              .replace(/x\(/gi, 'x*(')
              .replace(/y\(/gi, 'y*(')
              // Convertir multiplicación implícita: paréntesis seguido de paréntesis
              .replace(/\)\(/g, ')*(')
              // Limpiar asteriscos erróneos en Math.pow
              .replace(/M\*a\*t\*h\.pow/g, 'Math.pow')
              .replace(/Math\.p\*o\*w/g, 'Math.pow')
              // Limpiar Math.pow malformados
              .replace(/Math\.pow\(([^,]+),([^)]+)\)/g, (match, base, exponente) => {
                // Verificar que la base y exponente sean válidos
                if (base.trim() && exponente.trim()) {
                  return `Math.pow(${base.trim()}, ${exponente.trim()})`;
                }
                return match; // Si no es válido, mantener como está
              })
              .replace(/x/gi, x);
            
            console.log("Función después de todas las conversiones:", funcionEvaluada);
            console.log("Función a evaluar:", funcionEvaluada);
            
            // Debug: mostrar el proceso paso a paso
            console.log("=== DEBUG CONVERSIÓN ===");
            console.log("Función original:", funcion);
            console.log("Función interna:", funcionInterna(funcion));
            console.log("Función final:", funcionEvaluada);
            console.log("========================");
            
            // Validar que la función esté completa antes de evaluar
            if (!funcionEvaluada.trim()) {
              console.log("Función vacía, saltando evaluación");
              return { x: p.x, y: "" };
            }
            
            // Verificar paréntesis balanceados
            const parentesisAbiertos = (funcionEvaluada.match(/\(/g) || []).length;
            const parentesisCerrados = (funcionEvaluada.match(/\)/g) || []).length;
            if (parentesisAbiertos !== parentesisCerrados) {
              console.log("Paréntesis no balanceados:", parentesisAbiertos, "abiertos,", parentesisCerrados, "cerrados");
              return { x: p.x, y: "" };
            }
            
            // Verificar que la función no termine con operadores
            const operadoresFinal = /[+\-*/^]$/;
            if (operadoresFinal.test(funcionEvaluada.trim())) {
              console.log("Función termina con operador, saltando evaluación");
              return { x: p.x, y: "" };
            }
            
            // Verificar que no haya operadores consecutivos (excepto para números negativos)
            const operadoresConsecutivos = /[+\-*/^]{2,}/;
            if (operadoresConsecutivos.test(funcionEvaluada.replace(/-\d+/g, ''))) {
              console.log("Operadores consecutivos detectados, saltando evaluación");
              return { x: p.x, y: "" };
            }
            
            // Verificar si la función contiene Math.pow antes de evaluar
            if (funcionEvaluada.includes('Math.pow')) {
              console.log("La función contiene Math.pow, verificando sintaxis...");
              // Intentar evaluar paso a paso para identificar el problema
              try {
                const y = eval(funcionEvaluada);
                console.log("Evaluación exitosa:", y);
                return { x: p.x, y: y.toString() };
              } catch (evalError) {
                console.error("Error en eval:", evalError);
                console.error("Función problemática:", funcionEvaluada);
                throw evalError;
              }
            } else {
              const y = eval(funcionEvaluada);
              return { x: p.x, y: y.toString() };
            }
          }
          return p;
        });
        setPuntos(nuevosPuntos);
        setError(""); // Limpiar error si el cálculo fue exitoso
      } catch (err) {
        console.error("Error al evaluar función:", err);
        console.error("Función original:", funcion);
        console.error("Función interna:", funcionInterna(funcion));
        
        // Dar mensajes de error más específicos
        let mensajeError = "Error al evaluar la función: ";
        if (err.message.includes("Unexpected end of input")) {
          mensajeError += "La función está incompleta. Verifica que no falten paréntesis o que no termine con un operador.";
        } else if (err.message.includes("Unexpected token")) {
          mensajeError += "Sintaxis inválida. Verifica los operadores y paréntesis.";
        } else {
          mensajeError += `${err.message}. Verifica la sintaxis.`;
        }
        
        setError(mensajeError);
      }
    }
    if (modoEntrada === "funcion" && !funcion.trim()) {
      setPuntos(puntos.map(p => ({ ...p, y: "" })));
      setError(""); // Limpiar error si la función está vacía
    }
    
    // Limpiar errores cuando la función se complete correctamente
    if (modoEntrada === "funcion" && funcion.trim() && !error.includes("incompleta")) {
      setError("");
    }
    // eslint-disable-next-line
  }, [funcion, puntos.map(p => p.x).join(","), modoEntrada]);

  function agregarPunto() {
    setPuntos([...puntos, { x: "", y: "" }]);
  }

  function actualizarPunto(idx, campo, valor) {
    const nuevos = puntos.map((p, i) => i === idx ? { ...p, [campo]: valor } : p);
    setPuntos(nuevos);
  }

  // Función para mapear posición de función visual a función interna
  function mapearPosicionVisualAInterna(posicionVisual, funcionVisual, funcionInterna) {
    console.log("Mapeando posición visual", posicionVisual, "en función visual:", funcionVisual);
    console.log("A función interna:", funcionInterna);
    
    let posicionInterna = 0;
    let posicionVisualActual = 0;
    
    // Recorrer la función visual carácter por carácter
    for (let i = 0; i < funcionVisual.length && posicionVisualActual < posicionVisual; i++) {
      const char = funcionVisual[i];
      
      // Si es un superíndice, solo avanzar en la posición visual
      if ('⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻·⁄ˣʸᶻᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷ⁽⁾'.includes(char)) {
        posicionVisualActual++;
        console.log("Saltando superíndice:", char, "posVisual:", posicionVisualActual, "posInterna:", posicionInterna);
        continue;
      }
      
      // Si es un carácter normal, avanzar en ambas funciones
      posicionInterna++;
      posicionVisualActual++;
      console.log("Avanzando:", char, "posVisual:", posicionVisualActual, "posInterna:", posicionInterna);
    }
    
    console.log("Posición interna resultante:", posicionInterna);
    return posicionInterna;
  }

  // Función para mapear posición de función interna a función visual
  function mapearPosicionInternaAVisual(posicionInterna, funcionInterna, funcionVisual) {
    console.log("Mapeando posición interna", posicionInterna, "en función interna:", funcionInterna);
    console.log("A función visual:", funcionVisual);
    
    let posicionVisual = 0;
    let posicionInternaActual = 0;
    
    // Recorrer la función interna carácter por carácter
    for (let i = 0; i < funcionInterna.length && posicionInternaActual < posicionInterna; i++) {
      const char = funcionInterna[i];
      
      // Avanzar en la función interna
      posicionInternaActual++;
      posicionVisual++;
      
      // Si el siguiente carácter es ^, saltar los superíndices en la función visual
      if (i + 1 < funcionInterna.length && funcionInterna[i + 1] === '^') {
        // Contar cuántos superíndices hay en la función visual después de este punto
        let superindices = 0;
        for (let j = posicionVisual; j < funcionVisual.length; j++) {
          if ('⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻·⁄ˣʸᶻᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷ⁽⁾'.includes(funcionVisual[j])) {
            superindices++;
          } else {
            break;
          }
        }
        posicionVisual += superindices;
        console.log("Saltando", superindices, "superíndices, nueva posVisual:", posicionVisual);
      }
    }
    
    console.log("Posición visual resultante:", posicionVisual);
    return posicionVisual;
  }

  function insertarEnFuncion(texto) {
    console.log("insertarEnFuncion llamado con:", texto); // Debug
    const input = inputRef.current;
    if (!input) {
      console.log("No se encontró el input"); // Debug
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;
    console.log("Posición del cursor:", start, end); // Debug
    
    // Obtener la función visual actual
    const funcionVisualActual = convertirPotenciasPersonalizadas(funcionVisual(funcion));
    console.log("Función visual actual:", funcionVisualActual); // Debug
    console.log("Función interna actual:", funcion); // Debug
    
    // Manejar potencia personalizada
    if (texto === 'ʸ') {
      console.log("Mostrando modal para potencia personalizada"); // Debug
      // Guardar la posición y mostrar el modal
      setPosicionInsercion({ start, end });
      setMostrarModalPotencia(true);
      setPotenciaPersonalizada("");
      return;
    }
    
    // Enfoque más simple: trabajar directamente con la función visual
    const valorVisualActual = input.value;
    const nuevoValorVisual = valorVisualActual.substring(0, start) + texto + valorVisualActual.substring(end);
    console.log("Nuevo valor visual:", nuevoValorVisual); // Debug
    
    // Convertir de vuelta a función interna
    const nuevoValorInterno = funcionInterna(nuevoValorVisual);
    console.log("Nuevo valor interno:", nuevoValorInterno); // Debug
    
    setFuncion(nuevoValorInterno);
    
    // Restaurar el cursor después de la inserción
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + texto.length, start + texto.length);
    }, 0);
  }

  function insertarPotenciaPersonalizada() {
    console.log("=== DEBUG INSERTAR POTENCIA PERSONALIZADA ===");
    console.log("Potencia personalizada:", potenciaPersonalizada);
    if (!potenciaPersonalizada.trim()) return;
    
    const { start, end } = posicionInsercion;
    const input = inputRef.current;
    
    if (!input) return;
    
    // Trabajar con la función visual actual
    const valorVisualActual = input.value;
    const textoSeleccionado = valorVisualActual.substring(start, end);
    console.log("Valor visual actual:", valorVisualActual);
    console.log("Posición start:", start, "end:", end);
    console.log("Texto seleccionado:", textoSeleccionado);
    
    let textoVisual;
    
    if (textoSeleccionado && start !== end) {
      // Si hay texto seleccionado, aplicar la potencia a esa expresión
      textoVisual = `(${textoSeleccionado})^(${potenciaPersonalizada.trim()})`;
    } else {
      // Si no hay texto seleccionado, aplicar la potencia a x
      textoVisual = `^(${potenciaPersonalizada.trim()})`;
    }
    
    console.log("Texto visual a insertar:", textoVisual);
    
    const nuevoValorVisual = valorVisualActual.substring(0, start) + textoVisual + valorVisualActual.substring(end);
    console.log("Nuevo valor visual:", nuevoValorVisual); // Debug
    
    // Convertir de vuelta a función interna
    const nuevoValorInterno = funcionInterna(nuevoValorVisual);
    console.log("Nuevo valor interno:", nuevoValorInterno); // Debug
    console.log("=== FIN DEBUG ===");
    
    setFuncion(nuevoValorInterno);
    
    // Cerrar modal y restaurar cursor
    setMostrarModalPotencia(false);
    setPotenciaPersonalizada("");
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + textoVisual.length, start + textoVisual.length);
      }
    }, 0);
  }

  // Debug: mostrar el estado del modal
  console.log("Estado del modal:", mostrarModalPotencia); // Debug

  function limpiarFuncion() {
    setFuncion("");
  }

  function borrarUltimo() {
    setFuncion(prev => prev.slice(0, -1));
  }

  async function calcular(e) {
    if (e) e.preventDefault();
    setError("");
    setResultado(null);

    // Validar formulario antes de calcular
    const errores = validarFormulario(puntos, modoEntrada, funcion);
    if (errores.length > 0) {
      setError(errores.join('\n'));
      return;
    }

    try {
      const funcionParaCalcular = modoEntrada === "funcion" && funcion.trim() ? funcionInterna(funcion) : null;
      const resultado = await calcularTrazadores(puntos, funcionParaCalcular);
      setResultado(resultado);
    } catch (error) {
      setError(error.message);
    }
  }

  // Función para generar el planteamiento de los Sj
  function generarPlanteamientoLocal() {
    return generarPlanteamiento(puntos);
  }

  // Función para manejar el input cuando el usuario escribe manualmente
  function manejarCambioInput(e) {
    let valor = e.target.value;
    
    // Limpiar espacios extra antes de convertir
    valor = valor.replace(/\s+/g, '');
    
    // Convertir notación visual a interna usando la utilidad
    valor = funcionInterna(valor);
    
    setFuncion(valor);
  }

  // Función para mostrar el teclado cuando el input tiene foco
  function manejarFocus() {
    setMostrarTeclado(true);
  }

  // Función para ocultar el teclado solo si el foco no está en el input ni en el teclado
  function manejarBlur(e) {
    setTimeout(() => {
      const elementoActivo = document.activeElement;
      const tecladoElement = tecladoRef.current;
      const inputElement = inputRef.current;
      if (
        (tecladoElement && tecladoElement.contains(elementoActivo)) ||
        (inputElement && inputElement === elementoActivo)
      ) {
        // Si el foco está en el teclado o en el input, no ocultar
        return;
      }
      setMostrarTeclado(false);
    }, 10);
  }

  // Obtener polinomios Sj del paso uno
  const planteamiento = generarPlanteamiento(puntos);
  let polinomiosSj = [];
  if (planteamiento && planteamiento.contenido) {
    polinomiosSj = planteamiento.contenido
      .split('\n')
      .filter(linea => linea.trim().startsWith('S'));
  }

  return (
  <div>  
    <div style={{padding:'initial', width:'100%'}}>
      <div
        ref={formRef}
        style={{backgroundColor:'rgba(255, 255, 255, 0.95)', borderRadius:'1.2em', boxShadow:'0 4px 32px rgba(0,0,0,0.10)', padding:'6em 0', margin: '0.5em 0.5em'}}
      >
        <div style={{display:'flex', justifyContent:'center', marginBottom:'1em'}}>
          <h1 style={{fontSize:'3.5em', fontWeight:'bold', marginTop:'0'}}>Método de Trazadores Cúbicos</h1>
        </div>
        <form onSubmit={calcular}>
          <div style={{ display: 'flex', gap: '2em', justifyContent: 'space-evenly', fontSize:'1em', backgroundColor:'rgba(255, 255, 255, 0)', borderRadius:'1.2em', padding:'2em 0'}}>
            <div style={{ gap:'2em', padding:'0 4em 0 6em', width:'-webkit-fill-available', margin:'auto'}}>
              <h3 style={{marginTop:'0'}}>Opciones de entrada</h3>
              <div>
                <label>
                  <input
                    type="radio"
                    name="modoEntrada"
                    value="valores"
                    checked={modoEntrada === "valores"}
                    onChange={(e) => setModoEntrada(e.target.value)}
                  />
                  Ingresar valores de Y directamente
                </label>
              </div>
              <div style={{marginBottom:'1em', transition:'all 0.5s'}}>
                <label>
                  <input
                    type="radio"
                    name="modoEntrada"
                    value="funcion"
                    checked={modoEntrada === "funcion"}
                    onChange={(e) => setModoEntrada(e.target.value)}
                  />
                  Usar función f(x)
                </label>
              </div>
              {modoEntrada === "funcion" && (
                <div style={{marginBottom:'1em'}}>
                  <label style={{marginRight:'1em'}}>
                    <input
                      type="radio"
                      name="tipoFrontera"
                      value="libre"
                      checked={tipoFrontera === "libre"}
                      onChange={() => { setTipoFrontera("libre"); calcular(); }}
                    />
                    Frontera libre o natural
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipoFrontera"
                      value="sujeta"
                      checked={tipoFrontera === "sujeta"}
                      onChange={() => { setTipoFrontera("sujeta"); calcular(); }}
                    />
                    Frontera sujeta
                  </label>
                </div>
              )}
              <EntradaFuncion 
                modoEntrada={modoEntrada}
                funcion={funcion}
                manejarCambioInput={manejarCambioInput}
                manejarFocus={manejarFocus}
                manejarBlur={manejarBlur}
                mostrarTeclado={mostrarTeclado}
                tecladoPos={tecladoPos}
                insertarEnFuncion={insertarEnFuncion}
                limpiarFuncion={limpiarFuncion}
                inputRef={inputRef}
                setMostrarTeclado={setMostrarTeclado}
              />
            </div>
            <TablaPuntos 
              puntos={puntos}
              setPuntos={setPuntos}
              modoEntrada={modoEntrada}
              actualizarPunto={actualizarPunto}
              />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1em' }}>
            <button type="submit"
              style={{
                background: 'linear-gradient(90deg,rgb(54, 32, 255) 0%,rgb(28, 27, 129) 100%)',
                color: 'white',
                padding: '0.75em 2.2em',
                fontSize: '1.1em',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '1em',
                boxShadow: '0 2px 12px rgba(79,140,255,0.15)',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                letterSpacing: '0.04em',
                margin:'1.2em 0'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'linear-gradient(90deg, rgb(28, 27, 129) 0%, rgb(54, 32, 255) 100%)';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'linear-gradient(90deg, rgb(54, 32, 255) 0%, rgb(28, 27, 129) 100%)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Calcular Trazadores
            </button>
          </div>
        </form>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <VisualizacionResultados 
        resultado={resultado}
        generarPlanteamiento={generarPlanteamientoLocal}
        puntos={puntos}
        tipoFrontera={tipoFrontera}
        funcion={funcion}
      />
      
      {/* Modal para potencia personalizada */}
      {mostrarModalPotencia && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2em',
            borderRadius: '8px',
            minWidth: '300px'
          }}>
            <h3>Ingresa el valor de la potencia</h3>
            <p style={{ marginBottom: '1em', color: '#666' }}>
              Ejemplos: 2, 0.5, x+1, sin(x), 2*x
            </p>
            <input
              type="text"
              value={potenciaPersonalizada}
              onChange={(e) => setPotenciaPersonalizada(e.target.value)}
              placeholder="Ej: 2"
              style={{
                width: '100%',
                padding: '0.5em',
                marginBottom: '1em',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  insertarPotenciaPersonalizada();
                }
              }}
              autoFocus
              id="potencia-personalizada-input"
              name="potencia-personalizada"
            />
            <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMostrarModalPotencia(false)}
                style={{
                  padding: '0.5em 1em',
                  backgroundColor: '#ccc',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={insertarPotenciaPersonalizada}
                style={{
                  padding: '0.5em 1em',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}
      <SidebarPuntos
        puntos={puntos}
        polinomiosSj={polinomiosSj}
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onOpen={() => setSidebarVisible(true)}
        funcion={funcion}
        modoEntrada={modoEntrada}
        tipoFrontera={tipoFrontera}
      />
      {/* Pestaña para mostrar el sidebar */}
      {mostrarPestanaSidebar && !sidebarVisible && (
        <div
          style={{
            position: 'fixed',
            top: '40%',
            right: 0,
            zIndex: 2000,
            background: '#1976d2',
            color: '#fff',
            borderRadius: '8px 0 0 8px',
            padding: '2em 3em 2em 1em',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0002',
            fontWeight: 'bold',
            fontSize: '1.2em',
            transition: 'right 0.3s',
          }}
          onClick={() => setSidebarVisible(true)}
        >
          <b>{'<'}</b>
        </div>
      )}
    </div>
    </div>
  );
} 
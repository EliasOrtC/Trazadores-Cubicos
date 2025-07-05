# Métodos Numéricos - Trazadores Cúbicos

## Instalación y Ejecución

### Requisitos Previos
- Node.js (versión 16 o superior)
- npm (incluido con Node.js)

### Opción 1: Ejecución Rápida (Recomendada)

#### Windows:
1. Doble clic en `install-and-run.bat`
2. Esperar a que se complete la instalación
3. La aplicación se abrirá automáticamente

#### Linux/Mac:
1. Abrir terminal en esta carpeta
2. Ejecutar: `chmod +x install-and-run.sh`
3. Ejecutar: `./install-and-run.sh`

### Opción 2: Instalación Manual

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Construir la aplicación:**
   ```bash
   npm run build
   ```

3. **Ejecutar la aplicación:**
   ```bash
   npm run electron
   ```

### Opción 3: Crear Ejecutable

Para crear un archivo ejecutable que puedas enviar a otros:

1. **Instalar dependencias adicionales:**
   ```bash
   npm install electron-builder --save-dev
   ```

2. **Crear el ejecutable:**
   ```bash
   npm run dist
   ```

3. **Encontrar el ejecutable:**
   - Windows: `dist-electron/Métodos Numéricos Setup.exe`
   - Mac: `dist-electron/Métodos Numéricos.dmg`
   - Linux: `dist-electron/Métodos Numéricos.AppImage`

## Funcionalidades

- **Trazadores Cúbicos**: Interpolación con splines cúbicos
- **Frontera Sujeta**: Especificar derivadas en los extremos
- **Frontera Natural**: Segunda derivada cero en los extremos
- **Visualización**: Gráficos y tablas de resultados
- **Cálculos Paso a Paso**: Explicación detallada del proceso

## Solución de Problemas

### Error: "npm no se reconoce"
- Instalar Node.js desde: https://nodejs.org/

### Error: "Puerto 4321 en uso"
- Cerrar otras aplicaciones que usen el puerto
- O cambiar el puerto en `astro.config.mjs`

### La aplicación no se abre
- Verificar que Node.js esté instalado correctamente
- Ejecutar `node --version` para confirmar

## Contacto

Desarrollado por: Elias Ortega
Universidad Nacional de Ingeniería 
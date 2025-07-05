@echo off
echo ========================================
echo Instalando Metodos Numericos
echo ========================================

echo.
echo Instalando dependencias...
npm install

echo.
echo Construyendo la aplicacion...
npm run build

echo.
echo Iniciando la aplicacion...
npm run electron

pause 
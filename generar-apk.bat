@echo off
echo ========================================
echo    GENERADOR DE APK - CONTROL VIGILANCIA
echo ========================================
echo.

echo Paso 1: Verificando archivos necesarios...
if not exist "index.html" (
    echo ERROR: No se encuentra index.html
    pause
    exit /b 1
)

if not exist "manifest.json" (
    echo ERROR: No se encuentra manifest.json
    pause
    exit /b 1
)

echo ✅ Archivos principales encontrados
echo.

echo Paso 2: Abriendo PWA Builder...
echo.
echo INSTRUCCIONES:
echo 1. Se abrirá PWA Builder en tu navegador
echo 2. Pega la URL de tu aplicación local
echo 3. Haz clic en "Build My PWA"
echo 4. Descarga el APK generado
echo.

echo ¿Quieres abrir PWA Builder ahora? (S/N)
set /p respuesta=
if /i "%respuesta%"=="S" (
    start https://www.pwabuilder.com/
    echo.
    echo PWA Builder abierto. Sigue las instrucciones en pantalla.
) else (
    echo.
    echo Puedes abrir manualmente: https://www.pwabuilder.com/
)

echo.
echo ========================================
echo    OPCIONES ALTERNATIVAS
echo ========================================
echo.
echo Si PWA Builder no funciona, puedes:
echo.
echo 1. Usar la PWA directamente:
echo    - Copia la carpeta a tu móvil
echo    - Abre index.html en Chrome
echo    - Instala como aplicación
echo.
echo 2. Usar servidor local:
echo    - Ejecuta: python -m http.server 8080
echo    - Ve a: http://localhost:8080
echo.
echo 3. Usar Live Server (VS Code):
echo    - Instala extensión "Live Server"
echo    - Click derecho en index.html
echo    - "Open with Live Server"
echo.

pause 
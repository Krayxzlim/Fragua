@echo off
setlocal
cd /d "%~dp0"
set "GIT_CONFIG_COUNT=2"
set "GIT_CONFIG_KEY_0=safe.directory"
set "GIT_CONFIG_VALUE_0=%CD:\=/%"
set "GIT_CONFIG_KEY_1=http.sslBackend"
set "GIT_CONFIG_VALUE_1=openssl"
set "BRANCH="
for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"
if not "%BRANCH%"=="main" goto wrongbranch
git rev-parse -q --verify MERGE_HEAD >nul 2>&1
if not errorlevel 1 goto conflict
git fetch origin main
if errorlevel 1 goto failed
rem Guarda solamente la API, el informe y las eliminaciones pedidas.
git add -u
if errorlevel 1 goto failed
git add -- informe.html PUBLICAR.cmd prototypes/esp32-ollama-dice-reader/test/auto.test.js
if errorlevel 1 goto failed
git diff --cached --quiet
if errorlevel 1 (
 git commit -m "Actualiza la API y el informe IoT y elimina los archivos markdown"
 if errorlevel 1 goto failed
)
git merge --no-edit -m "Integra los cambios remotos antes de publicar el parcial" origin/main
if errorlevel 1 goto conflict
rem Verifica la API integrada antes de subirla.
call npm ci --prefix prototypes/esp32-ollama-dice-reader --cache prototypes/esp32-ollama-dice-reader/.npm-cache --no-audit --no-fund
if errorlevel 1 goto failed
call npm test --prefix prototypes/esp32-ollama-dice-reader
if errorlevel 1 goto failed
node prototypes/iot-material-inicial/build-report.mjs
if errorlevel 1 goto failed
git diff --exit-code -- prototypes/iot-material-inicial/informe.html
if errorlevel 1 goto failed
git ls-files "*.md" | findstr . >nul
if not errorlevel 1 goto markdown
rem Publica con la cuenta de Git de Windows, sin forzar cambios remotos.
git push origin main:main
if errorlevel 1 goto failed
echo PUBLICACION COMPLETADA EN Krayxzlim/Fragua.
git log -1 --oneline
goto end
:wrongbranch
echo La rama actual no es main. No se publico.
goto end
:conflict
echo Hay una integracion pendiente o un conflicto. Copia el mensaje para revisarlo.
goto end
:markdown
echo Quedan archivos markdown despues de integrar. No se publico.
goto end
:failed
echo No se completo la publicacion. Copia el error que aparece arriba.
:end
pause

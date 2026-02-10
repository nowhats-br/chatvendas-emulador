@echo off
echo ========================================
echo   ChatVendas - Iniciando Sistema
echo ========================================
echo.

REM Matar processos nas portas 3010 e 5173
echo Limpando portas...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3010') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Portas limpas!
echo.

REM Iniciar backend
echo Iniciando Backend (porta 3010)...
start "ChatVendas Backend" cmd /k "cd backend && npm start"

REM Aguardar 5 segundos
timeout /t 5 /nobreak >nul

REM Iniciar frontend
echo Iniciando Frontend (porta 5173)...
start "ChatVendas Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Sistema Iniciado!
echo ========================================
echo.
echo Backend: http://localhost:3010
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

REM Abrir navegador
start http://localhost:5173

echo.
echo Sistema rodando!
echo Nao feche as janelas do Backend e Frontend.
echo.
pause

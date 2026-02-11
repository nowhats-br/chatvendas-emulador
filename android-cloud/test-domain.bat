@echo off
REM Script para testar se o DOMAIN está configurado corretamente (Windows)

echo 🔍 Testando configuração do DOMAIN...
echo.

echo 1. Testando health check...
curl -s http://167.86.72.198:3011/health
echo.
echo.

echo 2. Listando instâncias...
curl -s http://167.86.72.198:3011/instances
echo.
echo.

echo 3. Verificando vncUrl...
curl -s http://167.86.72.198:3011/instances | findstr "localhost"
if %ERRORLEVEL% EQU 0 (
    echo ❌ PROBLEMA: Encontrado 'localhost' nas URLs!
    echo    Solução: Configure DOMAIN=167.86.72.198 no servidor
    echo.
    echo    Via SSH:
    echo    1. ssh root@167.86.72.198
    echo    2. cd /caminho/para/android-cloud
    echo    3. echo DOMAIN=167.86.72.198 ^> .env
    echo    4. docker-compose restart android-api
) else (
    echo ✅ OK: DOMAIN está configurado corretamente!
)

echo.
echo 🎯 Teste concluído!
pause

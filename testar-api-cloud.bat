@echo off
echo ========================================
echo  Testando API Android na Nuvem
echo ========================================
echo.

set API_URL=https://painel.nowhats.com.br:3011

echo Testando conexao com: %API_URL%
echo.

echo [1/3] Testando Health Check...
curl -k -s %API_URL%/health
echo.
echo.

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo  ERRO: Nao conseguiu conectar!
    echo ========================================
    echo.
    echo Possiveis causas:
    echo  1. Porta 3011 nao esta exposta no Easypanel
    echo  2. Firewall bloqueando
    echo  3. Servico nao esta rodando
    echo.
    echo Tente com HTTP ao inves de HTTPS:
    echo   http://painel.nowhats.com.br:3011/health
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Listando instancias...
curl -k -s %API_URL%/instances
echo.
echo.

echo [3/3] Testando criacao de instancia...
curl -k -s -X POST %API_URL%/create -H "Content-Type: application/json" -d "{\"name\":\"teste-windows\",\"profile\":\"med\"}"
echo.
echo.

echo ========================================
echo  Teste concluido!
echo ========================================
echo.
echo Se viu JSON acima, a API esta funcionando!
echo.
echo Agora:
echo  1. Feche o ChatVendas
echo  2. Abra novamente
echo  3. Va em "Emulador Android"
echo  4. Crie uma nova instancia
echo.
pause

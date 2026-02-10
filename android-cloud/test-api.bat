@echo off
REM Script para testar a API Android Cloud no Windows

echo 🧪 Testando API Android Cloud...
echo.

REM Configurar URL (edite se necessário)
set API_URL=http://localhost:3011
if not "%1"=="" set API_URL=%1

echo 📡 URL da API: %API_URL%
echo.

REM 1. Health Check
echo 1️⃣ Testando Health Check...
curl -s "%API_URL%/health"
if %errorlevel% equ 0 (
  echo ✅ API está respondendo!
) else (
  echo ❌ API não está respondendo!
  echo    Verifique se o container está rodando
  exit /b 1
)
echo.

REM 2. Listar Instâncias
echo 2️⃣ Listando instâncias existentes...
curl -s "%API_URL%/instances"
echo.
echo.

REM 3. Criar Instância de Teste
echo 3️⃣ Criando instância de teste...
curl -s -X POST "%API_URL%/create" -H "Content-Type: application/json" -d "{\"name\":\"test-windows\",\"profile\":\"med\"}"
echo.
echo.

REM 4. Listar Novamente
echo 4️⃣ Listando instâncias após criação...
curl -s "%API_URL%/instances"
echo.
echo.

echo ✅ Teste concluído!
echo.
echo 💡 Dicas:
echo    - Se a criação falhou, verifique os logs no Easypanel
echo    - Instâncias levam 2-5 minutos para inicializar completamente
echo    - Acesse o VNC em: http://seu-servidor:6081

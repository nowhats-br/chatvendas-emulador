#!/bin/bash

# Script para testar a API Android Cloud

echo "🧪 Testando API Android Cloud..."
echo ""

# Configurar URL (edite se necessário)
API_URL="${1:-http://localhost:3011}"

echo "📡 URL da API: $API_URL"
echo ""

# 1. Health Check
echo "1️⃣ Testando Health Check..."
HEALTH=$(curl -s "$API_URL/health")
if [ $? -eq 0 ]; then
  echo "✅ API está respondendo!"
  echo "   Resposta: $HEALTH"
else
  echo "❌ API não está respondendo!"
  echo "   Verifique se o container está rodando"
  exit 1
fi
echo ""

# 2. Listar Instâncias
echo "2️⃣ Listando instâncias existentes..."
INSTANCES=$(curl -s "$API_URL/instances")
echo "   Resposta: $INSTANCES"
echo ""

# 3. Criar Instância de Teste
echo "3️⃣ Criando instância de teste..."
CREATE=$(curl -s -X POST "$API_URL/create" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-'$(date +%s)'","profile":"med"}')
echo "   Resposta: $CREATE"
echo ""

# 4. Listar Novamente
echo "4️⃣ Listando instâncias após criação..."
INSTANCES2=$(curl -s "$API_URL/instances")
echo "   Resposta: $INSTANCES2"
echo ""

echo "✅ Teste concluído!"
echo ""
echo "💡 Dicas:"
echo "   - Se a criação falhou, verifique os logs: docker logs android-api"
echo "   - Instâncias levam 2-5 minutos para inicializar completamente"
echo "   - Acesse o VNC em: http://seu-servidor:6081 (porta incrementa a cada instância)"

#!/bin/bash

# Script para testar se o DOMAIN está configurado corretamente

echo "🔍 Testando configuração do DOMAIN..."
echo ""

# Testar health check
echo "1. Testando health check..."
HEALTH=$(curl -s http://167.86.72.198:3011/health)
echo "   Resposta: $HEALTH"
echo ""

# Listar instâncias
echo "2. Listando instâncias..."
INSTANCES=$(curl -s http://167.86.72.198:3011/instances)
echo "   Resposta: $INSTANCES"
echo ""

# Verificar se alguma instância tem localhost no vncUrl
if echo "$INSTANCES" | grep -q "localhost"; then
    echo "❌ PROBLEMA: Encontrado 'localhost' nas URLs!"
    echo "   Solução: Configure DOMAIN=167.86.72.198 no servidor"
    echo ""
    echo "   Via SSH:"
    echo "   1. ssh root@167.86.72.198"
    echo "   2. cd /caminho/para/android-cloud"
    echo "   3. echo 'DOMAIN=167.86.72.198' > .env"
    echo "   4. docker-compose restart android-api"
else
    echo "✅ OK: DOMAIN está configurado corretamente!"
fi

echo ""
echo "🎯 Teste concluído!"

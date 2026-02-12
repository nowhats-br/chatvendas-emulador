#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 INSTALAÇÃO COMPLETA - Android Cloud API + Portainer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================
# ETAPA 1: Instalar/Verificar Portainer
# ============================================================
echo "📦 [1/5] Verificando Portainer..."
if docker ps | grep -q portainer; then
    echo "✅ Portainer já está rodando"
else
    echo "🔄 Iniciando Portainer..."
    docker start portainer 2>/dev/null || {
        echo "📥 Instalando Portainer pela primeira vez..."
        docker volume create portainer_data
        docker run -d \
            -p 9000:9000 \
            -p 9443:9443 \
            --name portainer \
            --restart=always \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v portainer_data:/data \
            portainer/portainer-ce:latest
        
        echo "⏳ Aguardando Portainer iniciar (15s)..."
        sleep 15
        echo ""
        echo "⚠️  IMPORTANTE: Configure sua senha de admin no Portainer!"
        echo "   Acesse: http://167.86.72.198:9000"
        echo "   Crie um usuário admin antes de continuar"
        echo ""
        read -p "Pressione ENTER após configurar o Portainer..."
    }
fi

echo "✅ Portainer: http://167.86.72.198:9000"
echo ""

# ============================================================
# ETAPA 2: Preparar código
# ============================================================
echo "📂 [2/5] Preparando código..."
cd /root
if [ -d "chatvendas-emulador" ]; then
    echo "🔄 Atualizando repositório..."
    cd chatvendas-emulador
    git pull
else
    echo "📥 Clonando repositório..."
    git clone https://github.com/nowhats-br/chatvendas-emulador.git
    cd chatvendas-emulador
fi

cd android-cloud
echo "✅ Código pronto em: $(pwd)"
echo ""

# ============================================================
# ETAPA 3: Baixar imagem do Android (CRÍTICO!)
# ============================================================
echo "📥 [3/5] Baixando imagem do Android Emulator..."
echo "⚠️  Esta etapa pode demorar 5-10 minutos (~2GB)"
echo ""

if docker images | grep -q "budtmo/docker-android.*emulator_13.0"; then
    echo "✅ Imagem já existe localmente"
else
    echo "🔄 Baixando budtmo/docker-android:emulator_13.0..."
    docker pull budtmo/docker-android:emulator_13.0
    
    if [ $? -eq 0 ]; then
        echo "✅ Imagem baixada com sucesso!"
    else
        echo "❌ Erro ao baixar imagem. Verifique sua conexão."
        exit 1
    fi
fi
echo ""

# ============================================================
# ETAPA 4: Limpar containers antigos
# ============================================================
echo "🧹 [4/5] Limpando containers antigos..."
docker stop android-cloud-api 2>/dev/null
docker rm android-cloud-api 2>/dev/null
echo "✅ Limpeza concluída"
echo ""

# ============================================================
# ETAPA 5: Criar Stack no Portainer
# ============================================================
echo "📋 [5/5] Preparando Stack para Portainer..."
echo ""

# Criar arquivo de stack otimizado
cat > /root/chatvendas-emulador/android-cloud/portainer-stack.yml << 'EOF'
version: '3.8'

services:
  android-api:
    image: node:20-alpine
    container_name: android-cloud-api
    working_dir: /app
    
    command: sh -c "npm install && node server.js"
    
    ports:
      - "3011:3011"
    
    environment:
      NODE_ENV: production
      PORT: 3011
      DOMAIN: 167.86.72.198
    
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /root/chatvendas-emulador/android-cloud/api:/app
    
    restart: unless-stopped
    
    networks:
      - android-network

networks:
  android-network:
    driver: bridge
EOF

echo "✅ Stack criado: portainer-stack.yml"
echo ""

# ============================================================
# INSTRUÇÕES FINAIS
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PREPARAÇÃO CONCLUÍDA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Portainer: http://167.86.72.198:9000"
echo "📁 Stack: /root/chatvendas-emulador/android-cloud/portainer-stack.yml"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PRÓXIMOS PASSOS NO PORTAINER:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Acesse: http://167.86.72.198:9000"
echo ""
echo "2. Faça login com suas credenciais"
echo ""
echo "3. Clique em 'local' (seu ambiente Docker)"
echo ""
echo "4. No menu lateral, clique em 'Stacks'"
echo ""
echo "5. Clique em '+ Add stack'"
echo ""
echo "6. Configure:"
echo "   - Name: android-cloud-api"
echo "   - Build method: Web editor"
echo "   - Copie o conteúdo de: portainer-stack.yml"
echo ""
echo "7. Clique em 'Deploy the stack'"
echo ""
echo "8. Aguarde ~30 segundos para a API iniciar"
echo ""
echo "9. Teste: http://167.86.72.198:3011/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 ALTERNATIVA RÁPIDA (Deploy direto via Docker):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Se preferir deploy imediato sem Portainer UI:"
echo ""
echo "docker run -d \\"
echo "  --name android-cloud-api \\"
echo "  --restart unless-stopped \\"
echo "  -p 3011:3011 \\"
echo "  -v /var/run/docker.sock:/var/run/docker.sock:ro \\"
echo "  -v /root/chatvendas-emulador/android-cloud/api:/app \\"
echo "  -w /app \\"
echo "  -e NODE_ENV=production \\"
echo "  -e PORT=3011 \\"
echo "  -e DOMAIN=167.86.72.198 \\"
echo "  node:20-alpine \\"
echo "  sh -c 'npm install && node server.js'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

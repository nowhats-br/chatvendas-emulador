#!/bin/bash

echo "🚀 Instalando Android Cloud API via Portainer..."
echo ""

# 1. Garantir que Portainer está rodando
echo "📦 Verificando Portainer..."
if docker ps | grep -q portainer; then
    echo "✅ Portainer já está rodando"
else
    echo "🔄 Iniciando Portainer..."
    docker start portainer 2>/dev/null || {
        echo "📥 Instalando Portainer..."
        docker volume create portainer_data
        docker run -d -p 9000:9000 --name portainer --restart=always \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v portainer_data:/data \
            portainer/portainer-ce:latest
    }
    echo "⏳ Aguardando Portainer iniciar (10s)..."
    sleep 10
fi

echo ""
echo "✅ Portainer está rodando em: http://167.86.72.198:9000"
echo ""

# 2. Clonar repositório se não existir
echo "📂 Preparando código..."
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

# 3. Parar containers antigos
echo ""
echo "🛑 Parando containers antigos..."
docker-compose down 2>/dev/null
docker stop android-cloud-api 2>/dev/null
docker rm android-cloud-api 2>/dev/null

# 4. Subir com docker-compose
echo ""
echo "🚀 Iniciando Android Cloud API..."
docker-compose up -d

# 5. Verificar se está rodando
echo ""
echo "⏳ Aguardando API iniciar (5s)..."
sleep 5

if docker ps | grep -q android-cloud-api; then
    echo "✅ API está rodando!"
    echo ""
    docker ps | grep android-cloud-api
    echo ""
    
    # Testar API
    echo "🧪 Testando API..."
    if curl -s http://167.86.72.198:3011/health | grep -q "ok"; then
        echo "✅ API respondendo corretamente!"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📊 Portainer: http://167.86.72.198:9000"
        echo "🌐 API: http://167.86.72.198:3011"
        echo "🧪 Health: http://167.86.72.198:3011/health"
        echo ""
        echo "Próximos passos:"
        echo "1. Acesse o Portainer para gerenciar containers"
        echo "2. Inicie o ChatVendas: npm run electron:dev"
        echo "3. Crie devices Android na nuvem!"
        echo ""
    else
        echo "⚠️  API não está respondendo. Verificando logs..."
        docker logs android-cloud-api --tail 20
    fi
else
    echo "❌ Erro ao iniciar API. Verificando logs..."
    docker logs android-cloud-api --tail 20
fi

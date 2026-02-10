#!/bin/bash

# 🚀 Script de Instalação Automática - Android Emulator
# Instala todas as dependências necessárias para o sistema funcionar

set -e

echo "🚀 Iniciando instalação das dependências do Android Emulator..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detectar sistema operacional
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="debian"
            log_info "Sistema detectado: Debian/Ubuntu"
        elif [ -f /etc/redhat-release ]; then
            OS="redhat"
            log_info "Sistema detectado: RedHat/CentOS/Fedora"
        else
            OS="linux"
            log_info "Sistema detectado: Linux genérico"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        log_info "Sistema detectado: macOS"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        log_info "Sistema detectado: Windows"
    else
        OS="unknown"
        log_warning "Sistema operacional não reconhecido: $OSTYPE"
    fi
}

# Verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências existentes
check_existing_dependencies() {
    log_info "Verificando dependências existentes..."
    
    # QEMU
    if command_exists qemu-system-x86_64; then
        QEMU_VERSION=$(qemu-system-x86_64 --version | head -n1)
        log_success "QEMU já instalado: $QEMU_VERSION"
        QEMU_INSTALLED=true
    else
        log_warning "QEMU não encontrado"
        QEMU_INSTALLED=false
    fi
    
    # websockify
    if command_exists websockify; then
        WEBSOCKIFY_VERSION=$(websockify --version 2>&1 | head -n1)
        log_success "websockify já instalado: $WEBSOCKIFY_VERSION"
        WEBSOCKIFY_INSTALLED=true
    else
        log_warning "websockify não encontrado"
        WEBSOCKIFY_INSTALLED=false
    fi
    
    # ADB
    if command_exists adb; then
        ADB_VERSION=$(adb version | head -n1)
        log_success "ADB já instalado: $ADB_VERSION"
        ADB_INSTALLED=true
    else
        log_warning "ADB não encontrado"
        ADB_INSTALLED=false
    fi
    
    # Git
    if command_exists git; then
        GIT_VERSION=$(git --version)
        log_success "Git já instalado: $GIT_VERSION"
        GIT_INSTALLED=true
    else
        log_warning "Git não encontrado"
        GIT_INSTALLED=false
    fi
    
    # Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        log_success "Node.js já instalado: $NODE_VERSION"
        NODE_INSTALLED=true
    else
        log_warning "Node.js não encontrado"
        NODE_INSTALLED=false
    fi
    
    # Python (para websockify)
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        log_success "Python3 já instalado: $PYTHON_VERSION"
        PYTHON_INSTALLED=true
    else
        log_warning "Python3 não encontrado"
        PYTHON_INSTALLED=false
    fi
}

# Instalar dependências no Debian/Ubuntu
install_debian() {
    log_info "Instalando dependências no Debian/Ubuntu..."
    
    # Atualizar repositórios
    log_info "Atualizando repositórios..."
    sudo apt-get update
    
    # Instalar QEMU
    if [ "$QEMU_INSTALLED" = false ]; then
        log_info "Instalando QEMU..."
        sudo apt-get install -y qemu-system-x86 qemu-utils qemu-kvm libvirt-daemon-system
        log_success "QEMU instalado"
    fi
    
    # Instalar Python e pip
    if [ "$PYTHON_INSTALLED" = false ]; then
        log_info "Instalando Python3..."
        sudo apt-get install -y python3 python3-pip
        log_success "Python3 instalado"
    fi
    
    # Instalar websockify
    if [ "$WEBSOCKIFY_INSTALLED" = false ]; then
        log_info "Instalando websockify..."
        sudo apt-get install -y websockify || {
            log_warning "websockify não disponível via apt, instalando via pip..."
            sudo pip3 install websockify
        }
        log_success "websockify instalado"
    fi
    
    # Instalar ADB
    if [ "$ADB_INSTALLED" = false ]; then
        log_info "Instalando ADB..."
        sudo apt-get install -y android-tools-adb
        log_success "ADB instalado"
    fi
    
    # Instalar Git
    if [ "$GIT_INSTALLED" = false ]; then
        log_info "Instalando Git..."
        sudo apt-get install -y git
        log_success "Git instalado"
    fi
    
    # Instalar Node.js
    if [ "$NODE_INSTALLED" = false ]; then
        log_info "Instalando Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        log_success "Node.js instalado"
    fi
    
    # Instalar dependências adicionais
    log_info "Instalando dependências adicionais..."
    sudo apt-get install -y build-essential curl wget unzip
}

# Instalar dependências no RedHat/CentOS/Fedora
install_redhat() {
    log_info "Instalando dependências no RedHat/CentOS/Fedora..."
    
    # Detectar gerenciador de pacotes
    if command_exists dnf; then
        PKG_MANAGER="dnf"
    elif command_exists yum; then
        PKG_MANAGER="yum"
    else
        log_error "Gerenciador de pacotes não encontrado"
        exit 1
    fi
    
    # Instalar QEMU
    if [ "$QEMU_INSTALLED" = false ]; then
        log_info "Instalando QEMU..."
        sudo $PKG_MANAGER install -y qemu-kvm qemu-img libvirt
        log_success "QEMU instalado"
    fi
    
    # Instalar Python e pip
    if [ "$PYTHON_INSTALLED" = false ]; then
        log_info "Instalando Python3..."
        sudo $PKG_MANAGER install -y python3 python3-pip
        log_success "Python3 instalado"
    fi
    
    # Instalar websockify
    if [ "$WEBSOCKIFY_INSTALLED" = false ]; then
        log_info "Instalando websockify..."
        sudo pip3 install websockify
        log_success "websockify instalado"
    fi
    
    # Instalar Git
    if [ "$GIT_INSTALLED" = false ]; then
        log_info "Instalando Git..."
        sudo $PKG_MANAGER install -y git
        log_success "Git instalado"
    fi
    
    # Instalar Node.js
    if [ "$NODE_INSTALLED" = false ]; then
        log_info "Instalando Node.js..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo $PKG_MANAGER install -y nodejs
        log_success "Node.js instalado"
    fi
    
    # ADB precisa ser instalado manualmente no RedHat
    if [ "$ADB_INSTALLED" = false ]; then
        log_warning "ADB precisa ser instalado manualmente no RedHat/CentOS"
        log_info "Baixando Android SDK Platform Tools..."
        
        cd /tmp
        wget https://dl.google.com/android/repository/platform-tools-latest-linux.zip
        unzip platform-tools-latest-linux.zip
        sudo mv platform-tools /opt/
        sudo ln -sf /opt/platform-tools/adb /usr/local/bin/adb
        
        log_success "ADB instalado"
    fi
}

# Instalar dependências no macOS
install_macos() {
    log_info "Instalando dependências no macOS..."
    
    # Verificar se Homebrew está instalado
    if ! command_exists brew; then
        log_info "Instalando Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        log_success "Homebrew instalado"
    fi
    
    # Instalar QEMU
    if [ "$QEMU_INSTALLED" = false ]; then
        log_info "Instalando QEMU..."
        brew install qemu
        log_success "QEMU instalado"
    fi
    
    # Instalar websockify
    if [ "$WEBSOCKIFY_INSTALLED" = false ]; then
        log_info "Instalando websockify..."
        pip3 install websockify || brew install websockify
        log_success "websockify instalado"
    fi
    
    # Instalar ADB
    if [ "$ADB_INSTALLED" = false ]; then
        log_info "Instalando ADB..."
        brew install android-platform-tools
        log_success "ADB instalado"
    fi
    
    # Instalar Git
    if [ "$GIT_INSTALLED" = false ]; then
        log_info "Instalando Git..."
        brew install git
        log_success "Git instalado"
    fi
    
    # Instalar Node.js
    if [ "$NODE_INSTALLED" = false ]; then
        log_info "Instalando Node.js..."
        brew install node
        log_success "Node.js instalado"
    fi
}

# Instalar noVNC
install_novnc() {
    log_info "Instalando noVNC..."
    
    NOVNC_DIR="/usr/share/novnc"
    
    if [ -d "$NOVNC_DIR" ]; then
        log_success "noVNC já instalado em $NOVNC_DIR"
        return
    fi
    
    # Criar diretório
    sudo mkdir -p /usr/share
    
    # Clonar repositório
    sudo git clone https://github.com/novnc/noVNC.git $NOVNC_DIR
    
    # Criar symlink para vnc.html
    cd $NOVNC_DIR
    sudo ln -sf vnc.html index.html
    
    log_success "noVNC instalado em $NOVNC_DIR"
}

# Configurar permissões e grupos
configure_permissions() {
    log_info "Configurando permissões..."
    
    # Adicionar usuário ao grupo kvm (Linux)
    if [ "$OS" = "debian" ] || [ "$OS" = "redhat" ] || [ "$OS" = "linux" ]; then
        if [ -c /dev/kvm ]; then
            sudo usermod -a -G kvm $USER
            log_success "Usuário adicionado ao grupo kvm"
            log_warning "IMPORTANTE: Faça logout e login novamente para aplicar as permissões"
        else
            log_warning "KVM não disponível em /dev/kvm"
        fi
    fi
    
    # Criar diretórios necessários
    log_info "Criando diretórios necessários..."
    
    mkdir -p emulator-data/{android-images,virtual-disks,configs,logs,screenshots}
    sudo mkdir -p /tmp/vnc_tokens
    sudo chmod 755 /tmp/vnc_tokens
    
    log_success "Diretórios criados"
}

# Verificar instalação
verify_installation() {
    log_info "Verificando instalação..."
    
    ERRORS=0
    
    # Verificar QEMU
    if command_exists qemu-system-x86_64; then
        QEMU_VERSION=$(qemu-system-x86_64 --version | head -n1)
        log_success "✅ QEMU: $QEMU_VERSION"
    else
        log_error "❌ QEMU não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Verificar websockify
    if command_exists websockify; then
        WEBSOCKIFY_VERSION=$(websockify --version 2>&1 | head -n1)
        log_success "✅ websockify: $WEBSOCKIFY_VERSION"
    else
        log_error "❌ websockify não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Verificar ADB
    if command_exists adb; then
        ADB_VERSION=$(adb version | head -n1)
        log_success "✅ ADB: $ADB_VERSION"
    else
        log_error "❌ ADB não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Verificar Git
    if command_exists git; then
        GIT_VERSION=$(git --version)
        log_success "✅ Git: $GIT_VERSION"
    else
        log_error "❌ Git não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Verificar Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        log_success "✅ Node.js: $NODE_VERSION"
    else
        log_error "❌ Node.js não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Verificar noVNC
    if [ -d "/usr/share/novnc" ]; then
        log_success "✅ noVNC instalado"
    else
        log_error "❌ noVNC não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Verificar KVM (Linux apenas)
    if [ "$OS" = "debian" ] || [ "$OS" = "redhat" ] || [ "$OS" = "linux" ]; then
        if [ -c /dev/kvm ]; then
            log_success "✅ KVM disponível"
        else
            log_warning "⚠️  KVM não disponível (performance reduzida)"
        fi
    fi
    
    return $ERRORS
}

# Instalar dependências npm
install_npm_dependencies() {
    log_info "Instalando dependências npm..."
    
    # Backend
    if [ -d "backend" ]; then
        log_info "Instalando dependências do backend..."
        cd backend
        npm install
        cd ..
        log_success "Dependências do backend instaladas"
    fi
    
    # Frontend
    if [ -f "package.json" ]; then
        log_info "Instalando dependências do frontend..."
        npm install
        log_success "Dependências do frontend instaladas"
    fi
}

# Criar script de teste
create_test_script() {
    log_info "Criando script de teste..."
    
    cat > test-emulator.sh << 'EOF'
#!/bin/bash

echo "🧪 Testando Android Emulator..."

# Testar QEMU
echo "Testando QEMU..."
qemu-system-x86_64 --version

# Testar websockify
echo "Testando websockify..."
websockify --version

# Testar ADB
echo "Testando ADB..."
adb version

# Testar noVNC
echo "Testando noVNC..."
ls -la /usr/share/novnc/

# Testar KVM
if [ -c /dev/kvm ]; then
    echo "✅ KVM disponível"
else
    echo "⚠️  KVM não disponível"
fi

echo "✅ Todos os testes concluídos!"
EOF

    chmod +x test-emulator.sh
    log_success "Script de teste criado: ./test-emulator.sh"
}

# Função principal
main() {
    echo "🚀 Android Emulator - Instalação de Dependências"
    echo "================================================"
    
    # Detectar sistema operacional
    detect_os
    
    # Verificar dependências existentes
    check_existing_dependencies
    
    # Instalar dependências baseado no OS
    case $OS in
        "debian")
            install_debian
            ;;
        "redhat")
            install_redhat
            ;;
        "macos")
            install_macos
            ;;
        "windows")
            log_error "Windows não suportado por este script"
            log_info "Para Windows, use WSL2 ou instale manualmente:"
            log_info "- QEMU: https://www.qemu.org/download/"
            log_info "- Python: https://www.python.org/downloads/"
            log_info "- websockify: pip install websockify"
            log_info "- ADB: Android SDK Platform Tools"
            exit 1
            ;;
        *)
            log_error "Sistema operacional não suportado: $OS"
            exit 1
            ;;
    esac
    
    # Instalar noVNC
    install_novnc
    
    # Configurar permissões
    configure_permissions
    
    # Instalar dependências npm
    install_npm_dependencies
    
    # Criar script de teste
    create_test_script
    
    # Verificar instalação
    echo ""
    echo "🔍 Verificação Final"
    echo "==================="
    
    if verify_installation; then
        echo ""
        log_success "🎉 Instalação concluída com sucesso!"
        echo ""
        echo "📋 Próximos passos:"
        echo "1. Execute: ./test-emulator.sh"
        echo "2. Inicie o backend: cd backend && npm start"
        echo "3. Inicie o frontend: npm run dev"
        echo "4. Acesse: http://localhost:5173"
        echo ""
        echo "⚠️  IMPORTANTE:"
        echo "- Faça logout/login para aplicar permissões KVM"
        echo "- Baixe uma imagem Android-x86 para testar"
        echo "- Configure firewall se necessário"
        echo ""
    else
        echo ""
        log_error "❌ Instalação concluída com erros"
        echo "Verifique os logs acima e instale manualmente as dependências faltantes"
        exit 1
    fi
}

# Executar função principal
main "$@"
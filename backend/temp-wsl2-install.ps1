
# Script de instalação WSL2
Write-Host "Instalando WSL2..." -ForegroundColor Cyan

try {
    # Habilitar WSL
    Write-Host "Habilitando WSL..." -ForegroundColor Yellow
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart | Out-Null
    
    # Habilitar Plataforma de Máquina Virtual
    Write-Host "Habilitando Plataforma de Máquina Virtual..." -ForegroundColor Yellow
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart | Out-Null
    
    # Definir WSL2 como padrão
    Write-Host "Configurando WSL2 como padrão..." -ForegroundColor Yellow
    wsl --set-default-version 2 | Out-Null
    
    Write-Host "WSL2_INSTALL_SUCCESS" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "WSL2_INSTALL_ERROR: $_" -ForegroundColor Red
    exit 1
}

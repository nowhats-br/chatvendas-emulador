
# Script de instalação Ubuntu - Método Robusto
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalação Ubuntu WSL2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Limpar instalações anteriores corrompidas
    Write-Host "Verificando instalações anteriores..." -ForegroundColor Yellow
    $distros = wsl --list --verbose
    
    foreach ($line in $distros -split "\n") {
        if ($line -match "Ubuntu" -and ($line -match "Stopped" -or $line -match "Installing")) {
            $distroName = ($line -replace "\*", "").Trim() -split "\s+" | Select-Object -First 1
            Write-Host "Removendo instalação corrompida: $distroName" -ForegroundColor Yellow
            wsl --unregister $distroName 2>$null
        }
    }
    
    Write-Host ""
    Write-Host "Instalando Ubuntu 22.04..." -ForegroundColor Cyan
    Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Gray
    Write-Host ""
    
    # Instalar sem inicializar automaticamente
    wsl --install -d Ubuntu-22.04 --no-launch
    
    # Aguardar registro
    Start-Sleep -Seconds 5
    
    # Verificar se foi instalado
    $installed = wsl --list | Select-String "Ubuntu"
    
    if ($installed) {
        Write-Host ""
        Write-Host "✅ Ubuntu instalado com sucesso!" -ForegroundColor Green
        Write-Host "UBUNTU_INSTALL_SUCCESS" -ForegroundColor Green
        exit 0
    } else {
        Write-Host ""
        Write-Host "⚠️  Ubuntu não foi registrado, tentando método alternativo..." -ForegroundColor Yellow
        
        # Método alternativo: winget
        winget install Canonical.Ubuntu.2204 --accept-package-agreements --accept-source-agreements --silent
        
        Start-Sleep -Seconds 5
        
        $installed = wsl --list | Select-String "Ubuntu"
        
        if ($installed) {
            Write-Host "✅ Ubuntu instalado via winget!" -ForegroundColor Green
            Write-Host "UBUNTU_INSTALL_SUCCESS" -ForegroundColor Green
            exit 0
        } else {
            throw "Ubuntu não foi instalado corretamente"
        }
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ ERRO: $_" -ForegroundColor Red
    Write-Host "UBUNTU_INSTALL_ERROR: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando Sistema de RH..." -ForegroundColor Green

# Verifica se o Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js não encontrado. Por favor instale o Node.js."
    exit 1
}

# Funcao auxiliar para rodar npm cross-platform
function Run-Npm {
    param(
        [string]$Path,
        [string]$Args
    )
    if ($IsLinux -or $IsMacOS) {
        Start-Process -NoNewWindow -FilePath "npm" -ArgumentList $Args -WorkingDirectory $Path
    }
    else {
        Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c npm $Args" -WorkingDirectory $Path
    }
}

# Build do Backend (necessario para o dist/main)
Write-Host "Construindo Backend..." -ForegroundColor Yellow
if ($IsLinux -or $IsMacOS) {
    Start-Process -Wait -FilePath "npm" -ArgumentList "run build" -WorkingDirectory "backend"
}
else {
    Start-Process -Wait -FilePath "cmd.exe" -ArgumentList "/c npm run build" -WorkingDirectory "backend"
}

# Inicia o Backend (NestJS) em segundo plano
Write-Host "Iniciando Backend..." -ForegroundColor Yellow
Run-Npm -Path "backend" -Args "run start:dev"

# Inicia o Frontend (Next.js) em segundo plano
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Run-Npm -Path "frontend" -Args "run dev"

Write-Host "Sistema iniciado!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:3001"
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

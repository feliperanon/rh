Write-Host "Iniciando Sistema de RH..." -ForegroundColor Green

# Verifica se o Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js não encontrado. Por favor instale o Node.js."
    exit 1
}

$npmCmd = "npm.cmd"
if ($IsLinux -or $IsMacOS) {
    $npmCmd = "npm"
}

# Build do Backend (necessario para o dist/main)
Write-Host "Construindo Backend..." -ForegroundColor Yellow
Start-Process -Wait -NoNewWindow -FilePath $npmCmd -ArgumentList "install" -WorkingDirectory "backend"
Start-Process -Wait -NoNewWindow -FilePath $npmCmd -ArgumentList "run build" -WorkingDirectory "backend"

# Inicia o Backend (NestJS) em segundo plano
Write-Host "Iniciando Backend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath $npmCmd -ArgumentList "run start:dev" -WorkingDirectory "backend"

# Inicia o Frontend (Next.js) em segundo plano
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath $npmCmd -ArgumentList "run dev" -WorkingDirectory "frontend"

Write-Host "Sistema iniciado!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:3001"
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

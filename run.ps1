Write-Host "Iniciando Sistema de RH..." -ForegroundColor Green

# Verifica se o Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js não encontrado. Por favor instale o Node.js."
    exit 1
}

# Inicia o Backend (NestJS) em segundo plano
Write-Host "Iniciando Backend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run start:dev" -WorkingDirectory "backend"

# Inicia o Frontend (Next.js) em segundo plano
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "frontend"

Write-Host "Sistema iniciado!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:3001"
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

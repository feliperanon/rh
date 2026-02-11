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

# Limpa cache de build antigo para evitar erros
Write-Host "Limpando cache de build..." -ForegroundColor Yellow
if (Test-Path "backend/tsconfig.build.tsbuildinfo") { Remove-Item "backend/tsconfig.build.tsbuildinfo" -Force }
if (Test-Path "backend/tsconfig.tsbuildinfo") { Remove-Item "backend/tsconfig.tsbuildinfo" -Force }

# Build do Backend (necessario para o dist/main)
Write-Host "Construindo Backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Push-Location $backendPath
try {
    & $npmCmd install
    & $npmCmd run build
    if (-not (Test-Path "dist/main.js")) {
        Write-Error "Build falhou: dist/main.js nao foi criado. Execute manualmente em backend: npm run build"
        exit 1
    }
    Write-Host "Build concluido. dist/main.js encontrado." -ForegroundColor Green
} finally {
    Pop-Location
}

# Inicia o Backend (NestJS) em segundo plano
Write-Host "Iniciando Backend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath $npmCmd -ArgumentList "run start:dev" -WorkingDirectory $backendPath

# Inicia o Frontend (Next.js) em segundo plano
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath $npmCmd -ArgumentList "run dev" -WorkingDirectory "frontend"

Write-Host "Sistema iniciado!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:3001"
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

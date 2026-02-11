param(
    [string] = 
)

if (-not ) {
    Write-Error 'Informe a DATABASE_URL via parâmetro ou variável de ambiente antes de rodar.'
    exit 1
}

Write-Host  Usando DATABASE_URL=
 = 

function Run-Step(, ) {
    Write-Host \n=== ===
    Invoke-Expression 
}

Run-Step 'Gerar Prisma Client' 'npx prisma generate'
Run-Step 'Aplicar migrações' 'npx prisma migrate deploy'
Run-Step 'Gerar seed' 'npx prisma db seed'

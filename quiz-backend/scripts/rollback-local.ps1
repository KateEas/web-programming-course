# scripts/rollback-local.ps1
param(
    [string]$PreviousTag
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "    LOCAL ROLLBACK" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if (-not $PreviousTag) {
    # Show available tags
    Write-Host "Available tags:" -ForegroundColor Yellow
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | findstr "quiz-backend"
    
    $PreviousTag = Read-Host "'nEnter tag to rollback to"
}

# 1. Update docker-compose.yml with previous tag
Write-Host "'n1. Rolling back to tag: $PreviousTag" -ForegroundColor Yellow
$composeFile = "docker-compose.yml"
$composeContent = Get-Content $composeFile -Raw
$composeContent = $composeContent -replace 'image: quiz-backend:.*', "image: quiz-backend:$PreviousTag"
$composeContent | Set-Content $composeFile
Write-Host "docker-compose.yml updated" -ForegroundColor Green

# 2. Restart containers
Write-Host "'n2. Restarting containers..." -ForegroundColor Yellow
docker compose down
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start containers" -ForegroundColor Red
    exit 1
}
Write-Host "Containers started" -ForegroundColor Green

# 3. Smoke-check after rollback
Write-Host "'n3. Running smoke-check after rollback..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxRetries = 10
$retryCount = 0
$healthOk = $false

while ($retryCount -lt $maxRetries -and -not $healthOk) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $healthOk = $true
            Write-Host "Health check passed" -ForegroundColor Green
        }
    } catch {
        Write-Host "Attempt $($retryCount + 1): server not ready yet" -ForegroundColor Yellow
    }
    $retryCount++
    if (-not $healthOk) {
        Start-Sleep -Seconds 2
    }
}

if (-not $healthOk) {
    Write-Host "Smoke-check failed" -ForegroundColor Red
    docker compose logs backend
    exit 1
}

Write-Host "'n=====================================" -ForegroundColor Cyan
Write-Host "ROLLBACK COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
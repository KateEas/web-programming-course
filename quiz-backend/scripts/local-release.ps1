# scripts/local-release.ps1
param(
    [string]$Tag = "release-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "    LOCAL RELEASE" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Release tag: $Tag" -ForegroundColor Yellow

# 1. Build new image with tag
Write-Host "'n1. Building Docker image..." -ForegroundColor Yellow
docker build -t quiz-backend:$Tag .
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED to build image" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Image built: quiz-backend:$Tag" -ForegroundColor Green

# 2. Update docker-compose.yml with new tag
Write-Host "'n2. Updating docker-compose.yml..." -ForegroundColor Yellow
$composeFile = "docker-compose.yml"
$composeContent = Get-Content $composeFile -Raw
$composeContent = $composeContent -replace 'image: quiz-backend:.*', "image: quiz-backend:$Tag"
$composeContent | Set-Content $composeFile
Write-Host "OK: docker-compose.yml updated" -ForegroundColor Green

# 3. Start containers
Write-Host "'n3. Starting containers..." -ForegroundColor Yellow
docker compose down
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED to start containers" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Containers started" -ForegroundColor Green

# 4. Smoke-check (health endpoint)
Write-Host "'n4. Running smoke-check..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxRetries = 10
$retryCount = 0
$healthOk = $false

while ($retryCount -lt $maxRetries -and -not $healthOk) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $healthOk = $true
            Write-Host "OK: Health check passed (status: $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "Attempt $($retryCount + 1): status $($response.StatusCode)" -ForegroundColor Yellow
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
    Write-Host "FAILED: Smoke-check failed" -ForegroundColor Red
    docker compose logs backend
    exit 1
}

# 5. Additional API check (optional)
Write-Host "'n5. Checking API..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/questions" -UseBasicParsing
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "OK: API is responding correctly" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: API returned an error, but server is running" -ForegroundColor Yellow
}

Write-Host "'n=====================================" -ForegroundColor Cyan
Write-Host "RELEASE COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Release information:"
Write-Host "   - Tag: $Tag"
Write-Host "   - Time: $(Get-Date)"
Write-Host "   - Server: http://localhost:3000"
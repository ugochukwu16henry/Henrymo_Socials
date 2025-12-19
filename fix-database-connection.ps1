# Database Connection Fix Script for Windows
# This script helps diagnose and fix database connection issues

Write-Host "=== Database Connection Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "1. Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1 | Select-String -Pattern "CONTAINER|Up"
if ($dockerRunning) {
    Write-Host "   ✅ Docker is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Docker is not running!" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

# Check PostgreSQL container
Write-Host "2. Checking PostgreSQL container..." -ForegroundColor Yellow
$pgRunning = docker ps --filter "name=henrymo_postgres" --format "{{.Status}}" 2>&1
if ($pgRunning -match "Up") {
    Write-Host "   ✅ PostgreSQL container is running: $pgRunning" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Starting PostgreSQL..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Start-Sleep -Seconds 10
}

# Test connection from inside container
Write-Host "3. Testing database from inside container..." -ForegroundColor Yellow
$testResult = docker exec henrymo_postgres psql -U postgres -d henrymo_socials -c "SELECT 1;" 2>&1
if ($testResult -match "1 row") {
    Write-Host "   ✅ Database is accessible from inside container" -ForegroundColor Green
} else {
    Write-Host "   ❌ Database issue detected" -ForegroundColor Red
    Write-Host "   Output: $testResult" -ForegroundColor Yellow
}

# Check port accessibility
Write-Host "4. Checking port 5432 accessibility..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName 127.0.0.1 -Port 5432 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($portTest) {
    Write-Host "   ✅ Port 5432 is accessible" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 5432 is NOT accessible" -ForegroundColor Red
    Write-Host "   This indicates a Docker networking issue" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== RECOMMENDED ACTION ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If connection is still failing:" -ForegroundColor Yellow
Write-Host "  1. Close Docker Desktop completely" -ForegroundColor White
Write-Host "  2. Wait 10 seconds" -ForegroundColor White
Write-Host "  3. Restart Docker Desktop" -ForegroundColor White
Write-Host "  4. Run this script again" -ForegroundColor White
Write-Host ""
Write-Host "Alternative: Use the Docker network IP" -ForegroundColor Yellow
Write-Host "  Get IP: docker inspect henrymo_postgres | Select-String 'IPAddress'" -ForegroundColor White
Write-Host "  Update backend/.env DATABASE_URL to use that IP" -ForegroundColor White
Write-Host ""


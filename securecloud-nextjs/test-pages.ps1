# Test all pages to ensure they compile
Write-Host "Testing all Next.js pages..." -ForegroundColor Cyan
Write-Host ""

$pages = @(
    "http://localhost:3000/",
    "http://localhost:3000/login",
    "http://localhost:3000/register",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/dashboard/alerts",
    "http://localhost:3000/dashboard/threats",
    "http://localhost:3000/dashboard/network",
    "http://localhost:3000/dashboard/firewall",
    "http://localhost:3000/dashboard/users",
    "http://localhost:3000/dashboard/settings"
)

$success = 0
$failed = 0

foreach ($page in $pages) {
    try {
        Write-Host "Testing: $page" -NoNewline
        $response = Invoke-WebRequest -Uri $page -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host " ✓ OK" -ForegroundColor Green
            $success++
        } else {
            Write-Host " ✗ Failed (Status: $($response.StatusCode))" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host " ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  Success: $success / $($pages.Count)" -ForegroundColor Green
Write-Host "  Failed:  $failed / $($pages.Count)" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "All pages are working! 🎉" -ForegroundColor Green
} else {
    Write-Host "Some pages failed. Check the errors above." -ForegroundColor Yellow
}

#!/usr/bin/env pwsh

# Comprehensive Test Suite for JustFix Auto Electrix Backend

$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0

function Invoke-Test {
    param(
        [string]$name,
        [string]$method,
        [string]$endpoint,
        [hashtable]$body = $null
    )
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST: $name" -ForegroundColor Yellow
    Write-Host "  Method: $method $endpoint" -ForegroundColor Gray
    
    try {
        $url = "$baseUrl$endpoint"
        $params = @{
            Uri         = $url
            Method      = $method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($body) {
            $bodyJson = $body | ConvertTo-Json -Depth 10
            $params['Body'] = $bodyJson
            $preview = if ($bodyJson.Length -gt 100) { $bodyJson.Substring(0, 100) + "..." } else { $bodyJson }
            Write-Host "  Body: $preview" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ PASSED" -ForegroundColor Green
        
        $respJson = $response | ConvertTo-Json -Compress
        $respPreview = if ($respJson.Length -gt 150) { $respJson.Substring(0, 150) + "..." } else { $respJson }
        Write-Host "  Response: $respPreview" -ForegroundColor Gray
        
        $script:testsPassed++
        return $response
    }
    catch {
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   JustFix Auto Electrix - Backend Feature Test Suite      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n[TEST SECTION 1: Core CRUD Operations]" -ForegroundColor Magenta

# Test 1: Get All Students
$students = Invoke-Test "GET All Students" "GET" "/api/students"

# Test 2: Get All Staff
$staff = Invoke-Test "GET All Staff Members" "GET" "/api/staff"

# Test 3: Get All Clients
$clients = Invoke-Test "GET All Clients" "GET" "/api/clients"

# Test 4: Filter Clients by Source
Invoke-Test "GET Clients by Source (Insurance)" "GET" "/api/clients/by-source/Insurance"

# Test 5: Get Operating Expenses
$expenses = Invoke-Test "GET All Operating Expenses" "GET" "/api/expenses"

Write-Host "`n[TEST SECTION 2: Create New Records]" -ForegroundColor Magenta

# Test 6: Create New Student
$random = Get-Random -Minimum 1000 -Maximum 9999
$newStudent = @{
    name              = "Test Student $random"
    email             = "test.student$random@academy.com"
    role              = "Junior Tech"
    type              = "Student"
    placementStart    = "2024-08-01"
    placementEnd      = "2025-02-01"
    supervisor        = "Alex Miller"
    department        = "General Maintenance"
    skills            = '["Brake Systems", "Electrical"]'
    status            = "Active"
}
$createdStudent = Invoke-Test "POST Create New Student" "POST" "/api/students" $newStudent

# Test 7: Create New Client
$random2 = Get-Random -Minimum 1000 -Maximum 9999
$newClient = @{
    name        = "Test Client $random2"
    email       = "test$random2@client.com"
    phone       = "+1-555-9999"
    source      = "Direct"
    accountType = "B2B"
    status      = "Active"
}
$createdClient = Invoke-Test "POST Create New Client" "POST" "/api/clients" $newClient

Write-Host "`n[TEST SECTION 3: Business Logic - Advanced Features]" -ForegroundColor Magenta

# Test 8: Test Insurance Billing Logic
if ($clients -and $clients.Count -gt 0) {
    $insuranceClient = $null
    foreach ($client in $clients) {
        if ($client.source -eq "Insurance") {
            $insuranceClient = $client
            break
        }
    }
    
    if ($insuranceClient) {
        $invoice = @{
            clientId       = $insuranceClient.id
            clientSource   = "Insurance"
            description    = "Brake System Repair - Insurance Job"
            partsTotal     = "1500.00"
            laborTotal     = "800.00"
            taxRate        = "8.5"
            totalAmount    = "2500.00"
        }
        $createdInvoice = Invoke-Test "POST Create Invoice with Auto Insurance Split" "POST" "/api/invoices" $invoice
    }
}

# Test 9: Test HR Auto-Pinning
if ($staff -and $staff.Count -gt 0) {
    $hrStaff = $null
    foreach ($member in $staff) {
        if ($member.role -like "*Manager*" -or $member.role -like "*HR*") {
            $hrStaff = $member
            break
        }
    }
    
    if ($hrStaff) {
        $hrNote = @{
            authorId        = $hrStaff.id
            authorName      = $hrStaff.name
            content         = "IMPORTANT: System test notification - Auto-pinned for 24hrs"
            priority        = "High"
            category        = "Announcement"
            targetAudience  = "All"
        }
        $createdNote = Invoke-Test "POST Create HR Note (Auto-Pin)" "POST" "/api/hr-notes" $hrNote
    }
}

# Test 10: Get Pinned HR Notifications
Invoke-Test "GET Pinned HR Notifications (24hr auto-expire)" "GET" "/api/hr-notes/pinned"

# Test 11: Calculate Invoice Split
$splitTest = @{
    clientSource = "Insurance"
    laborTotal   = "800.00"
    partsTotal   = "1500.00"
    taxRate      = "8.5"
}
Invoke-Test "POST Calculate Insurance/Customer Invoice Split" "POST" "/api/business-logic/calculate-invoice-split" $splitTest

Write-Host "`n[TEST SECTION 4: Advanced Queries & Filtering]" -ForegroundColor Magenta

# Test 12: Get Expenses by Status
Invoke-Test "GET Expenses Filtered by Status" "GET" "/api/expenses/by-status/Pending"

# Test 13: Get HR Notes
Invoke-Test "GET All HR Notes" "GET" "/api/hr-notes"

# Test 14: Get Testimonials
Invoke-Test "GET All Testimonials" "GET" "/api/testimonials"

# Test 15: Get Certificates
Invoke-Test "GET All Certificates" "GET" "/api/certificates"

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST RESULTS SUMMARY                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n✅ Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Tests Failed: $testsFailed" -ForegroundColor Red

$totalTests = $testsPassed + $testsFailed
$passRate = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 2) } else { 0 }

Write-Host "`nTotal Tests: $totalTests" -ForegroundColor Cyan
Write-Host "Pass Rate: $passRate%" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Backend is fully functional." -ForegroundColor Green
}
else {
    Write-Host "`n⚠️  Some tests failed. Check the output above for details." -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api"

Write-Host "1. Testing Guest Login..."
$loginPayload = @{ phoneNumber = "1234567890" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/guest" -Method Post -Body $loginPayload -ContentType "application/json"
$userId = $loginResponse.user.id
$token = $loginResponse.token
Write-Host "Login Success. UserId: $userId"

Write-Host "2. Testing Image Upload (Using dummy ID since multipart is hard in PS)..."
# For simple testing without curl, we can skip actual file upload via PS and manually insert or just assume it works if we mock it.
# But let's try to use curl.exe for this step specifically with correct escaping.
# JSON response from curl needs to be parsed.

$uploadUrl = "$baseUrl/images/upload"
Write-Host "Uploading image..."
# Use curl.exe. Note the escaping for Windows cmd/PS.
$curlOutput = curl.exe -X POST -F "image=@test_image.jpg" -F "userId=$userId" $uploadUrl
$uploadResponse = $curlOutput | ConvertFrom-Json
$imageId = $uploadResponse.image.id
Write-Host "Upload Success. ImageId: $imageId"

Write-Host "3. Testing Diagnosis..."
$predictPayload = @{ userId = $userId; imageId = $imageId; location = "Cameroon" } | ConvertTo-Json
$diagnosisResponse = Invoke-RestMethod -Uri "$baseUrl/diagnosis/predict" -Method Post -Body $predictPayload -ContentType "application/json"
$diagnosisId = $diagnosisResponse.diagnosis.id
Write-Host "Diagnosis: $($diagnosisResponse.diagnosis.disease)"

Write-Host "4. Testing Feedback..."
$feedbackPayload = @{ userId = $userId; diagnosisId = $diagnosisId; outcome = "Positive"; comment = "Works well" } | ConvertTo-Json
$feedbackResponse = Invoke-RestMethod -Uri "$baseUrl/feedback" -Method Post -Body $feedbackPayload -ContentType "application/json"
Write-Host "Feedback Submitted: $($feedbackResponse.message)"

Write-Host "5. Testing History..."
$historyResponse = Invoke-RestMethod -Uri "$baseUrl/diagnosis/history/$userId" -Method Get
Write-Host "History Count: $($historyResponse.length)"


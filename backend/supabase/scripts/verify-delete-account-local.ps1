$ErrorActionPreference = "Continue"
Add-Type -AssemblyName System.Net.Http

function Send-LocalRequest {
  param(
    [string]$Method,
    [string]$Uri,
    [hashtable]$Headers,
    [AllowNull()][string]$Body
  )

  $message = [System.Net.Http.HttpRequestMessage]::new(
    [System.Net.Http.HttpMethod]::new($Method), $Uri
  )
  foreach ($name in $Headers.Keys) {
    [void]$message.Headers.TryAddWithoutValidation($name, $Headers[$name])
  }
  if ($Method -notin @("GET", "DELETE", "HEAD") -and $null -ne $Body) {
    $message.Content = [System.Net.Http.StringContent]::new(
      $Body,
      [System.Text.Encoding]::UTF8,
      "application/json"
    )
  }
  $response = $script:http.SendAsync($message).GetAwaiter().GetResult()
  [pscustomobject]@{
    Status = [int]$response.StatusCode
    Body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
  }
}

$statusLines = & pnpm.cmd exec supabase status -o env 2>$null
if ($LASTEXITCODE -ne 0) { throw "Local Supabase is unavailable." }
$envLines = $statusLines | Where-Object { $_ -match "^[A-Z0-9_]+=.*$" }
$settings = ConvertFrom-StringData ($envLines -join "`n")
$baseUrl = $settings["API_URL"].Trim('"')
$publicKey = $settings["ANON_KEY"].Trim('"')
if (-not $baseUrl -or -not $publicKey) {
  throw "Local public Supabase settings are unavailable."
}
$ErrorActionPreference = "Stop"

$script:http = [System.Net.Http.HttpClient]::new()
$email = "d02-delete-$([guid]::NewGuid().ToString('N'))@example.test"
$password = "$([guid]::NewGuid().ToString())Aa1!"
$userId = $null

try {
  $signupBody = @{
    email = $email
    password = $password
    data = @{ full_name = "Synthetic Deletion Test" }
  } | ConvertTo-Json -Compress
  $signup = Send-LocalRequest "POST" "$baseUrl/auth/v1/signup" `
    @{ apikey = $publicKey } $signupBody
  if ($signup.Status -ne 200) {
    throw "Synthetic local signup failed with HTTP $($signup.Status)."
  }

  $signupJson = $signup.Body | ConvertFrom-Json
  $userId = $signupJson.user.id
  $accessToken = $signupJson.access_token
  $refreshToken = $signupJson.refresh_token
  if (-not $accessToken) {
    $loginBody = @{ email = $email; password = $password } | ConvertTo-Json -Compress
    $login = Send-LocalRequest "POST" `
      "$baseUrl/auth/v1/token?grant_type=password" @{ apikey = $publicKey } $loginBody
    if ($login.Status -ne 200) {
      throw "Synthetic local sign-in failed with HTTP $($login.Status)."
    }
    $loginJson = $login.Body | ConvertFrom-Json
    $accessToken = $loginJson.access_token
    $refreshToken = $loginJson.refresh_token
  }
  if (-not $accessToken -or $userId -notmatch "^[0-9a-f-]{36}$") {
    throw "Synthetic Auth session is incomplete."
  }

  $userHeaders = @{ apikey = $publicKey; authorization = "Bearer $accessToken" }
  $deletion = Send-LocalRequest "POST" "$baseUrl/functions/v1/delete-account" `
    $userHeaders "{}"
  if ($deletion.Status -ne 202) {
    throw "delete-account returned HTTP $($deletion.Status)."
  }
  $deletionJson = $deletion.Body | ConvertFrom-Json
  if ($deletionJson.state -ne "access_blocked") {
    throw "delete-account returned an unexpected state."
  }

  $profile = Send-LocalRequest "GET" `
    "$baseUrl/rest/v1/profiles?select=id,status&id=eq.$userId" $userHeaders $null
  if ($profile.Status -ne 200 -or $profile.Body.Trim() -ne "[]") {
    throw "Profile check failed: HTTP $($profile.Status), response row count is not zero."
  }

  $refreshBody = @{ refresh_token = $refreshToken } | ConvertTo-Json -Compress
  $refresh = Send-LocalRequest "POST" `
    "$baseUrl/auth/v1/token?grant_type=refresh_token" `
    @{ apikey = $publicKey } $refreshBody
  if ($refresh.Status -lt 400) {
    throw "Auth refresh unexpectedly succeeded after the deletion request."
  }

  "signup=PASS deletion_status=$($deletion.Status) request_state=$($deletionJson.state) old_token_profile_rows=0 refresh_status=$($refresh.Status)"
}
finally {
  if ($userId -match "^[0-9a-f-]{36}$") {
    $cleanupSql = @"
DELETE FROM public.audit_logs WHERE actor_id = '$userId';
DELETE FROM public.account_deletion_requests WHERE user_id = '$userId';
DELETE FROM auth.users WHERE id = '$userId';
"@
    & docker exec supabase_db_backend psql -U postgres -d postgres `
      -v ON_ERROR_STOP=1 -c $cleanupSql | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Synthetic local account cleanup failed."
    }
  }
  $script:http.Dispose()
}

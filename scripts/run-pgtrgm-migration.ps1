param(
  [string]$Service = "postgres",
  [string]$DbUser = "postgres",
  [string]$Database = "tnhome",
  [switch]$SkipHardening,
  [switch]$SkipVerify
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $PSCommandPath
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$enableSql = Join-Path $repoRoot "prisma/migrations/enable_pg_trgm_extension.sql"
$hardenSql = Join-Path $repoRoot "prisma/migrations/harden_search_filter_indexes.sql"

function Invoke-PsqlFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath
  )

  if (-not (Test-Path -LiteralPath $FilePath)) {
    throw "SQL file not found: $FilePath"
  }

  Write-Host "Applying $(Split-Path -Leaf $FilePath)..."
  Get-Content -Raw -LiteralPath $FilePath | docker compose exec -T $Service psql -U $DbUser -d $Database -f -
  if ($LASTEXITCODE -ne 0) {
    throw "Failed applying SQL file: $FilePath"
  }
}

function Invoke-PsqlQuery {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Query
  )

  docker compose exec -T $Service psql -U $DbUser -d $Database -c $Query
  if ($LASTEXITCODE -ne 0) {
    throw "Failed query: $Query"
  }
}

Write-Host "Running pg_trgm migration on service '$Service' database '$Database'..."

Invoke-PsqlFile -FilePath $enableSql

if (-not $SkipHardening) {
  Invoke-PsqlFile -FilePath $hardenSql
}

if (-not $SkipVerify) {
  Write-Host "Verifying pg_trgm extension..."
  Invoke-PsqlQuery -Query "SELECT extname, extversion FROM pg_extension WHERE extname='pg_trgm';"

  Write-Host "Verifying supabase_admin role..."
  Invoke-PsqlQuery -Query "SELECT rolname, rolsuper FROM pg_roles WHERE rolname='supabase_admin';"

  Write-Host "Verifying trigram indexes..."
  Invoke-PsqlQuery -Query "SELECT indexname FROM pg_indexes WHERE tablename IN ('Product','Order') AND indexname ILIKE '%trgm%' ORDER BY indexname;"
}

Write-Host "pg_trgm migration completed."

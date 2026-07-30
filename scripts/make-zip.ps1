$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root 'dist'
$zip  = Join-Path $root 'careeraxis-dist.zip'
if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$fs   = [System.IO.File]::Open($zip, [System.IO.FileMode]::Create)
$arch = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)

$bs = [char]92   # backslash
$fw = [char]47   # forward slash
foreach ($f in Get-ChildItem -LiteralPath $src -Recurse -File -Force) {
  $rel = $f.FullName.Substring($src.Length + 1).Replace($bs, $fw)
  if ($rel -eq '_redirects') { continue }
  $entry = $arch.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
  $es = $entry.Open()
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $es.Write($bytes, 0, $bytes.Length)
  $es.Dispose()
}
$arch.Dispose()
$fs.Dispose()

$check = [System.IO.Compression.ZipFile]::OpenRead($zip)
Write-Output ("Entries: " + $check.Entries.Count)
$check.Entries | Select-Object -First 4 -ExpandProperty FullName
$check.Dispose()
Write-Output ("Size: " + [math]::Round((Get-Item $zip).Length/1MB,2) + " MB")

# AETHERLOCK Local Server — Pure PowerShell, no installs needed
# Run this from the AETHERLOCK folder: .\serve.ps1

$port = 8000
$folder = $PSScriptRoot
$url = "http://localhost:$port/"

$mime = @{
    '.html' = 'text/html'
    '.css'  = 'text/css'
    '.js'   = 'application/javascript'
    '.md'   = 'text/plain'
    '.png'  = 'image/png'
    '.ico'  = 'image/x-icon'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host ""
Write-Host "  AETHERLOCK server running at http://localhost:$port" -ForegroundColor Cyan
Write-Host "  Open that URL in Chrome now." -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

try {
    while ($listener.IsListening) {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $resp = $ctx.Response

        $rawPath = $req.Url.LocalPath
        if ($rawPath -eq '/') { $rawPath = '/index.html' }
        $filePath = Join-Path $folder $rawPath.TrimStart('/')

        if (Test-Path $filePath -PathType Leaf) {
            $ext     = [System.IO.Path]::GetExtension($filePath)
            $ct      = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
            $bytes   = [System.IO.File]::ReadAllBytes($filePath)
            $resp.ContentType     = $ct
            $resp.ContentLength64 = $bytes.Length
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $resp.StatusCode = 404
            $msg   = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
            $resp.OutputStream.Write($msg, 0, $msg.Length)
        }

        $resp.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Red
}

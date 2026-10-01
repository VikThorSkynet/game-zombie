$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand -and (Test-Path -LiteralPath 'C:\Python314\python.exe')) {
    $pythonPath = 'C:\Python314\python.exe'
} elseif ($pythonCommand) {
    $pythonPath = $pythonCommand.Source
} else {
    throw 'Python não encontrado. Instale Python para abrir a galeria local.'
}
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$listener.Start()
$galleryPort = $listener.LocalEndpoint.Port
$listener.Stop()
Start-Process -FilePath $pythonPath -ArgumentList @('-m', 'http.server', "$galleryPort", '--bind', '127.0.0.1') -WorkingDirectory $projectRoot -WindowStyle Hidden
Start-Sleep -Milliseconds 1000
Start-Process "http://127.0.0.1:$galleryPort/docs/asset-gallery/index.html"

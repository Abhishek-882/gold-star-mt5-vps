# Persistent tunnel auto-reconnect keeper for Gold Star MT5 Dashboard
while ($true) {
    Write-Host "[*] Starting resilient Pinggy tunnel on port 3000..."
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -p 443 -R 0:localhost:3000 a.pinggy.io 2>&1 | Tee-Object -FilePath "tunnel_live.log"
    Write-Host "[-] Tunnel disconnected. Reconnecting in 3 seconds..."
    Start-Sleep -Seconds 3
}

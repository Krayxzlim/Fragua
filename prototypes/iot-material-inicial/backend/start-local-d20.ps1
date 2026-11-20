# Run after installing Ollama and pulling the model. No download is performed here.
$ErrorActionPreference = 'Stop'
if (-not $env:API_TOKEN) { throw 'Set API_TOKEN first, using the same private token as the ESP32.' }
$env:OLLAMA_MODEL = 'qwen2.5vl:3b-q4_K_M'
$env:HOST = '0.0.0.0'
Set-Location $PSScriptRoot
node server.mjs

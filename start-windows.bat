@echo off
title HUMM Speech-to-Code
echo.
echo   HUMM Speech-to-Code
echo   Speak logic. Get clean code.
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Download LTS from https://nodejs.org then run this file again.
  pause
  exit /b 1
)
echo Starting on http://127.0.0.1:8787
echo Open that URL in Chrome or Edge on this Windows PC.
echo Keep this window open while you use HUMM.
echo.
node server\standalone.mjs
pause

@echo off
setlocal

cd /d "%~dp0"

if not exist ".env" (
  echo.
  echo [DesignLoop] .env dosyasi bulunamadi.
  echo Lutfen bu klasorde .env olusturup asagidaki satiri ekleyin:
  echo GEMINI_API_KEY=your_key_here
  echo.
  pause
  exit /b 1
)

echo [DesignLoop] Backend baslatiliyor...
start "DesignLoop Server" cmd /k "cd /d %~dp0 && node server.js"

timeout /t 2 /nobreak >nul

echo [DesignLoop] Tarayici aciliyor...
start "" "http://localhost:3000"

exit /b 0

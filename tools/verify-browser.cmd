@echo off
rem Runs tests.html in Microsoft Edge without a window and prints the result lines.
rem Use on machines without Node.js (company laptop). Exit code 0 = PASS, 1 = FAIL.
setlocal
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" (
  echo Microsoft Edge not found.
  exit /b 2
)
set "ROOT=%~dp0.."
set "PAGE=file:///%ROOT:\=/%/tests.html"
set "OUT=%TEMP%\fhc-tests-%RANDOM%.html"
"%EDGE%" --headless=new --disable-gpu --no-first-run --user-data-dir="%TEMP%\fhc-edge-profile" --virtual-time-budget=5000 --dump-dom "%PAGE%" > "%OUT%" 2>nul
findstr /C:"RESULT: " /C:"ok   " /C:"FAIL " "%OUT%"
findstr /C:"RESULT: PASS" "%OUT%" >nul
if errorlevel 1 (
  del "%OUT%" >nul 2>&1
  exit /b 1
)
del "%OUT%" >nul 2>&1
exit /b 0

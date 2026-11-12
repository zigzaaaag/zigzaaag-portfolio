@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  node tools/check.cjs
) else if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" tools/check.cjs
) else (
  echo Node.js is required. Please install the Node.js LTS runtime.
)
pause

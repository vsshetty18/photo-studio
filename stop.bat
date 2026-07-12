@echo off
REM ============================================================
REM  stop.bat
REM  Closes the Photo Studio backend and frontend windows.
REM  Optional - you can also just close the two black windows
REM  manually instead of using this.
REM ============================================================

echo Stopping Photo Studio...
taskkill /FI "WindowTitle eq Photo Studio - Backend*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Photo Studio - Frontend*" /T /F >nul 2>&1
echo Photo Studio stopped.
pause

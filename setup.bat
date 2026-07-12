@echo off
REM ============================================================
REM  setup.bat
REM  Run this ONCE after downloading the project. It installs
REM  everything needed (Python packages + Node packages) and
REM  builds the frontend so it starts fast every day after this.
REM
REM  Requirements before running this:
REM    - Python installed (https://python.org - check "Add to PATH" during install)
REM    - Node.js installed (https://nodejs.org)
REM ============================================================

echo ================================================
echo   Photo Studio - First Time Setup
echo   This may take 5-10 minutes. Please wait...
echo ================================================

echo.
echo [1/4] Setting up Python backend...
cd scripts
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
call venv\Scripts\deactivate.bat
cd ..

echo.
echo [2/4] Downloading face recognition model (needs internet, one time only)...
cd scripts
call venv\Scripts\activate.bat
python -c "from face_utils import get_face_app; get_face_app(); print('Model downloaded successfully.')"
call venv\Scripts\deactivate.bat
cd ..

echo.
echo [3/4] Installing frontend packages...
call npm install

echo.
echo [4/4] Building frontend for fast startup...
call npm run build

echo.
echo ================================================
echo   Setup complete!
echo   From now on, just double-click start.bat
echo   to open Photo Studio.
echo ================================================
pause

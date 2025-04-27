@echo off
echo Setting up Advanced APK Cracker...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Java is not installed. Please install JDK from https://www.oracle.com/java/technologies/javase-downloads.html
    pause
    exit /b 1
)

REM Create necessary directories
echo Creating directories...
if not exist uploads mkdir uploads
if not exist output mkdir output
if not exist client\src mkdir client\src
if not exist client\public mkdir client\public

REM Install server dependencies
echo Installing server dependencies...
call npm install

REM Install client dependencies
echo Installing client dependencies...
cd client
call npm install
cd ..

REM Create debug keystore if it doesn't exist
if not exist debug.keystore (
    echo Creating debug keystore...
    keytool -genkey -v -keystore debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
)

echo.
echo Setup completed successfully!
echo.
echo To start the application, run:
echo npm run dev:all
echo.
pause 
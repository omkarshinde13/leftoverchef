@echo off
setlocal EnableExtensions EnableDelayedExpansion

title LeftoverChef - Setup and Start

REM ============================================================
REM
REM                 LEFTOVERCHEF STARTUP
REM
REM  This script:
REM    1. Checks Node.js
REM    2. Checks npm
REM    3. Checks project files
REM    4. Installs package.json dependencies
REM    5. Installs required UI dependencies
REM    6. Installs Tailwind CSS 3.4.17 dependencies
REM    7. Fixes PostCSS configuration
REM    8. Creates/checks .env
REM    9. Checks Gemini API key
REM   10. Checks port 5000
REM   11. Starts LeftoverChef
REM
REM ============================================================

cd /d "%~dp0"

echo.
echo ==========================================================
echo                 LEFTOVERCHEF STARTUP
echo ==========================================================
echo.
echo Project folder:
echo %CD%
echo.

REM ============================================================
REM [1/10] CHECK NODE.JS
REM ============================================================

echo ==========================================================
echo [1/10] Checking Node.js
echo ==========================================================
echo.

where node >nul 2>&1

if errorlevel 1 (
    echo.
    echo ======================================================
    echo ERROR: Node.js is not installed.
    echo ======================================================
    echo.
    echo LeftoverChef requires Node.js 20 or newer.
    echo.
    echo Download Node.js:
    echo https://nodejs.org/
    echo.

    choice /C YN /M "Open Node.js download page"

    if errorlevel 2 (
        echo.
        echo Please install Node.js and run start.bat again.
        echo.
        pause
        exit /b 1
    )

    start "" "https://nodejs.org/"

    echo.
    echo Install Node.js first.
    echo Then close this window and run start.bat again.
    echo.

    pause
    exit /b 1
)

for /f "delims=" %%A in ('node -v') do set "NODE_VERSION=%%A"

echo Node.js found:
echo !NODE_VERSION!
echo.

for /f "tokens=1 delims=." %%A in ("!NODE_VERSION:v=!") do set "NODE_MAJOR=%%A"

if !NODE_MAJOR! LSS 20 (
    echo.
    echo ======================================================
    echo ERROR: Unsupported Node.js version.
    echo ======================================================
    echo.
    echo Current version:
    echo !NODE_VERSION!
    echo.
    echo LeftoverChef requires Node.js 20 or newer.
    echo.
    echo Download:
    echo https://nodejs.org/
    echo.

    start "" "https://nodejs.org/"

    pause
    exit /b 1
)

echo [OK] Node.js version is supported.
echo.

REM ============================================================
REM [2/10] CHECK NPM
REM ============================================================

echo ==========================================================
echo [2/10] Checking npm
echo ==========================================================
echo.

where npm >nul 2>&1

if errorlevel 1 (
    echo.
    echo ======================================================
    echo ERROR: npm was not found.
    echo ======================================================
    echo.
    echo npm normally comes with Node.js.
    echo.
    echo Please reinstall Node.js from:
    echo https://nodejs.org/
    echo.

    start "" "https://nodejs.org/"

    pause
    exit /b 1
)

for /f "delims=" %%A in ('npm -v') do set "NPM_VERSION=%%A"

echo npm found:
echo !NPM_VERSION!
echo.

REM ============================================================
REM [3/10] CHECK PROJECT FILES
REM ============================================================

echo ==========================================================
echo [3/10] Checking project files
echo ==========================================================
echo.

if not exist "package.json" (
    echo.
    echo ======================================================
    echo ERROR: package.json was not found.
    echo ======================================================
    echo.
    echo Current folder:
    echo %CD%
    echo.
    echo Make sure start.bat is inside the LeftoverChef folder.
    echo.
    pause
    exit /b 1
)

echo [OK] package.json

if exist "package-lock.json" (
    echo [OK] package-lock.json
) else (
    echo [INFO] package-lock.json not found.
    echo npm will create it automatically.
)

if not exist "server\index.ts" (
    echo.
    echo ERROR: server\index.ts not found.
    echo.
    pause
    exit /b 1
)

echo [OK] server\index.ts

if not exist "server\vite.ts" (
    echo.
    echo ERROR: server\vite.ts not found.
    echo.
    pause
    exit /b 1
)

echo [OK] server\vite.ts

if not exist "client\index.html" (
    echo.
    echo ERROR: client\index.html not found.
    echo.
    pause
    exit /b 1
)

echo [OK] client\index.html

if not exist "client\src\main.tsx" (
    echo.
    echo ERROR: client\src\main.tsx not found.
    echo.
    pause
    exit /b 1
)

echo [OK] client\src\main.tsx

if exist "tailwind.config.ts" (
    echo [OK] tailwind.config.ts
) else (
    echo [WARNING] tailwind.config.ts not found.
)

echo.

REM ============================================================
REM [4/10] INSTALL PACKAGE.JSON DEPENDENCIES
REM ============================================================

echo ==========================================================
echo [4/10] Installing package.json dependencies
echo ==========================================================
echo.

echo Running:
echo npm install
echo.
echo Please wait...
echo.

call npm install

if errorlevel 1 (
    echo.
    echo ======================================================
    echo ERROR: npm install failed.
    echo ======================================================
    echo.
    echo Check the npm error shown above.
    echo.
    echo Possible causes:
    echo   - No internet connection
    echo   - Invalid package.json
    echo   - npm registry problem
    echo   - Package installation problem
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo.
    echo ERROR: node_modules was not created.
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] npm dependencies installed.
echo.

REM ============================================================
REM [5/10] INSTALL REQUIRED LEFTOVERCHEF DEPENDENCIES
REM ============================================================

echo ==========================================================
echo [5/10] Checking LeftoverChef dependencies
echo ==========================================================
echo.

echo Installing React and UI dependencies...
echo.

call npm install ^
 @tanstack/react-query ^
 wouter ^
 @radix-ui/react-tooltip ^
 @radix-ui/react-toast ^
 @radix-ui/react-slot ^
 tailwind-merge ^
 clsx ^
 class-variance-authority

if errorlevel 1 (
    echo.
    echo ======================================================
    echo ERROR: React/UI dependencies failed.
    echo ======================================================
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] React/UI dependencies installed.
echo.

REM ============================================================
REM [6/10] INSTALL TAILWIND DEPENDENCIES
REM ============================================================

echo ==========================================================
echo [6/10] Installing Tailwind dependencies
echo ==========================================================
echo.

echo This project uses Tailwind CSS 3.x configuration.
echo Installing compatible versions...
echo.

call npm install -D ^
 tailwindcss@3.4.17 ^
 tailwindcss-animate ^
 @tailwindcss/typography ^
 postcss ^
 autoprefixer

if errorlevel 1 (
    echo.
    echo ======================================================
    echo ERROR: Tailwind dependencies failed.
    echo ======================================================
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Tailwind CSS 3.4.17 installed.
echo [OK] tailwindcss-animate installed.
echo [OK] @tailwindcss/typography installed.
echo [OK] PostCSS installed.
echo [OK] Autoprefixer installed.
echo.

REM ============================================================
REM [7/10] FIX POSTCSS CONFIG
REM ============================================================

echo ==========================================================
echo [7/10] Checking PostCSS configuration
echo ==========================================================
echo.

REM ------------------------------------------------------------
REM If postcss.config.js exists, rename it to .cjs
REM because package.json uses "type": "module".
REM ------------------------------------------------------------

if exist "postcss.config.js" (

    echo Found:
    echo postcss.config.js
    echo.

    if exist "postcss.config.cjs" (
        echo postcss.config.cjs already exists.
        echo Removing old postcss.config.js...
        del /f /q "postcss.config.js" >nul 2>&1
    ) else (
        echo Renaming:
        echo postcss.config.js
        echo to:
        echo postcss.config.cjs
        echo.

        ren "postcss.config.js" "postcss.config.cjs"

        if errorlevel 1 (
            echo.
            echo WARNING: Could not rename PostCSS configuration.
            echo.
        )
    )
)

REM ------------------------------------------------------------
REM Create PostCSS config if it does not exist.
REM ------------------------------------------------------------

if not exist "postcss.config.cjs" (

    echo.
    echo postcss.config.cjs was not found.
    echo Creating it...
    echo.

    (
        echo module.exports = {
        echo   plugins: {
        echo     tailwindcss: {},
        echo     autoprefixer: {},
        echo   },
        echo };
    ) > "postcss.config.cjs"

    if not exist "postcss.config.cjs" (
        echo.
        echo ======================================================
        echo ERROR: Could not create postcss.config.cjs
        echo ======================================================
        echo.
        pause
        exit /b 1
    )

    echo [OK] postcss.config.cjs created.

) else (

    echo [OK] postcss.config.cjs exists.

)

echo.

REM ============================================================
REM [8/10] CHECK / CREATE .ENV
REM ============================================================

echo ==========================================================
echo [8/10] Checking environment configuration
echo ==========================================================
echo.

if not exist ".env" (

    echo .env file was not found.
    echo Creating .env...
    echo.

    (
        echo PORT=5000
        echo GEMINI_API_KEY=
    ) > ".env"

    if not exist ".env" (
        echo.
        echo ERROR: Could not create .env
        echo.
        pause
        exit /b 1
    )

    echo [OK] .env created.

) else (

    echo [OK] .env exists.

)

echo.

REM ============================================================
REM [9/10] CHECK GEMINI API KEY
REM ============================================================

echo ==========================================================
echo [9/10] Checking Gemini API key
echo ==========================================================
echo.

set "GEMINI_KEY="

for /f "usebackq tokens=1,* delims==" %%A in (".env") do (

    if /I "%%A"=="GEMINI_API_KEY" (
        set "GEMINI_KEY=%%B"
    )

)

if defined GEMINI_KEY (

    if not "!GEMINI_KEY!"=="" (

        echo [OK] GEMINI_API_KEY found.
        echo.
        goto API_KEY_DONE

    )

)

echo.
echo ==========================================================
echo               GEMINI API KEY REQUIRED
echo ==========================================================
echo.
echo LeftoverChef requires a Gemini API key for AI features.
echo.
echo Get your API key from:
echo https://aistudio.google.com/apikey
echo.
echo IMPORTANT:
echo Do NOT share your .env file publicly.
echo Do NOT upload .env to GitHub.
echo.

choice /C YN /M "Open Google AI Studio"

if errorlevel 2 (

    echo.
    echo Browser was not opened.

) else (

    start "" "https://aistudio.google.com/apikey"

)

echo.
echo Enter your Gemini API key below.
echo.

set /p "GEMINI_KEY=Gemini API Key: "

if not defined GEMINI_KEY (

    echo.
    echo ======================================================
    echo ERROR: No Gemini API key was entered.
    echo ======================================================
    echo.
    echo Run start.bat again after obtaining your API key.
    echo.
    pause
    exit /b 1

)

REM ------------------------------------------------------------
REM Remove old GEMINI_API_KEY from .env
REM ------------------------------------------------------------

if exist ".env.tmp" (
    del /f /q ".env.tmp" >nul 2>&1
)

findstr /V /B /C:"GEMINI_API_KEY=" ".env" > ".env.tmp" 2>nul

if exist ".env.tmp" (

    move /Y ".env.tmp" ".env" >nul

)

REM ------------------------------------------------------------
REM Add new key
REM ------------------------------------------------------------

echo GEMINI_API_KEY=!GEMINI_KEY!>>".env"

echo.
echo [OK] Gemini API key saved.
echo.

:API_KEY_DONE

REM ============================================================
REM READ PORT FROM .ENV
REM ============================================================

set "APP_PORT=5000"

for /f "usebackq tokens=1,* delims==" %%A in (".env") do (

    if /I "%%A"=="PORT" (

        if not "%%B"=="" (
            set "APP_PORT=%%B"
        )

    )

)

echo Application port:
echo !APP_PORT!
echo.

REM ============================================================
REM [10/10] CHECK PORT
REM ============================================================

echo ==========================================================
echo [10/10] Checking application port
echo ==========================================================
echo.

netstat -ano | findstr /R /C:":!APP_PORT! .*LISTENING" >nul 2>&1

if not errorlevel 1 (

    echo.
    echo ======================================================
    echo WARNING: Port !APP_PORT! is already in use.
    echo ======================================================
    echo.
    echo Something is already running on:
    echo http://localhost:!APP_PORT!
    echo.

    choice /C YN /M "Continue anyway"

    if errorlevel 2 (

        echo.
        echo Startup cancelled.
        echo.
        pause
        exit /b 0

    )

) else (

    echo [OK] Port !APP_PORT! is available.

)

echo.

REM ============================================================
REM FINAL START
REM ============================================================

echo ==========================================================
echo                 STARTING LEFTOVERCHEF
echo ==========================================================
echo.
echo Server:
echo http://localhost:!APP_PORT!
echo.
echo Starting:
echo npm run dev
echo.
echo Press Ctrl+C to stop the server.
echo.
echo ==========================================================
echo.

REM ------------------------------------------------------------
REM Open browser after 3 seconds
REM ------------------------------------------------------------

start "" /b cmd /c "timeout /t 3 /nobreak >nul & start "" http://localhost:!APP_PORT!""

REM ------------------------------------------------------------
REM Start application
REM ------------------------------------------------------------

call npm run dev

echo.
echo ==========================================================
echo              LEFTOVERCHEF HAS STOPPED
echo ==========================================================
echo.

pause

exit /b 0
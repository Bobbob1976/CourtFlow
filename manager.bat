@echo off
REM CourtFlow Manager - Backup, Update & Deploy Tool
REM Usage: manager.bat [backup|update|deploy|init]

setlocal enabledelayedexpansion

set PROJECT_NAME=CourtFlow
set BACKUP_DIR=backups
set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo.
echo ========================================
echo   %PROJECT_NAME% Manager
echo ========================================
echo.

if "%1"=="" (
    echo Gebruik: manager.bat [backup^|update^|deploy^|init^|push]
    echo.
    echo Opties:
    echo   init     - Initialiseer Git repository
    echo   backup   - Maak een backup van de huidige code
    echo   update   - Pull laatste wijzigingen van GitHub
    echo   push     - Commit en push wijzigingen naar GitHub
    echo   deploy   - Deploy naar Vercel (production)
    echo.
    goto :end
)

if "%1"=="init" goto :init
if "%1"=="backup" goto :backup
if "%1"=="update" goto :update
if "%1"=="push" goto :push
if "%1"=="deploy" goto :deploy

echo Onbekend commando: %1
goto :end

:init
echo [INIT] Initialiseren Git repository...
git init
git add .
git commit -m "Initial commit: CourtFlow app setup"
echo.
echo [INIT] Repository geinitialiseerd!
echo [INIT] Voeg nu je GitHub remote toe met:
echo        git remote add origin https://github.com/JOUW-USERNAME/courtflow.git
echo        git push -u origin main
goto :end

:backup
echo [BACKUP] Maken van backup...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set BACKUP_FILE=%BACKUP_DIR%\%PROJECT_NAME%_%TIMESTAMP%.zip

echo [BACKUP] Backup wordt opgeslagen als: %BACKUP_FILE%

REM Maak zip van hele project (exclusief node_modules en .next)
powershell -command "Compress-Archive -Path '.\*' -DestinationPath '%BACKUP_FILE%' -Force -CompressionLevel Fastest"

if %errorlevel% equ 0 (
    echo [BACKUP] Backup succesvol aangemaakt!
    echo [BACKUP] Locatie: %BACKUP_FILE%
) else (
    echo [BACKUP] Fout bij maken backup!
)
goto :end

:update
echo [UPDATE] Ophalen laatste wijzigingen...
git fetch origin
git pull origin main

if %errorlevel% equ 0 (
    echo [UPDATE] Code bijgewerkt!
    echo [UPDATE] Installeren van dependencies...
    call npm install
    echo [UPDATE] Klaar!
) else (
    echo [UPDATE] Fout bij updaten!
)
goto :end

:push
echo [PUSH] Commit en push wijzigingen...
echo.

REM Vraag commit message
set /p COMMIT_MSG="Commit message: "

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update: %date% %time%
)

git add .
git commit -m "%COMMIT_MSG%"
git push origin main

if %errorlevel% equ 0 (
    echo [PUSH] Wijzigingen gepushed naar GitHub!
) else (
    echo [PUSH] Fout bij pushen! (Mogelijk geen remote ingesteld?)
)
goto :end

:deploy
echo [DEPLOY] Deployen naar Vercel...
echo.

REM Vraag of gebruiker zeker is
set /p CONFIRM="Weet je zeker dat je wilt deployen naar PRODUCTION? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo [DEPLOY] Deploy geannuleerd.
    goto :end
)

echo [DEPLOY] Starten deployment...
call npx vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo [DEPLOY] Deployment succesvol!
    echo [DEPLOY] Je app is nu live!
) else (
    echo [DEPLOY] Fout bij deployen!
)
goto :end

:end
echo.
echo ========================================
endlocal

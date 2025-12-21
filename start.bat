@echo off
REM CourtFlow Pro Launcher
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
cd /d "%~dp0"

:menu
cls
echo.
echo ================================================
echo           COURTFLOW PRO LAUNCHER
echo ================================================
echo.
echo --- DEVELOPMENT ---
echo  [1]  Start Dev Server
echo  [2]  Build Production (test)
echo  [3]  Restart Dev Server
echo  [4]  Clear Cache + Reinstall
echo.
echo --- GIT ---
echo  [5]  Quick Commit + Push
echo  [6]  Pull Latest Changes
echo  [7]  Git Status + Log
echo  [8]  Open GitHub
echo.
echo --- DATABASE ---
echo  [9]  Run Migrations
echo  [10] Open Supabase Dashboard
echo  [11] Backup All
echo.
echo --- DEPLOY ---
echo  [12] Deploy to Production
echo  [13] Deploy Preview
echo  [14] Open Vercel Dashboard
echo.
echo --- TOOLS ---
echo  [15] Open in VS Code
echo  [16] Open Local App
echo  [17] View Package Info
echo  [18] Update Dependencies
echo.
echo --- MAINTENANCE ---
echo  [19] Health Check
echo  [20] View Recent Logs
echo  [21] Deep Clean
echo  [22] Start Stripe Listener
echo.
echo  [0] Exit
echo.
echo ================================================
set /p choice="Kies een optie (0-22): "

if "%choice%"=="1" goto :start_dev
if "%choice%"=="2" goto :build_test
if "%choice%"=="3" goto :restart_dev
if "%choice%"=="4" goto :clear_cache
if "%choice%"=="5" goto :quick_push
if "%choice%"=="6" goto :pull
if "%choice%"=="7" goto :git_status
if "%choice%"=="8" goto :open_github
if "%choice%"=="9" goto :run_migrations
if "%choice%"=="10" goto :supabase
if "%choice%"=="11" goto :backup_all
if "%choice%"=="12" goto :deploy_prod
if "%choice%"=="13" goto :deploy_preview
if "%choice%"=="14" goto :vercel
if "%choice%"=="15" goto :vscode
if "%choice%"=="16" goto :open_local
if "%choice%"=="17" goto :package_info
if "%choice%"=="18" goto :update_deps
if "%choice%"=="19" goto :health_check
if "%choice%"=="20" goto :view_logs
if "%choice%"=="21" goto :deep_clean
if "%choice%"=="22" goto :start_stripe
if "%choice%"=="0" goto :end

echo Ongeldige keuze!
timeout /t 2 >nul
goto :menu

:start_dev
cls
echo.
echo Starting development server...
echo ================================================
echo.
echo Server: http://localhost:3000
echo Druk CTRL+C om te stoppen
echo.
start "" "http://localhost:3000"
call npm run dev
goto :menu

:build_test
cls
echo.
echo Building production version...
echo ================================================
echo.
call npm run build
echo.
if %errorlevel% equ 0 (
    echo BUILD SUCCESSFUL - Ready to deploy!
) else (
    echo BUILD FAILED - Fix errors first!
)
echo.
pause
goto :menu

:restart_dev
cls
echo.
echo Restarting dev server...
echo ================================================
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul
start "" "http://localhost:3000"
call npm run dev
goto :menu

:clear_cache
cls
echo.
echo Clearing cache...
echo ================================================
echo.
echo [1/3] Removing .next...
if exist .next rmdir /s /q .next
echo [2/3] Removing node_modules...
if exist node_modules rmdir /s /q node_modules
echo [3/3] Reinstalling...
call npm install --legacy-peer-deps
echo.
echo DONE!
pause
goto :menu

:quick_push
cls
echo.
echo Quick Commit + Push
echo ================================================
echo.
git status
echo.
set /p msg="Commit message: "
if "%msg%"=="" set msg=Update: %date% %time%

git add .
git commit -m "%msg%"
git push

if %errorlevel% equ 0 (
    echo.
    echo PUSHED - Vercel will auto-deploy!
) else (
    echo.
    echo PUSH FAILED!
)
pause
goto :menu

:pull
cls
echo.
echo Pulling latest changes...
echo ================================================
git pull
if %errorlevel% equ 0 (
    echo.
    echo CODE UPDATED!
    echo Installing dependencies...
    call npm install --legacy-peer-deps
) else (
    echo PULL FAILED!
)
pause
goto :menu

:git_status
cls
echo.
echo Git Status
echo ================================================
echo.
echo Current branch:
git branch --show-current
echo.
echo Modified files:
git status --short
echo.
echo Recent commits:
git log --oneline -n 10
echo.
pause
goto :menu

:open_github
cls
echo Opening GitHub...
start "" "https://github.com/Bobbob1976/CourtFlow"
timeout /t 1 >nul
goto :menu

:run_migrations
cls
echo.
echo Running migrations...
echo ================================================
call npx supabase db push
echo.
if %errorlevel% equ 0 (
    echo MIGRATIONS APPLIED!
) else (
    echo MIGRATION FAILED!
)
pause
goto :menu

:supabase
cls
echo Opening Supabase...
start "" "https://supabase.com/dashboard/project/iyawydabqqhktsivpiqf"
timeout /t 1 >nul
goto :menu

:backup_all
cls
echo.
echo Creating backup...
echo ================================================
call manager.bat backup
pause
goto :menu

:deploy_prod
cls
echo.
echo Deploy to PRODUCTION
echo ================================================
echo.
echo WARNING: This goes LIVE!
echo.
set /p confirm="Are you sure? (y/n): "
if /i not "%confirm%"=="y" (
    echo Cancelled.
    timeout /t 2 >nul
    goto :menu
)

call npx vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo DEPLOYED!
) else (
    echo DEPLOYMENT FAILED!
)
pause
goto :menu

:deploy_preview
cls
echo.
echo Deploy Preview
echo ================================================
call npx vercel
pause
goto :menu

:vercel
cls
echo Opening Vercel...
start "" "https://vercel.com/pascal-teunissens-projects/courtflow"
timeout /t 1 >nul
goto :menu

:vscode
cls
echo Opening VS Code...
code .
timeout /t 2 >nul
goto :menu

:open_local
cls
echo Opening app...
start "" "http://localhost:3000"
timeout /t 1 >nul
goto :menu

:package_info
cls
echo.
echo Package Info
echo ================================================
echo.
echo Node version:
node -v
echo.
echo npm version:
npm -v
echo.
echo Top packages:
npm list --depth=0 2>nul | more
echo.
pause
goto :menu

:update_deps
cls
echo.
echo Update Dependencies
echo ================================================
echo.
call npm outdated
echo.
set /p update="Update all? (y/n): "
if /i "%update%"=="y" (
    call npm update
    echo UPDATED!
) else (
    echo Cancelled.
)
pause
goto :menu

:health_check
cls
echo.
echo Health Check
echo ================================================
echo.
echo [1/5] Node.js...
node -v >nul 2>&1 && echo OK - Node.js || echo MISSING - Node.js
echo.
echo [2/5] npm...
npm -v >nul 2>&1 && echo OK - npm || echo MISSING - npm
echo.
echo [3/5] Git...
git --version >nul 2>&1 && echo OK - Git || echo MISSING - Git
echo.
echo [4/5] Vercel CLI...
npx vercel --version >nul 2>&1 && echo OK - Vercel || echo MISSING - Vercel
echo.
echo [5/5] Dev server...
curl -s http://localhost:3000 >nul 2>&1 && echo RUNNING || echo NOT RUNNING
echo.
pause
goto :menu

:view_logs
cls
echo.
echo Recent Logs
echo ================================================
echo.
echo Recent commits:
git log --oneline -n 15
echo.
pause
goto :menu

:deep_clean
cls
echo.
echo DEEP CLEAN (FULL RESET)
echo ================================================
echo.
echo WARNING: This will delete everything and reinstall!
echo.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo Cancelled.
    timeout /t 2 >nul
    goto :menu
)

echo.
echo [1/5] Removing .next...
if exist .next rmdir /s /q .next

echo [2/5] Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo [3/5] Clearing npm cache...
call npm cache clean --force

echo [4/5] Removing package-lock...
if exist package-lock.json del package-lock.json

echo [5/5] Fresh install...
call npm install --legacy-peer-deps

echo.
echo DEEP CLEAN COMPLETE!
pause
goto :menu

:start_stripe
cls
echo.
echo Starting Stripe Webhook Listener...
echo ================================================
echo Forwarding to: http://localhost:3000/api/stripe/webhook
echo.
echo NOTE: You need the Stripe CLI installed for this to work.
echo.
start "Stripe Listener" cmd /k "stripe listen --forward-to localhost:3000/api/stripe/webhook"
goto :menu

:end
cls
echo.
echo Goodbye!
timeout /t 2 >nul
exit

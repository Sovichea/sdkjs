CD /D %~dp0
call npm ci
set SDK_PLATFORM=desktop
rem set NODE_ENV=development
set NODE_ENV=production
call npm run build

rmdir "..\..\desktop-apps\win-linux\build\debug\win_64\editors\sdkjs"
xcopy /s/e/k/c/y/q/i "..\deploy\sdkjs" "..\..\desktop-apps\win-linux\build\debug\win_64\editors\sdkjs"

pause

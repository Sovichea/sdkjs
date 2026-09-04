CD /D %~dp0
call npm ci
rem set NODE_ENV=development
call npm run build

pause

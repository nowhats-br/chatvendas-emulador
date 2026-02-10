@echo off
echo Verificando porta 3010...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3010') do (
    if "%%a" NEQ "0" (
        echo Matando processo %%a na porta 3010
        taskkill /F /PID %%a >nul 2>&1
    )
)
echo Porta 3010 liberada
exit /b 0

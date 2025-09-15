@echo off
REM Simple text editor helper for Windows
REM Usage: edit.bat filename

if "%1"=="" (
    echo Please provide a filename
    exit /b 1
)

start notepad %1
@echo off
echo Starting the SMS application...
docker --version >nul 2>&1 || (
    echo Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b
)

cd /d "%~dp0"
docker-compose up --build
pause
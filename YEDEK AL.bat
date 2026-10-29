@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo            YEDEK ALMA
echo ==========================================
echo.

if exist ".git\index.lock" (
    echo UYARI: Onceki bir islemden kalan kilit dosyasi bulundu, siliniyor.
    del /f /q ".git\index.lock" >nul 2>&1
)

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "DT=%%I"
set "STAMP=!DT:~0,4!-!DT:~4,2!-!DT:~6,2!_!DT:~8,2!!DT:~10,2!"
set "ETIKET=yedek-!STAMP!"

git config user.name  >nul 2>&1 || git config user.name  "Burak"
git config user.email >nul 2>&1 || git config user.email "burak@example.com"

git add -A

git diff --cached --quiet
if %errorlevel%==0 (
    echo Degisiklik yok - her sey zaten yedeklenmis durumda.
    echo.
    echo Mevcut yedek noktalari:
    git tag --list "yedek-*" --sort=-creatordate
    echo.
    pause
    exit /b 0
)

echo Degisiklikler kaydediliyor...
git commit -q -m "yedek: !STAMP!"

if errorlevel 1 (
    echo.
    echo HATA: Kayit basarisiz oldu. Yukaridaki mesaji kontrol et.
    echo.
    pause
    exit /b 1
)

git tag -f "!ETIKET!" >nul 2>&1

echo.
echo TAMAM - Yedek alindi: !ETIKET!
echo.
echo Tum yedek noktalari (yeniden eskiye):
git tag --list "yedek-*" --sort=-creatordate
echo.
pause

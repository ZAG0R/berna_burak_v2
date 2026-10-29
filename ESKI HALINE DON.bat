@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo          ESKi HALiNE DON
echo ==========================================
echo.

if exist ".git\index.lock" del /f /q ".git\index.lock" >nul 2>&1

rem --- Yedek listesi ---
set "SAYAC=0"
for /f "delims=" %%T in ('git tag --list "yedek-*" --sort=-creatordate') do (
    set /a SAYAC+=1
    set "TAG[!SAYAC!]=%%T"
    for %%A in ("%%T") do set "TARIH=%%~tA"
    echo   [!SAYAC!]  %%T   (olusturulma: !TARIH!)
)

if %SAYAC%==0 (
    echo Henuz yedek noktasi yok. Once "YEDEK AL.bat" calistir.
    echo.
    pause
    exit /b 1
)

echo.
set /p "SECIM=Hangi yedek noktasina donulecek? (1-%SAYAC%, iptal icin Enter): "

if "%SECIM%"=="" (
    echo Isleme iptal edildi. Hicbir sey degismedi.
    pause
    exit /b 0
)

set "HEDEF=!TAG[%SECIM%]!"
if "!HEDEF!"=="" (
    echo Gecersiz secim. Hicbir sey degismedi.
    pause
    exit /b 1
)

echo.
echo Secilen yedek: !HEDEF!
echo.

rem --- Su anki hali guvenlik icin ayri bir yedege al ---
git add -A >nul 2>&1
git diff --cached --quiet
if not errorlevel 1 (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "DT=%%I"
    set "ONCESI=yedek-oncesi-!DT:~0,4!-!DT:~4,2!-!DT:~6,2!_!DT:~8,2!!DT:~10,2!"
    git commit -q -m "!ONCESI!"
    git tag -f "!ONCESI!" >nul 2>&1
    echo   Onceki haliniz guvenlige alindi: !ONCESI!
    echo.
)

echo Geri donuluyor...
git reset --hard "!HEDEF!" >nul 2>&1
if errorlevel 1 (
    echo HATA: Geri donulemedi. Mesaj:
    git reset --hard "!HEDEF!"
    echo.
    pause
    exit /b 1
)

echo.
echo ======================================================
echo  TAMAM - "!HEDEF!" anina donuldu.
echo  Degistirilen dosyalar eski haline geldi, silinenler geri geldi.
echo ======================================================
echo.
echo Simdi uygulamayi gorebilmek icin:
echo     npm run build      (sonra dist\index.html dosyasini ac)
echo.
if defined ONCESI (
    echo Geri almak isterseniz su komutu calistirin:
    echo     git reset --hard !ONCESI!
)
echo.
pause

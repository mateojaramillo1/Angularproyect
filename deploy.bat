@echo off
cd /d "c:\Users\teoja\OneDrive\Escritorio\Angularproyect"
:: Construir el proyecto Angular (Angular 12+)
call npx ng build --configuration production
:: Subir los cambios generados
git add -A
git commit -m "Force redeploy: auth UI update"
git push origin main
pause

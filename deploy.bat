@echo off
cd /d "c:\Users\teoja\OneDrive\Escritorio\Angularproyect"
:: Construir el proyecto Angular
call npx ng build --prod
:: Subir los cambios generados
git add -A
git commit -m "Force redeploy: auth UI update"
git push origin main
pause

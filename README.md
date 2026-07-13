# Sistema de Ingresos — versión automática

La aplicación procesa automáticamente todas las marcas del archivo:

1. Lee todas las hojas que contienen `Vta Man`, `Vta Abor` y `Vta Prepago`.
2. Genera primero un reporte GENERAL con la suma de todas las marcas.
3. Genera después un reporte individual por cada hoja/marca.
4. Si el archivo tiene una sola hoja, intenta separar automáticamente los registros por la columna `Marca`.
5. Exporta un Excel con hoja `GENERAL` y una hoja por cada marca.

Ya no es necesario seleccionar Unidad/Marca ni Hoja del archivo.

## GitHub Pages
Sube `index.html`, `styles.css`, `app.js` y `config.js` al repositorio y activa Pages desde la rama main.

## Apps Script
Copia `Code.gs` en Extensiones > Apps Script, crea una implementación de Aplicación web y pega la URL `/exec` dentro de `config.js`.

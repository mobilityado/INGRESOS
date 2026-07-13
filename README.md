# Sistema de Ingresos TRT VB

Aplicación web para procesar el archivo **Tarjetas Capturadas**, calcular Canje, Abordo, Prepago y Total, mostrar gráficas y exportar un Excel profesional.

## Reglas predeterminadas

- Canje = columna `Vta Man`
- Abordo = columna `Vta Abor`
- Prepago = columna `Vta Prepago`
- TRT VB = registros donde la columna `Marca` no está vacía

Estas reglas reproducen el concentrado del archivo proporcionado.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube `index.html`, `styles.css`, `app.js` y `config.js`.
3. Ve a **Settings > Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/root`.
6. Guarda y espera a que aparezca la dirección pública.

## Configurar Google Apps Script

1. Abre tu Google Sheets.
2. Ve a **Extensiones > Apps Script**.
3. Borra el código existente y pega el contenido de `Code.gs`.
4. Verifica el ID de la hoja y los nombres `TRTVB` y `Concentrado`.
5. Pulsa **Implementar > Nueva implementación > Aplicación web**.
6. Ejecutar como: **Yo**.
7. Acceso: la opción permitida por tu organización.
8. Copia la URL terminada en `/exec`.
9. Abre `config.js` y reemplaza `PEGA_AQUI_TU_URL_DE_APPS_SCRIPT_EXEC`.

## Uso sin Apps Script

La aplicación también funciona totalmente sin conexión a Google Sheets:

1. Pulsa **Seleccionar Excel**.
2. Elige el archivo Tarjetas Capturadas.
3. Pulsa **Procesar información**.
4. Exporta el resumen a Excel o imprime como PDF.

## Seguridad

El procesamiento del Excel se realiza directamente en el navegador. El archivo seleccionado no se sube a GitHub ni a otro servidor.

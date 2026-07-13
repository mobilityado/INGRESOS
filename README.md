# Sistema de Ingresos 360 — conexión directa con Google Sheets

Esta versión ya no utiliza Google Apps Script para consultar la información.

## Fuente configurada

- Google Sheets ID: `1t7_19QrIufcoX-osGVlm4sZ4fpGt4ljP26wwg8nh-Tc`
- Pestañas obligatorias:
  - `TRT`
  - `TRTVB`
  - `AAO`
  - `AAOVB`

La aplicación consulta las cuatro pestañas mediante la salida CSV de Google Visualization.

## Requisito de acceso

El Google Sheets debe estar compartido como:

**Cualquier persona que tenga el vínculo — Lector**

No hace falta publicarlo para editar ni compartir permisos de escritura.

## Publicar en GitHub Pages

1. Reemplaza en tu repositorio todos los archivos por los de esta carpeta.
2. Conserva la estructura en la raíz.
3. Espera a que GitHub Pages termine de publicar.
4. Abre la página y presiona `Ctrl + F5`.
5. Usa **Actualizar desde Google Sheets**.

## Si cambia el nombre de una pestaña

Edita `config.js`:

```javascript
window.APP_CONFIG = {
  SHEET_ID: "ID_DE_TU_HOJA",
  SHEETS: {
    TRT: "TRT",
    TRTVB: "TRTVB",
    AAO: "AAO",
    AAOVB: "AAOVB"
  }
};
```

## Respaldo

La carga manual de archivos Excel continúa disponible.

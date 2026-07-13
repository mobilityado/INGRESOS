/**
 * La versión 9 consulta Google Sheets directamente.
 * Este Apps Script no es necesario para la lectura.
 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    error: false,
    mensaje: "Ingresos 360 v9 usa conexión directa con Google Sheets."
  })).setMimeType(ContentService.MimeType.JSON);
}

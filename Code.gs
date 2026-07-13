/**
 * Esta versión ya no necesita Google Apps Script para leer la información.
 * La aplicación consulta directamente las pestañas públicas del Google Sheets.
 *
 * Puedes conservar este archivo únicamente como referencia.
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      error: false,
      mensaje: "La versión 7 utiliza conexión directa con Google Sheets."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

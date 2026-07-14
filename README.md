# NEXUS ONE 2.1 — Automatic Data Loading

Al iniciar sesión, NEXUS ONE consulta automáticamente Google Sheets y
muestra el periodo oficial sin que el usuario presione Actualizar datos.

La carga manual de Excel se conserva. Cuando se carga un archivo local,
la interfaz identifica claramente el origen de los datos.

## Comportamiento

1. El usuario inicia sesión.
2. NEXUS ONE abre la plataforma.
3. Consulta Google Sheets automáticamente.
4. Calcula indicadores, gráficas y briefing.
5. El usuario todavía puede:
   - Actualizar manualmente Google Sheets.
   - Cargar un Excel local.
   - Publicar un Excel mediante Data Publisher.

## Instalación

1. Sustituye Code.gs.
2. Publica una nueva versión en Apps Script.
3. Reemplaza todos los archivos en GitHub.
4. Presiona Ctrl + F5.

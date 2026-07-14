# NEXUS 2030 Enterprise Suite 2030.1 — Corrección de acceso

**Enterprise Intelligence Operating System**  
**Mobility ADO**  
**Build 3000.0713**

## Entrega funcional

NEXUS 2030 conserva toda la plataforma anterior e incorpora:

- Workspace por roles.
- Command Center.
- Ingresos y cuatro marcas.
- NEXUS AI Executive.
- Centro de Inteligencia.
- Dirección General.
- Pronóstico basado en histórico.
- Metas por marca.
- Comparativos.
- Data Publisher con respaldo.
- Reportes premium.
- Administración de usuarios.
- Tema claro, oscuro y automático.
- Notificaciones y asistente flotante.

## Pronóstico

El pronóstico se calcula localmente mediante:

- Promedio de variaciones históricas.
- Mayor peso a los tres periodos más recientes.
- Rango superior e inferior según volatilidad.
- Confianza estimada según cantidad y estabilidad de los periodos.

No representa una garantía financiera; es una estimación operativa.

## Metas

Las metas por marca se guardan localmente en el navegador. Para compartirlas entre todos los equipos, puede añadirse posteriormente una pestaña `METAS` en Google Sheets.

## Instalación

1. Sustituye `Code.gs` en Apps Script.
2. Publica una nueva versión.
3. Reemplaza todos los archivos en GitHub.
4. Presiona `Ctrl + F5`.

La URL `/exec` permanece configurada en `config.js`.


## Corrección 2030.1

Se corrigió un error de JavaScript que impedía cargar la lista desplegable de usuarios.

La sección Apariencia fue actualizada para usar un selector de tema, pero el código aún intentaba enlazar un botón anterior llamado `settingsThemeBtn`. Al no existir ese elemento, la ejecución se detenía antes de llamar a `loadLoginUsers()`.

También se agregó una inicialización defensiva para mostrar un mensaje claro si la API no responde.

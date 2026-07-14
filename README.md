# NEXUS ONE 3.0 — Smart Import

Esta versión permite dos formas de cargar información:

## Opción 1: archivo consolidado

Un solo Excel con las pestañas:

- TRT
- TRT VB
- AAO
- AAO VB

## Opción 2: cuatro archivos separados

Un archivo independiente para cada marca:

- TRT
- TRT VB
- AAO
- AAO VB

Cada archivo puede tener una sola pestaña, siempre que su contenido mantenga
el mismo formato y corresponda a la marca seleccionada.

## Validaciones

- Las cuatro marcas deben estar presentes.
- Los archivos no pueden estar vacíos.
- Se valida que el archivo corresponda a la marca esperada.
- Se mantienen las mismas columnas y reglas de cálculo.
- El usuario conserva la carga automática desde Google Sheets.
- Data Publisher continúa disponible para publicar el periodo oficial.

## Instalación

1. Sustituye Code.gs.
2. Publica una nueva versión en Apps Script.
3. Reemplaza todos los archivos en GitHub.
4. Presiona Ctrl + F5.

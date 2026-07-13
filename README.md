# NEXUS v16.1 — Corrección de visualización

Esta versión corrige el error:

`Cannot set properties of null (setting 'innerHTML')`

El problema se producía porque se eliminó la sección Aplicaciones, pero una
función todavía intentaba actualizar un elemento perteneciente a esa sección.
La excepción detenía el proceso antes de dibujar los indicadores y gráficas.

## Correcciones

- Renderizado completo de KPIs, tablas y gráficas.
- Elementos opcionales protegidos para evitar errores futuros.
- Mejor contraste del texto sobre el fondo tornasol.
- Distribución adaptable de las cuatro fuentes.
- Se mantiene eliminada la sección Aplicaciones.

## Instalación

Reemplaza los archivos de GitHub por los de este paquete y presiona Ctrl + F5.
No es obligatorio cambiar la implementación de Apps Script si ya utilizas el
Code.gs de la V16, aunque se incluye nuevamente para una instalación completa.

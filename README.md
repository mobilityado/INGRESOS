# Recaudación 365 Enterprise v15 Estable

Esta versión conserva el portal corporativo de la V14 y añade mejoras enfocadas en operación, presentación ejecutiva y uso móvil.

## Mejoras incluidas

- KPI con animación y variación frente al periodo anterior.
- Indicadores positivos y negativos.
- Centro de notificaciones.
- Mensajes de progreso durante la carga.
- Copilot local ampliado.
- Comparación rápida de las cuatro marcas.
- Consulta de participación de Prepago.
- Portada ejecutiva para impresión/PDF.
- Datos del usuario y periodo en el reporte.
- Tablas y gráficas optimizadas para celular.
- Histórico y avisos al guardar periodos.
- Mejoras de rendimiento y retroalimentación visual.
- Panel administrativo y cambio de contraseña conservados.

## Instalación

1. Sustituye `Code.gs` en Google Apps Script.
2. En **Implementar > Administrar implementaciones**, edita la implementación.
3. Selecciona **Nueva versión**.
4. Conserva:
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**
5. Copia la URL terminada en `/exec`.
6. Colócala en `config.js`.
7. Reemplaza todos los archivos del repositorio.
8. Presiona `Ctrl + F5`.

## Copilot local

No utiliza servicios externos. Responde con base en los datos cargados:

- Marca líder.
- Total general.
- Composición por concepto.
- Resumen ejecutivo.
- Comparación entre marcas.
- Participación de Prepago.
- Desglose individual de TRT, TRTVB, AAO y AAOVB.

## Notificaciones

Las notificaciones se almacenan localmente en el navegador. Incluyen:

- Inicio de sesión.
- Actualización de información.
- Periodos guardados.

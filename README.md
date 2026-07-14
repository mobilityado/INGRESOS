# NEXUS Enterprise 2027.3 — Data Publisher

**Enterprise Intelligence Platform**  
**Build 2703.0713**

## Data Publisher

Permite cargar un Excel y convertirlo en la nueva fuente oficial de consulta.

### Flujo

1. Seleccionar o arrastrar el archivo.
2. Validar las cuatro marcas.
3. Revisar registros, importes y totales.
4. Confirmar el periodo.
5. Crear respaldo automático.
6. Sustituir TRT, TRT VB, AAO y AAO VB.
7. Registrar la publicación.
8. Actualizar NEXUS.

## Seguridad

Solo pueden publicar:

- GERENCIA
- ADMINISTRADOR

Se utiliza `LockService` para impedir publicaciones simultáneas.

## Pestañas protegidas

El proceso solo reemplaza:

- TRT
- TRT VB
- AAO
- AAO VB

No modifica:

- USUARIOS
- ACCESOS
- PUBLICACIONES
- otras pestañas administrativas

## Auditoría

El script crea automáticamente la pestaña `PUBLICACIONES` con:

- Fecha
- Usuario
- Nombre
- Archivo
- Periodo
- Registros
- Estado
- ID de respaldo
- Notas
- Error

## Restauración

El botón **Restaurar último respaldo** recupera la información anterior.

## Instalación

1. Sustituye `Code.gs`.
2. Publica una nueva versión de Apps Script.
3. Reemplaza todos los archivos en GitHub.
4. Presiona `Ctrl + F5`.

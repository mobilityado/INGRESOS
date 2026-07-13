# Recaudación 365 Enterprise v11

Plataforma ejecutiva con autenticación basada en la pestaña `USUARIOS` y selección de usuario mediante lista desplegable.

## Estructura detectada

La pestaña actual contiene:

- `CONTRASEÑA`
- `USUARIO`
- `NOMBRE`

También se admiten opcionalmente:

- `ROL`: `ADMIN`, `GERENCIA`, `SUPERVISOR` o `CONSULTA`
- `ACTIVO`: `SI`/`NO`, `TRUE`/`FALSE`, `1`/`0`

Cuando `ROL` no existe, el sistema asigna `CONSULTA`.
Cuando `ACTIVO` no existe, el usuario se considera activo.

## Seguridad

La pestaña `USUARIOS` no se descarga al navegador ni se publica en GitHub.

La validación ocurre en Google Apps Script y genera una sesión temporal de seis horas. La hoja de Google Sheets puede mantenerse privada.

> Recomendación: en una siguiente etapa conviene sustituir las contraseñas visibles por hashes. Esta versión mantiene compatibilidad con la estructura actual.

## Configuración

1. Abre el Google Sheets.
2. Ve a **Extensiones > Apps Script**.
3. Sustituye el código por `Code.gs`.
4. Implementa como **Aplicación web**:
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona con el enlace**
5. Copia la URL que termina en `/exec`.
6. Abre `config.js`.
7. Sustituye:

```javascript
API_URL: "PEGA_AQUI_LA_URL_DE_APPS_SCRIPT_EXEC"
```

8. Sube todos los archivos a GitHub.
9. Presiona `Ctrl + F5`.

## Registro de accesos

El script crea automáticamente una pestaña `ACCESOS` con:

- Fecha y hora
- Usuario
- Nombre

## Importante

Para que las pestañas se lean correctamente, sus nombres deben ser:

- `TRT`
- `TRT VB`
- `AAO`
- `AAO VB`


## Lista desplegable de usuarios

La pantalla de acceso consulta únicamente:

- `USUARIO`
- `NOMBRE`

La contraseña nunca se envía en esa lista. Después de elegir el usuario, la contraseña se valida en Apps Script.

Solo aparecen usuarios activos.

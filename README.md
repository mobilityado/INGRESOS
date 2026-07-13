# Recaudación 365 Enterprise v13

## Novedades

- Inicio de sesión con lista desplegable.
- Panel exclusivo para administradores.
- Crear usuarios desde la plataforma.
- Cambiar roles.
- Activar y desactivar cuentas.
- Restablecer contraseñas.
- Consultar el último acceso.
- Registro automático en la pestaña `ACCESOS`.
- Contraseñas nuevas almacenadas con SHA-256 y SALT.
- Compatibilidad con las contraseñas actuales en texto.

## Primera configuración

La pestaña `USUARIOS` puede comenzar así:

```text
CONTRASEÑA | USUARIO | NOMBRE
```

El script agregará automáticamente:

```text
ROL | ACTIVO | SALT
```

Para ver el panel de usuarios, asigna `ADMIN` en la columna `ROL` a tu cuenta.

## Instalación

1. Copia `Code.gs` en Apps Script.
2. Pulsa **Implementar > Administrar implementaciones**.
3. Edita la implementación.
4. Selecciona **Nueva versión**.
5. Ejecutar como: **Yo**.
6. Acceso: **Cualquier persona**.
7. Copia la URL de App web terminada en `/exec`.
8. Pégala en `config.js`.
9. Reemplaza los archivos del repositorio.
10. Presiona `Ctrl + F5`.

## URL correcta

```javascript
API_URL: "https://script.google.com/macros/s/AKfycb.../exec"
```

No utilices la dirección `docs.google.com/spreadsheets`.

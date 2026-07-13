# Recaudación 365 Enterprise v14

Portal corporativo para concentrar las herramientas y la inteligencia operativa de Recaudación.

## Novedades

- Inicio personalizado con el nombre del usuario.
- Panel ejecutivo de bienvenida.
- Indicadores principales del periodo.
- Lanzador de aplicaciones.
- Recaudación Copilot local para preguntas sobre los datos.
- Estado general de la plataforma.
- Perfil del usuario.
- Cambio de contraseña desde el perfil.
- Centro de usuarios para administradores.
- Ingresos 360, comparativos, históricos y reportes.
- Diseño empresarial adaptable a celular.

## Recaudación Copilot

El asistente funciona localmente con reglas y cálculos. No utiliza una API externa ni envía información a servicios de inteligencia artificial.

Puede responder preguntas como:

- ¿Cuál es la marca líder?
- ¿Qué concepto genera más ingreso?
- ¿Cuánto ingresó TRT?
- Dame un resumen ejecutivo.
- ¿Cuál es el total general?

## Configurar aplicaciones

En `config.js`, pega las direcciones reales en cada propiedad `url`.

## Instalación

1. Sustituye `Code.gs` en Google Apps Script.
2. Actualiza la implementación creando una nueva versión.
3. Copia la URL de aplicación web terminada en `/exec`.
4. Pégala en `config.js`.
5. Reemplaza todos los archivos en GitHub.
6. Presiona `Ctrl + F5`.

## Perfil y seguridad

Cada usuario puede cambiar su propia contraseña desde **Mi perfil**. Los administradores continúan pudiendo crear usuarios, cambiar roles, activar cuentas y restablecer contraseñas.

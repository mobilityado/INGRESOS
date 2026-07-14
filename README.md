# NEXUS Business Intelligence Platform v18

La V18 incorpora permisos basados en los roles reales de la pestaña `USUARIOS` y un briefing automático al iniciar.

## URL configurada

La aplicación ya está configurada con:

`https://script.google.com/macros/s/AKfycbxC2mKnafSrn3ngqrzjOqxWcH2Ueh7DEIge0cweju3PHTrRJ7CS5iqQczMpAiWcjLaZIA/exec`

## Roles reconocidos

- `ADMINISTRADOR`: acceso total, incluyendo gestión de usuarios.
- `GERENCIA`: Centro de Inteligencia, comparativos, reportes y configuración.
- `SUPERVISOR`: ingresos, comparativos y Centro de Inteligencia.
- `USUARIO`: consulta de indicadores, gráficas y reportes básicos.

También se reconocen como equivalentes:

- `ADMIN` → `ADMINISTRADOR`
- `CONSULTA` → `USUARIO`

## NEXUS AI Briefing

Al cargar la información se genera automáticamente:

- Marca líder.
- Concepto dominante.
- Variación frente al periodo anterior.
- Marca con menor participación.

## Instalación

1. Sustituye `Code.gs` en Apps Script.
2. Actualiza la implementación mediante **Nueva versión**.
3. Sube todos los archivos a GitHub.
4. Presiona `Ctrl + F5`.

No necesitas editar `config.js`: la URL `/exec` ya viene incluida.

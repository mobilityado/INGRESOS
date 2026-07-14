# NEXUS Business Intelligence Platform v17

## Centro de Inteligencia

La V17 conserva todas las funciones de la V16.1 y agrega un módulo de interpretación automática:

- Semáforo ejecutivo general.
- Índice del periodo de 0 a 100.
- Fortaleza principal.
- Punto de atención.
- Nivel de concentración.
- Resumen automático para dirección.
- Variación de cada marca frente al periodo anterior.
- Oportunidades y alertas.
- Brief ejecutivo listo para copiar.
- Gráficas de crecimiento y composición.

## Criterios del semáforo

- Verde: crecimiento general igual o superior a 3%.
- Amarillo: resultado entre -3% y 3%.
- Rojo: disminución superior a 3%.
- Neutral: no existe un periodo anterior guardado.

El análisis se realiza localmente mediante reglas matemáticas. No utiliza servicios externos ni comparte información con una IA.

## Instalación

1. Reemplaza los archivos de GitHub.
2. Actualiza `Code.gs` mediante una nueva versión en Apps Script.
3. Conserva la URL `/exec` en `config.js`.
4. Presiona `Ctrl + F5`.
5. Guarda periodos en el histórico para activar los comparativos y el semáforo.

# Recaudación 360 — Plataforma Ejecutiva v10

Esta versión integra Ingresos 360 dentro de una plataforma de navegación ejecutiva.

## Incluye

- Inicio ejecutivo con indicadores y accesos rápidos.
- Ingresos 360 general e individual por TRT, TRTVB, AAO y AAOVB.
- Animación de indicadores.
- Ticket promedio.
- Ranking y análisis automático basado en reglas.
- Histórico mensual local.
- Comparativo entre dos meses guardados.
- Gráficas comparativas por marca y concepto.
- Reporte para gerencia en PDF mediante impresión.
- Libro Excel con general, marcas e histórico.
- Resumen ejecutivo para copiar en correo o Teams.
- Centro de aplicaciones para AVA, Semáforo, Happy Moments, Factor, Adeudos y Chatbot.
- Configuración y respaldo del histórico.
- Diseño adaptable y modo oscuro.

## Importante sobre el “asistente”

El análisis es automático y funciona localmente mediante reglas matemáticas; no envía información a una IA externa y no necesita claves de API.

## Configurar accesos a otras aplicaciones

Edita `config.js` y agrega la dirección de cada aplicación en la propiedad `url`.

Ejemplo:

```javascript
{
  name: "AVA Dashboard",
  icon: "📊",
  description: "Análisis de ventas.",
  url: "https://tuusuario.github.io/ava/",
  status: "ready"
}
```

## Instalación

1. Reemplaza todos los archivos del repositorio de GitHub.
2. Espera a que GitHub Pages termine de publicar.
3. Presiona `Ctrl + F5`.
4. Pulsa **Actualizar información**.
5. Guarda los meses validados para activar los comparativos.

## Histórico

Se guarda en el navegador con `localStorage`. El botón **Exportar histórico** permite respaldarlo en JSON.

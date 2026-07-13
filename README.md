# Ingresos 360 — TRT, TRTVB, AAO y AAOVB

## Corrección principal de la versión 5
La aplicación ya no exige que las cuatro marcas estén dentro de un solo libro. Admite:

- Un Excel que contenga las pestañas `TRT`, `TRTVB`, `AAO` y `AAOVB`.
- Hasta cuatro archivos separados, identificados por el nombre del archivo o de la pestaña.
- Selecciones sucesivas: puedes cargar primero una marca y después las restantes.

El botón **Generar reporte ejecutivo** se habilita únicamente cuando se detectan las cuatro marcas.

## Resultado
- Concentrado general.
- Comparativo gráfico de las cuatro marcas.
- Participación porcentual por marca.
- Reporte TRT con dos gráficas.
- Reporte TRTVB con dos gráficas.
- Reporte AAO con dos gráficas.
- Reporte AAOVB con dos gráficas.
- Exportación a Excel con pestaña GENERAL y cuatro pestañas individuales.

## Publicación en GitHub Pages
Sube todos los archivos de esta carpeta al repositorio, reemplazando los anteriores. Luego presiona Ctrl+F5 en el navegador para evitar que se conserve la versión anterior en caché.


## Corrección versión 6

Se corrigió la lectura de importes con separador decimal mexicano y americano.

- `$27,00` ahora se interpreta como **27.00**, no como 2,700.
- `$1.446,52` se interpreta como **1,446.52**.
- `$1,446.52` también se interpreta como **1,446.52**.

Con el archivo `REPORTE DE INGRESOS (2).xlsx`, el cálculo directo de los registros es:

- Canje: $1,684,123.87
- Abordo: $4,337,792.15
- Prepago: $16,155,928.09
- Total: $22,177,844.11

El concentrado manual mostrado tiene una diferencia de $12.00 en Canje. La aplicación usa los datos reales de las cuatro pestañas, sin ajustes manuales.

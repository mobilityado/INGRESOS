/**
 * SISTEMA DE INGRESOS TRT VB
 * Google Apps Script
 *
 * 1. Cambia ID_HOJA por el ID de tu Google Sheets.
 * 2. Implementa como Aplicación web.
 * 3. Ejecutar como: tú.
 * 4. Acceso: cualquier usuario con el enlace (o el permitido por tu empresa).
 */

const ID_HOJA = '1t7_19QrIufcoX-osGVlm4sZ4fpGt4ljP26wwg8nh-Tc';
const HOJA_DATOS = 'TRTVB';
const HOJA_CONCENTRADO = 'Concentrado';

function doGet(e) {
  try {
    e = e || { parameter: {} };
    const accion = e.parameter.accion || 'estado';

    if (accion === 'estado') {
      return respuesta({ error: false, mensaje: 'API de Ingresos activa' });
    }

    if (accion === 'datos') {
      return obtenerDatos(e.parameter.hoja || HOJA_DATOS);
    }

    if (accion === 'resumen') {
      return calcularResumen(
        e.parameter.hoja || HOJA_DATOS,
        e.parameter.filtroMarca || 'nonempty'
      );
    }

    return respuesta({ error: true, mensaje: 'Acción no reconocida' });
  } catch (error) {
    return respuesta({ error: true, mensaje: error.message });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibió información.');
    }

    const data = JSON.parse(e.postData.contents);

    if (data.accion === 'guardarResumen') {
      return guardarResumen(data);
    }

    return respuesta({ error: true, mensaje: 'Acción POST no reconocida' });
  } catch (error) {
    return respuesta({ error: true, mensaje: error.message });
  }
}

function obtenerDatos(nombreHoja) {
  const hoja = SpreadsheetApp.openById(ID_HOJA).getSheetByName(nombreHoja);
  if (!hoja) throw new Error('No existe la hoja: ' + nombreHoja);

  const valores = hoja.getDataRange().getDisplayValues();
  if (valores.length < 2) return respuesta({ error: false, datos: [] });

  // Busca automáticamente la fila que contiene los encabezados.
  const indiceEncabezado = valores.findIndex(fila =>
    fila.some(celda => normalizar(celda) === 'vta man') &&
    fila.some(celda => normalizar(celda) === 'vta abor')
  );

  if (indiceEncabezado < 0) {
    throw new Error('No se encontró la fila de encabezados.');
  }

  const encabezados = valores[indiceEncabezado].map(v => String(v).trim());
  const datos = valores.slice(indiceEncabezado + 1)
    .filter(fila => fila.some(celda => String(celda).trim() !== ''))
    .map(fila => {
      const obj = {};
      encabezados.forEach((encabezado, i) => {
        if (encabezado) obj[encabezado] = convertirNumero(fila[i]);
      });
      return obj;
    });

  return respuesta({ error: false, hoja: nombreHoja, datos: datos });
}

function calcularResumen(nombreHoja, filtroMarca) {
  const resultado = JSON.parse(obtenerDatos(nombreHoja).getContent());
  if (resultado.error) return respuesta(resultado);

  const datos = resultado.datos.filter(fila => {
    const tieneMarca = String(fila.Marca || '').trim() !== '';
    if (filtroMarca === 'all') return true;
    if (filtroMarca === 'empty') return !tieneMarca;
    return tieneMarca;
  });

  const canje = sumar(datos, 'Vta Man');
  const abordo = sumar(datos, 'Vta Abor');
  const prepago = sumar(datos, 'Vta Prepago');

  return respuesta({
    error: false,
    resumen: {
      canje: canje,
      abordo: abordo,
      prepago: prepago,
      total: canje + abordo + prepago,
      registros: datos.length
    }
  });
}

function guardarResumen(data) {
  const libro = SpreadsheetApp.openById(ID_HOJA);
  let hoja = libro.getSheetByName(HOJA_CONCENTRADO);

  if (!hoja) {
    hoja = libro.insertSheet(HOJA_CONCENTRADO);
    hoja.appendRow([
      'Fecha de proceso', 'Mes', 'Año', 'Unidad',
      'Canje', 'Abordo', 'Prepago', 'Total', 'Registros'
    ]);
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, 9)
      .setBackground('#172554')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
  }

  const mes = String(data.mes || '').toUpperCase();
  const anio = Number(data.anio);
  const unidad = String(data.unidad || 'TRT VB');
  const valores = [
    new Date(), mes, anio, unidad,
    Number(data.canje || 0), Number(data.abordo || 0),
    Number(data.prepago || 0), Number(data.total || 0),
    Number(data.registros || 0)
  ];

  // Actualiza la fila del mismo mes/año/unidad; si no existe, crea una nueva.
  const ultimaFila = hoja.getLastRow();
  let filaDestino = ultimaFila + 1;

  if (ultimaFila >= 2) {
    const actuales = hoja.getRange(2, 1, ultimaFila - 1, 9).getValues();
    const indice = actuales.findIndex(fila =>
      String(fila[1]).toUpperCase() === mes &&
      Number(fila[2]) === anio &&
      String(fila[3]).toUpperCase() === unidad.toUpperCase()
    );
    if (indice >= 0) filaDestino = indice + 2;
  }

  hoja.getRange(filaDestino, 1, 1, valores.length).setValues([valores]);
  hoja.getRange(filaDestino, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  hoja.getRange(filaDestino, 5, 1, 4).setNumberFormat('$#,##0.00');
  hoja.autoResizeColumns(1, 9);

  return respuesta({
    error: false,
    mensaje: 'Resumen guardado correctamente',
    fila: filaDestino
  });
}

function sumar(datos, campo) {
  return datos.reduce((total, fila) => total + Number(fila[campo] || 0), 0);
}

function convertirNumero(valor) {
  const texto = String(valor == null ? '' : valor).trim();
  if (texto === '') return '';
  const limpio = texto.replace(/[$,\s]/g, '');
  const numero = Number(limpio);
  return isNaN(numero) ? texto : numero;
}

function normalizar(texto) {
  return String(texto || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function respuesta(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

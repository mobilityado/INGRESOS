const ID_HOJA = '1t7_19QrIufcoX-osGVlm4sZ4fpGt4ljP26wwg8nh-Tc';

function doGet(e) {
  try {
    const accion = (e && e.parameter && e.parameter.accion) || 'estado';
    if (accion === 'estado') return respuesta({error:false,mensaje:'API de Ingresos activa'});
    if (accion === 'todasLasHojas') return obtenerTodasLasHojas();
    if (accion === 'datos') return obtenerUnaHoja((e.parameter.hoja || '').trim());
    return respuesta({error:true,mensaje:'Acción no reconocida'});
  } catch (error) { return respuesta({error:true,mensaje:error.message}); }
}

function obtenerTodasLasHojas() {
  const libro=SpreadsheetApp.openById(ID_HOJA);
  const hojas=[];
  libro.getSheets().forEach(hoja=>{
    const datos=leerDatos(hoja);
    if(datos.length) hojas.push({nombre:hoja.getName(),datos:datos});
  });
  return respuesta({error:false,hojas:hojas});
}

function obtenerUnaHoja(nombre) {
  const libro=SpreadsheetApp.openById(ID_HOJA);
  const hoja=nombre ? libro.getSheetByName(nombre) : libro.getSheets()[0];
  if(!hoja) throw new Error('No existe la hoja solicitada.');
  return respuesta({error:false,nombre:hoja.getName(),datos:leerDatos(hoja)});
}

function leerDatos(hoja) {
  const valores=hoja.getDataRange().getValues();
  const indice=valores.findIndex(fila=>{
    const n=fila.map(normalizar);
    return n.includes('vta man') && n.includes('vta abor') && n.includes('vta prepago');
  });
  if(indice<0) return [];
  const encabezados=valores[indice].map((v,i)=>String(v||'').trim() || 'Columna '+(i+1));
  return valores.slice(indice+1).filter(f=>f.some(v=>String(v||'').trim()!=='' )).map(f=>{
    const obj={}; encabezados.forEach((h,i)=>obj[h]=serializar(f[i])); return obj;
  });
}

function serializar(v) {
  if(v instanceof Date) return Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd HH:mm:ss');
  return v;
}
function normalizar(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase();}
function respuesta(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}

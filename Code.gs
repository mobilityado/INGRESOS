/**
 * NEXUS 2030 ENTERPRISE INTELLIGENCE OPERATING SYSTEM
 * Autenticación, sesiones y administración de usuarios.
 *
 * USUARIOS admite:
 * CONTRASEÑA | USUARIO | NOMBRE | ROL | ACTIVO | SALT
 *
 * Compatibilidad:
 * - Las contraseñas existentes en texto siguen funcionando.
 * - Al crear o restablecer una contraseña desde la aplicación se guarda SHA-256 + SALT.
 */

const ID_HOJA = '1t7_19QrIufcoX-osGVlm4sZ4fpGt4ljP26wwg8nh-Tc';
const HOJA_USUARIOS = 'USUARIOS';
const HOJA_ACCESOS = 'ACCESOS';
const MARCAS = { TRT:'TRT', TRTVB:'TRT VB', AAO:'AAO', AAOVB:'AAO VB' };
const DURACION_SESION_SEGUNDOS = 21600;
const ROLES_VALIDOS = ['USUARIO','SUPERVISOR','GERENCIA','ADMINISTRADOR'];

function doGet() {
  return respuesta({ error:false, message:'API NEXUS ONE 2.1 activa' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Solicitud vacía.');
    const data = JSON.parse(e.postData.contents);
    const action = String(data.action || '').trim();

    if (action === 'listUsers') return listarUsuariosPublicos();
    if (action === 'login') return login(data);
    if (action === 'validate') return validarSesion(data.token);
    if (action === 'logout') return cerrarSesion(data.token);

    const session = obtenerSesion(data.token);
    if (!session) return respuesta({ error:true, authExpired:true, message:'Sesión inválida o expirada.' });

    if (action === 'getData') return obtenerDatos(session);
    if (action === 'getStatus') return obtenerEstado(session);
    if (action === 'publishData') return publicarDatos(session, data);
    if (action === 'restoreLastBackup') return restaurarUltimoRespaldo(session);
    if (action === 'getPublishAudit') return obtenerAuditoriaPublicaciones(session);
    if (action === 'getUsers') return obtenerUsuariosAdmin(session);
    if (action === 'createUser') return crearUsuario(session, data);
    if (action === 'updateUser') return actualizarUsuario(session, data);
    if (action === 'resetPassword') return restablecerPassword(session, data);
    if (action === 'changeOwnPassword') return cambiarPasswordPropio(session, data);

    return respuesta({ error:true, message:'Acción no reconocida.' });
  } catch (error) {
    return respuesta({ error:true, message:error.message });
  }
}

function listarUsuariosPublicos() {
  const usuarios = leerUsuarios()
    .filter(u => u.active)
    .map(u => ({ username:u.username, name:u.name }))
    .sort((a,b) => String(a.name).localeCompare(String(b.name),'es'));
  return respuesta({ error:false, users:usuarios });
}

function login(data) {
  const username = normalizarCredencial(data.username);
  const password = normalizarCredencial(data.password);
  if (!username || !password) return respuesta({ error:true, message:'Selecciona usuario y escribe la contraseña.' });

  const usuario = leerUsuarios().find(u =>
    normalizarCredencial(u.username) === username &&
    verificarPassword(password, u.password, u.salt) &&
    u.active
  );

  if (!usuario) {
    Utilities.sleep(450);
    return respuesta({ error:true, message:'Usuario o contraseña incorrectos.' });
  }

  const token = Utilities.getUuid() + Utilities.getUuid();
  const session = { username:usuario.username, name:usuario.name, role:usuario.role, createdAt:new Date().toISOString() };
  CacheService.getScriptCache().put('session_'+token, JSON.stringify(session), DURACION_SESION_SEGUNDOS);
  registrarAcceso(usuario.username, usuario.name);

  return respuesta({
    error:false, token, expiresIn:DURACION_SESION_SEGUNDOS,
    user:{ username:usuario.username, name:usuario.name, role:usuario.role }
  });
}

function validarSesion(token) {
  const session = obtenerSesion(token);
  if (!session) return respuesta({ error:true, authExpired:true, message:'Sesión expirada.' });
  return respuesta({ error:false, user:{ username:session.username, name:session.name, role:session.role } });
}

function cerrarSesion(token) {
  if (token) CacheService.getScriptCache().remove('session_'+token);
  return respuesta({ error:false, message:'Sesión cerrada.' });
}

function obtenerSesion(token) {
  if (!token) return null;
  const value = CacheService.getScriptCache().get('session_'+token);
  return value ? JSON.parse(value) : null;
}

function exigirAdmin(session) {
  if (normalizarRol(session.role) !== 'ADMINISTRADOR') throw new Error('No tienes permisos de administrador.');
}

function obtenerUsuariosAdmin(session) {
  exigirAdmin(session);
  const accesos = obtenerUltimosAccesos();
  const users = leerUsuarios().map(u => ({
    username:u.username, name:u.name, role:u.role, active:u.active,
    lastAccess:accesos[u.username] || ''
  }));
  return respuesta({ error:false, users });
}

function crearUsuario(session, data) {
  exigirAdmin(session);
  const name = limpiarNombre(data.name);
  const username = normalizarCredencial(data.username);
  const password = normalizarCredencial(data.password);
  const role = validarRol(data.role);

  if (!name || !username || !password) throw new Error('Completa nombre, usuario y contraseña.');
  if (password.length < 4) throw new Error('La contraseña debe tener al menos 4 caracteres.');

  const usuarios = leerUsuarios();
  if (usuarios.some(u => normalizarCredencial(u.username).toLowerCase() === username.toLowerCase())) {
    throw new Error('Ese usuario ya existe.');
  }

  const hoja = obtenerHojaUsuariosPreparada();
  const headers = obtenerMapaEncabezados(hoja);
  const salt = Utilities.getUuid();
  const hash = crearHash(password, salt);
  const row = new Array(hoja.getLastColumn()).fill('');

  row[headers.CONTRASENA] = hash;
  row[headers.USUARIO] = username;
  row[headers.NOMBRE] = name;
  row[headers.ROL] = role;
  row[headers.ACTIVO] = 'SI';
  row[headers.SALT] = salt;

  hoja.appendRow(row);
  return respuesta({ error:false, message:'Usuario creado.' });
}

function actualizarUsuario(session, data) {
  exigirAdmin(session);
  const username = normalizarCredencial(data.username);
  const hoja = obtenerHojaUsuariosPreparada();
  const headers = obtenerMapaEncabezados(hoja);
  const row = buscarFilaUsuario(hoja, headers, username);
  if (row < 2) throw new Error('Usuario no encontrado.');

  if (data.role != null) hoja.getRange(row, headers.ROL + 1).setValue(validarRol(data.role));
  if (data.active != null) {
    if (username === session.username && data.active === false) throw new Error('No puedes desactivar tu propia cuenta.');
    hoja.getRange(row, headers.ACTIVO + 1).setValue(data.active ? 'SI' : 'NO');
  }
  return respuesta({ error:false, message:'Usuario actualizado.' });
}

function cambiarPasswordPropio(session, data) {
  const currentPassword = normalizarCredencial(data.currentPassword);
  const newPassword = normalizarCredencial(data.newPassword);
  if (newPassword.length < 4) throw new Error('La nueva contraseña debe tener al menos 4 caracteres.');

  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => normalizarCredencial(u.username) === normalizarCredencial(session.username));
  if (!usuario || !verificarPassword(currentPassword, usuario.password, usuario.salt)) {
    throw new Error('La contraseña actual no es correcta.');
  }

  const hoja = obtenerHojaUsuariosPreparada();
  const headers = obtenerMapaEncabezados(hoja);
  const row = buscarFilaUsuario(hoja, headers, session.username);
  if (row < 2) throw new Error('Usuario no encontrado.');

  const salt = Utilities.getUuid();
  hoja.getRange(row, headers.CONTRASENA + 1).setValue(crearHash(newPassword, salt));
  hoja.getRange(row, headers.SALT + 1).setValue(salt);
  return respuesta({ error:false, message:'Contraseña actualizada.' });
}

function restablecerPassword(session, data) {
  exigirAdmin(session);
  const username = normalizarCredencial(data.username);
  const password = normalizarCredencial(data.password);
  if (password.length < 4) throw new Error('La contraseña debe tener al menos 4 caracteres.');

  const hoja = obtenerHojaUsuariosPreparada();
  const headers = obtenerMapaEncabezados(hoja);
  const row = buscarFilaUsuario(hoja, headers, username);
  if (row < 2) throw new Error('Usuario no encontrado.');

  const salt = Utilities.getUuid();
  hoja.getRange(row, headers.CONTRASENA + 1).setValue(crearHash(password, salt));
  hoja.getRange(row, headers.SALT + 1).setValue(salt);
  return respuesta({ error:false, message:'Contraseña restablecida.' });
}

function obtenerHojaUsuariosPreparada() {
  const hoja = SpreadsheetApp.openById(ID_HOJA).getSheetByName(HOJA_USUARIOS);
  if (!hoja) throw new Error('No existe la pestaña USUARIOS.');

  const required = ['CONTRASEÑA','USUARIO','NOMBRE','ROL','ACTIVO','SALT'];
  const current = hoja.getLastColumn() > 0 ? hoja.getRange(1,1,1,hoja.getLastColumn()).getDisplayValues()[0] : [];
  const normalized = current.map(normalizarEncabezado);

  required.forEach(header => {
    if (!normalized.includes(normalizarEncabezado(header))) {
      hoja.getRange(1, hoja.getLastColumn()+1).setValue(header);
      normalized.push(normalizarEncabezado(header));
    }
  });

  hoja.getRange(1,1,1,hoja.getLastColumn())
    .setBackground('#071a31').setFontColor('#ffffff').setFontWeight('bold');
  hoja.setFrozenRows(1);
  return hoja;
}

function obtenerMapaEncabezados(hoja) {
  const headers = hoja.getRange(1,1,1,hoja.getLastColumn()).getDisplayValues()[0].map(normalizarEncabezado);
  return {
    CONTRASENA:headers.indexOf('CONTRASENA'),
    USUARIO:headers.indexOf('USUARIO'),
    NOMBRE:headers.indexOf('NOMBRE'),
    ROL:headers.indexOf('ROL'),
    ACTIVO:headers.indexOf('ACTIVO'),
    SALT:headers.indexOf('SALT')
  };
}

function buscarFilaUsuario(hoja, headers, username) {
  const last = hoja.getLastRow();
  if (last < 2) return -1;
  const values = hoja.getRange(2, headers.USUARIO+1, last-1, 1).getDisplayValues();
  const idx = values.findIndex(r => normalizarCredencial(r[0]).toLowerCase() === username.toLowerCase());
  return idx < 0 ? -1 : idx + 2;
}

function leerUsuarios() {
  const hoja = obtenerHojaUsuariosPreparada();
  const valores = hoja.getDataRange().getDisplayValues();
  if (valores.length < 2) return [];
  const h = obtenerMapaEncabezados(hoja);

  return valores.slice(1)
    .filter(row => row.some(cell => String(cell).trim() !== ''))
    .map(row => ({
      password:String(row[h.CONTRASENA] || '').trim(),
      username:String(row[h.USUARIO] || '').trim(),
      name:limpiarNombre(row[h.NOMBRE]),
      role:normalizarRol(row[h.ROL] || 'USUARIO'),
      active:!['NO','INACTIVO','FALSE','0'].includes(String(row[h.ACTIVO] || 'SI').trim().toUpperCase()),
      salt:String(row[h.SALT] || '').trim()
    }));
}

function verificarPassword(input, stored, salt) {
  if (!salt) return normalizarCredencial(input) === normalizarCredencial(stored);
  return crearHash(input, salt) === stored;
}

function crearHash(password, salt) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(password) + '|' + String(salt),
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => {
    const v = b < 0 ? b + 256 : b;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

function obtenerEstado(session) {
  return respuesta({
    error:false,
    serverTime:new Date().toISOString(),
    user:{username:session.username,name:session.name,role:session.role},
    sessionExpiresIn:DURACION_SESION_SEGUNDOS
  });
}

function obtenerDatos(session) {
  const libro = SpreadsheetApp.openById(ID_HOJA);
  const data = {};
  Object.keys(MARCAS).forEach(key => {
    const hoja = libro.getSheetByName(MARCAS[key]);
    if (!hoja) throw new Error('No existe la pestaña '+MARCAS[key]);
    data[key] = hojaAObjetos(hoja);
  });
  return respuesta({ error:false, user:session.username, generatedAt:new Date().toISOString(), data });
}

function hojaAObjetos(hoja) {
  const valores = hoja.getDataRange().getDisplayValues();
  const indice = valores.findIndex(row => {
    const n = row.map(normalizarEncabezado);
    return n.includes('VTA MAN') && n.includes('VTA ABOR') && n.includes('VTA PREPAGO');
  });
  if (indice < 0) throw new Error('No se encontraron encabezados válidos en '+hoja.getName());

  const headers = valores[indice].map((v,i) => String(v||'').replace(/\s+/g,' ').trim() || 'Columna '+(i+1));
  return valores.slice(indice+1)
    .filter(row => row.some(cell => String(cell).trim() !== ''))
    .map(row => {
      const obj={};headers.forEach((header,i)=>obj[header]=row[i]||'');return obj;
    });
}

function registrarAcceso(username, name) {
  const libro = SpreadsheetApp.openById(ID_HOJA);
  let hoja = libro.getSheetByName(HOJA_ACCESOS);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA_ACCESOS);
    hoja.appendRow(['FECHA','USUARIO','NOMBRE']);
    hoja.getRange(1,1,1,3).setBackground('#071a31').setFontColor('#ffffff').setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  hoja.appendRow([new Date(),username,name]);
  hoja.getRange(hoja.getLastRow(),1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
}

function obtenerUltimosAccesos() {
  const hoja = SpreadsheetApp.openById(ID_HOJA).getSheetByName(HOJA_ACCESOS);
  if (!hoja || hoja.getLastRow() < 2) return {};
  const values = hoja.getRange(2,1,hoja.getLastRow()-1,3).getDisplayValues();
  const result={};
  values.forEach(row => { if(row[1]) result[row[1]] = row[0]; });
  return result;
}


function exigirPublicador(session) {
  const role = normalizarRol(session.role);
  if (!['GERENCIA','ADMINISTRADOR'].includes(role)) {
    throw new Error('Tu rol no permite publicar información oficial.');
  }
}

function publicarDatos(session, data) {
  exigirPublicador(session);

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Otro usuario está publicando información. Intenta nuevamente.');

  try {
    validarPayloadPublicacion(data);

    const libro = SpreadsheetApp.openById(ID_HOJA);
    const backupId = crearRespaldoInterno(libro, session, data);
    const mapa = { TRT:'TRT', TRTVB:'TRT VB', AAO:'AAO', AAOVB:'AAO VB' };

    Object.keys(mapa).forEach(key => {
      const sheet = libro.getSheetByName(mapa[key]);
      if (!sheet) throw new Error('No existe la pestaña ' + mapa[key]);

      const block = data.data[key];
      const values = [block.headers].concat(block.rows);
      const oldRows = Math.max(sheet.getLastRow(), 1);
      const oldCols = Math.max(sheet.getLastColumn(), values[0].length);

      sheet.getRange(1, 1, oldRows, oldCols).clearContent();
      sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
      sheet.setFrozenRows(1);
    });

    registrarPublicacion(session, data, 'OK', backupId, '');
    PropertiesService.getScriptProperties().setProperty('LAST_BACKUP_ID', backupId);

    return respuesta({
      error:false,
      message:'Periodo publicado correctamente. Se creó un respaldo automático.',
      backupId:backupId
    });
  } catch (error) {
    try { registrarPublicacion(session, data, 'ERROR', '', error.message); } catch (ignored) {}
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function validarPayloadPublicacion(data) {
  if (!data || !data.data) throw new Error('No se recibió información para publicar.');
  ['TRT','TRTVB','AAO','AAOVB'].forEach(key => {
    const block = data.data[key];
    if (!block || !Array.isArray(block.headers) || !block.headers.length || !Array.isArray(block.rows) || !block.rows.length) {
      throw new Error(key + ': información incompleta.');
    }
    const normalized = block.headers.map(normalizarEncabezado);
    ['VTA MAN','VTA ABOR','VTA PREPAGO'].forEach(required => {
      if (!normalized.includes(required)) throw new Error(key + ': falta la columna ' + required);
    });
  });
}

function crearRespaldoInterno(libro, session, data) {
  const backupId = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '_' + Utilities.getUuid().slice(0,8);
  const mapa = { TRT:'TRT', TRTVB:'TRT VB', AAO:'AAO', AAOVB:'AAO VB' };
  const backup = {
    id:backupId,
    createdAt:new Date().toISOString(),
    user:session.username,
    name:session.name,
    period:String(data.period || ''),
    sheets:{}
  };

  Object.keys(mapa).forEach(key => {
    const sheet = libro.getSheetByName(mapa[key]);
    if (!sheet) throw new Error('No existe la pestaña ' + mapa[key]);
    backup.sheets[key] = sheet.getDataRange().getDisplayValues();
  });

  const props = PropertiesService.getScriptProperties();
  props.setProperty('BACKUP_' + backupId, JSON.stringify(backup));
  const index = JSON.parse(props.getProperty('BACKUP_INDEX') || '[]');
  index.unshift({id:backupId,createdAt:backup.createdAt,period:backup.period,user:backup.user});
  props.setProperty('BACKUP_INDEX', JSON.stringify(index.slice(0,10)));

  // Eliminar respaldos antiguos para no exceder el almacenamiento.
  index.slice(10).forEach(item => props.deleteProperty('BACKUP_' + item.id));
  return backupId;
}

function restaurarUltimoRespaldo(session) {
  exigirPublicador(session);
  const props = PropertiesService.getScriptProperties();
  const backupId = props.getProperty('LAST_BACKUP_ID');
  if (!backupId) throw new Error('No existe un respaldo disponible.');

  const raw = props.getProperty('BACKUP_' + backupId);
  if (!raw) throw new Error('El respaldo ya no está disponible.');
  const backup = JSON.parse(raw);

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Otro usuario está actualizando la información.');

  try {
    const libro = SpreadsheetApp.openById(ID_HOJA);
    const mapa = { TRT:'TRT', TRTVB:'TRT VB', AAO:'AAO', AAOVB:'AAO VB' };

    Object.keys(mapa).forEach(key => {
      const values = backup.sheets[key];
      if (!Array.isArray(values) || !values.length) throw new Error('Respaldo incompleto para ' + key);

      const sheet = libro.getSheetByName(mapa[key]);
      const oldRows = Math.max(sheet.getLastRow(), 1);
      const oldCols = Math.max(sheet.getLastColumn(), values[0].length);
      sheet.getRange(1,1,oldRows,oldCols).clearContent();
      sheet.getRange(1,1,values.length,values[0].length).setValues(values);
      sheet.setFrozenRows(1);
    });

    registrarPublicacion(session, {
      fileName:'RESTAURACIÓN',
      period:backup.period || 'Respaldo anterior',
      summary:{count:0}
    }, 'RESTAURADO', backupId, '');

    return respuesta({
      error:false,
      message:'Se restauró el respaldo del ' + new Date(backup.createdAt).toLocaleString()
    });
  } finally {
    lock.releaseLock();
  }
}

function obtenerHojaPublicaciones() {
  const libro = SpreadsheetApp.openById(ID_HOJA);
  let hoja = libro.getSheetByName('PUBLICACIONES');
  if (!hoja) {
    hoja = libro.insertSheet('PUBLICACIONES');
    hoja.appendRow(['FECHA','USUARIO','NOMBRE','ARCHIVO','PERIODO','REGISTROS','ESTADO','BACKUP_ID','NOTAS','ERROR']);
    hoja.getRange(1,1,1,10).setBackground('#071a31').setFontColor('#ffffff').setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function registrarPublicacion(session, data, status, backupId, error) {
  const hoja = obtenerHojaPublicaciones();
  hoja.appendRow([
    new Date(),
    session.username,
    session.name,
    String(data.fileName || ''),
    String(data.period || ''),
    Number(data.summary && data.summary.count || 0),
    status,
    backupId || '',
    String(data.notes || ''),
    error || ''
  ]);
  hoja.getRange(hoja.getLastRow(),1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
}

function obtenerAuditoriaPublicaciones(session) {
  exigirPublicador(session);
  const hoja = obtenerHojaPublicaciones();
  if (hoja.getLastRow() < 2) return respuesta({error:false,records:[]});

  const values = hoja.getRange(2,1,hoja.getLastRow()-1,10).getDisplayValues();
  const records = values.slice(-50).reverse().map(row => ({
    date:row[0],
    user:row[2] || row[1],
    file:row[3],
    period:row[4],
    rows:Number(String(row[5]).replace(/[^0-9.-]/g,'')) || 0,
    status:row[6]
  }));
  return respuesta({error:false,records:records});
}


function normalizarRol(value) {
  const role = normalizarEncabezado(value || 'USUARIO');
  if (['ADMIN','ADMINISTRADOR','ADMINISTRATOR'].includes(role)) return 'ADMINISTRADOR';
  if (['GERENCIA','GERENTE','MANAGER'].includes(role)) return 'GERENCIA';
  if (['SUPERVISOR','SUPERVISION'].includes(role)) return 'SUPERVISOR';
  return 'USUARIO';
}
function validarRol(value) {
  return normalizarRol(value);
}

function normalizarEncabezado(value) {
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toUpperCase();
}
function normalizarCredencial(value) { return String(value==null?'':value).trim(); }
function limpiarNombre(value) { return String(value||'').replace(/\s+/g,' ').trim(); }
function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

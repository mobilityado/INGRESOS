/**
 * RECAUDACIÓN 365 ENTERPRISE
 * API segura con autenticación y sesiones temporales.
 *
 * PASOS:
 * 1. Pega este archivo en Extensiones > Apps Script.
 * 2. Cambia ID_HOJA si utilizas otro Google Sheets.
 * 3. Implementa como Aplicación web:
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona con el enlace
 * 4. Copia la URL terminada en /exec y colócala en config.js.
 *
 * La hoja puede permanecer privada. Los usuarios nunca se descargan a GitHub.
 */

const ID_HOJA = '1t7_19QrIufcoX-osGVlm4sZ4fpGt4ljP26wwg8nh-Tc';
const HOJA_USUARIOS = 'USUARIOS';
const MARCAS = {
  TRT: 'TRT',
  TRTVB: 'TRT VB',
  AAO: 'AAO',
  AAOVB: 'AAO VB'
};
const DURACION_SESION_SEGUNDOS = 21600; // 6 horas

function doGet() {
  return respuesta({ error: false, message: 'API Recaudación 365 activa' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Solicitud vacía.');
    }

    const data = JSON.parse(e.postData.contents);
    const action = String(data.action || '').trim();

    if (action === 'listUsers') return listarUsuariosPublicos();
    if (action === 'login') return login(data);
    if (action === 'validate') return validarSesion(data.token);
    if (action === 'logout') return cerrarSesion(data.token);

    const session = obtenerSesion(data.token);
    if (!session) {
      return respuesta({ error: true, authExpired: true, message: 'Sesión inválida o expirada.' });
    }

    if (action === 'getData') return obtenerDatos(session);
    if (action === 'getUsers') return obtenerUsuariosAdmin(session);

    return respuesta({ error: true, message: 'Acción no reconocida.' });
  } catch (error) {
    return respuesta({ error: true, message: error.message });
  }
}

function listarUsuariosPublicos() {
  const usuarios = leerUsuarios()
    .filter(u => u.active)
    .map(u => ({
      username: u.username,
      name: u.name
    }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));

  return respuesta({
    error: false,
    users: usuarios
  });
}

function login(data) {
  const username = normalizarCredencial(data.username);
  const password = normalizarCredencial(data.password);

  if (!username || !password) {
    return respuesta({ error: true, message: 'Escribe usuario y contraseña.' });
  }

  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u =>
    normalizarCredencial(u.username) === username &&
    normalizarCredencial(u.password) === password &&
    u.active
  );

  if (!usuario) {
    Utilities.sleep(450);
    return respuesta({ error: true, message: 'Usuario o contraseña incorrectos.' });
  }

  const token = Utilities.getUuid() + Utilities.getUuid();
  const session = {
    username: usuario.username,
    name: usuario.name,
    role: usuario.role,
    createdAt: new Date().toISOString()
  };

  CacheService.getScriptCache().put(
    'session_' + token,
    JSON.stringify(session),
    DURACION_SESION_SEGUNDOS
  );

  registrarAcceso(usuario.username, usuario.name);

  return respuesta({
    error: false,
    token: token,
    expiresIn: DURACION_SESION_SEGUNDOS,
    user: {
      username: usuario.username,
      name: usuario.name,
      role: usuario.role
    }
  });
}

function validarSesion(token) {
  const session = obtenerSesion(token);
  if (!session) {
    return respuesta({ error: true, authExpired: true, message: 'Sesión expirada.' });
  }
  return respuesta({
    error: false,
    user: {
      username: session.username,
      name: session.name,
      role: session.role
    }
  });
}

function cerrarSesion(token) {
  if (token) CacheService.getScriptCache().remove('session_' + token);
  return respuesta({ error: false, message: 'Sesión cerrada.' });
}

function obtenerSesion(token) {
  if (!token) return null;
  const value = CacheService.getScriptCache().get('session_' + token);
  if (!value) return null;
  return JSON.parse(value);
}

function obtenerDatos(session) {
  const libro = SpreadsheetApp.openById(ID_HOJA);
  const data = {};

  Object.keys(MARCAS).forEach(key => {
    const hoja = libro.getSheetByName(MARCAS[key]);
    if (!hoja) throw new Error('No existe la pestaña ' + MARCAS[key]);
    data[key] = hojaAObjetos(hoja);
  });

  return respuesta({
    error: false,
    user: session.username,
    generatedAt: new Date().toISOString(),
    data: data
  });
}

function leerUsuarios() {
  const hoja = SpreadsheetApp.openById(ID_HOJA).getSheetByName(HOJA_USUARIOS);
  if (!hoja) throw new Error('No existe la pestaña USUARIOS.');

  const valores = hoja.getDataRange().getDisplayValues();
  if (valores.length < 2) return [];

  const headers = valores[0].map(normalizarEncabezado);
  const iPassword = buscarColumna(headers, ['CONTRASENA', 'PASSWORD', 'CLAVE']);
  const iUser = buscarColumna(headers, ['USUARIO', 'USER']);
  const iName = buscarColumna(headers, ['NOMBRE', 'NAME']);
  const iRole = buscarColumna(headers, ['ROL', 'ROLE']);
  const iActive = buscarColumna(headers, ['ACTIVO', 'ACTIVE', 'ESTATUS']);

  if (iPassword < 0 || iUser < 0 || iName < 0) {
    throw new Error('USUARIOS debe contener CONTRASEÑA, USUARIO y NOMBRE.');
  }

  return valores.slice(1)
    .filter(row => row.some(cell => String(cell).trim() !== ''))
    .map(row => ({
      password: String(row[iPassword] || '').trim(),
      username: String(row[iUser] || '').trim(),
      name: limpiarNombre(row[iName]),
      role: iRole >= 0 ? String(row[iRole] || 'CONSULTA').trim().toUpperCase() : 'CONSULTA',
      active: iActive < 0 ? true : !['NO', 'INACTIVO', 'FALSE', '0'].includes(String(row[iActive] || '').trim().toUpperCase())
    }));
}

function obtenerUsuariosAdmin(session) {
  if (String(session.role).toUpperCase() !== 'ADMIN') {
    return respuesta({ error: true, message: 'No tienes permisos de administrador.' });
  }
  const users = leerUsuarios().map(u => ({
    username: u.username,
    name: u.name,
    role: u.role,
    active: u.active
  }));
  return respuesta({ error: false, users: users });
}

function hojaAObjetos(hoja) {
  const valores = hoja.getDataRange().getDisplayValues();
  if (!valores.length) return [];

  const indiceEncabezado = valores.findIndex(row => {
    const normalized = row.map(normalizarEncabezado);
    return normalized.includes('VTA MAN') &&
           normalized.includes('VTA ABOR') &&
           normalized.includes('VTA PREPAGO');
  });

  if (indiceEncabezado < 0) {
    throw new Error('No se encontraron encabezados válidos en ' + hoja.getName());
  }

  const encabezados = valores[indiceEncabezado].map((value, index) =>
    String(value || '').replace(/\s+/g, ' ').trim() || 'Columna ' + (index + 1)
  );

  return valores.slice(indiceEncabezado + 1)
    .filter(row => row.some(cell => String(cell).trim() !== ''))
    .map(row => {
      const obj = {};
      encabezados.forEach((header, i) => obj[header] = row[i] || '');
      return obj;
    });
}

function registrarAcceso(username, name) {
  const libro = SpreadsheetApp.openById(ID_HOJA);
  let hoja = libro.getSheetByName('ACCESOS');

  if (!hoja) {
    hoja = libro.insertSheet('ACCESOS');
    hoja.appendRow(['FECHA', 'USUARIO', 'NOMBRE']);
    hoja.getRange(1, 1, 1, 3)
      .setBackground('#071a31')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    hoja.setFrozenRows(1);
  }

  hoja.appendRow([new Date(), username, name]);
  hoja.getRange(hoja.getLastRow(), 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
}

function buscarColumna(headers, options) {
  return headers.findIndex(header => options.includes(header));
}

function normalizarEncabezado(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function normalizarCredencial(value) {
  return String(value == null ? '' : value).trim();
}

function limpiarNombre(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function respuesta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

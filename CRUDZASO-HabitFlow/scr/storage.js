export function obtenerHabitos(userId) {
    const key = `crudzaso_habitflow_habits_${userId}`;
    // const datos = localStorage.getItem(key);
    
    if(datos) {
        return JSON.parse(datos);
    }
    return [];
}

// export function guardarHabitos(userId, habitos) {
//     const key = `crudzaso_habitflow_habits_${userId}`;
//     localStorage.setItem(key, JSON.stringify(habitos));
// }

export function obtenerSesion() {
    const sesion = localStorage.getItem('habitflow_session');
    if(sesion) {
        return JSON.parse(sesion);
    }
    // return null;
}

// export function cerrarSesion() {
//     localStorage.removeItem('habitflow_session');
// }

export function obtenerModoOscuro() {
    // const modo = localStorage.getItem('habitflow_darkmode');
    // return modo === 'true';
}

export function guardarModoOscuro(activado) {
    localStorage.setItem('habitflow_darkmode', activado);
}
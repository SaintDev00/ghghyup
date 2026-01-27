import * as habitService from '../scr/ui.js';
import { obtenerSesion, cerrarSesion, obtenerModoOscuro, guardarModoOscuro } from './storage.js';

let filtroActual = 'todos';
let busquedaActual = '';
let habitoEditando = null;

const sesion = obtenerSesion();
if(!sesion) {
    window.location.href = 'index.html';
} else {
    habitService.inicializar(sesion.userId);
    iniciar();
}

function iniciar() {
    document.getElementById('userName').textContent = `Hola, ${sesion.nombre}`;
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('habitForm').addEventListener('submit', crearHabito);
    document.getElementById('darkModeBtn').addEventListener('click', toggleDark);
    document.getElementById('searchInput').addEventListener('input', buscar);
    
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', function() {
            btns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroActual = this.dataset.filter;
            renderizar();
        });
    });
    
    if(obtenerModoOscuro()) {
        document.body.classList.add('dark');
    }
    
    renderizar();
}

function logout() {
    cerrarSesion();
    window.location.href = 'index.html';
}

function crearHabito(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('habitTitle').value;
    const freq = document.getElementById('habitFrequency').value;
    const prio = document.getElementById('habitPriority').value;
    
    habitService.crear(titulo, freq, prio);
    
    document.getElementById('habitForm').reset();
    
    renderizar();
}

function toggleDark() {
    document.body.classList.toggle('dark');
    const activado = document.body.classList.contains('dark');
    guardarModoOscuro(activado);
}

function buscar(e) {
    busquedaActual = e.target.value.toLowerCase();
    renderizar();
}

function renderizar() {
    let habitos = habitService.obtenerTodos();
    
    if(filtroActual !== 'todos') {
        habitos = habitos.filter(h => h.status === filtroActual);
    }
    
    if(busquedaActual) {
        habitos = habitos.filter(h => 
            h.title.toLowerCase().includes(busquedaActual)
        );
    }
    
    document.getElementById('pendingColumn').innerHTML = '';
    document.getElementById('progressColumn').innerHTML = '';
    document.getElementById('doneColumn').innerHTML = '';
    
    habitos.forEach(habito => {
        const card = crearTarjeta(habito);
        
        if(habito.status === 'pendiente') {
            document.getElementById('pendingColumn').appendChild(card);
        } else if(habito.status === 'en-proceso') {
            document.getElementById('progressColumn').appendChild(card);
        } else {
            document.getElementById('doneColumn').appendChild(card);
        }
    });
    
    actualizarContadores();
}


function crearTarjeta(habito) {
    const div = document.createElement('div');
    div.className = `habit-card p-${habito.priority}`;
    
    if(habito.priority === 'alta') {
        div.style.borderLeftWidth = '5px';
    }
    
    div.innerHTML = `
        <div class="habit-header">
            <div class="habit-title">
                <span class="title-text">${habito.title}</span>
                <input type="text" class="title-input" value="${habito.title}" style="display: none;">
            </div>
            <span class="habit-priority">${habito.priority}</span>
        </div>
        <div class="habit-info">
            Frecuencia: ${habito.frequency}<br>
            Creado: ${new Date(habito.createdAt).toLocaleDateString()}
        </div>
        <div class="habit-actions">
            <button class="btn-next">Cambiar Estado</button>
            <button class="btn-edit">Editar</button>
            <button class="btn-delete">Eliminar</button>
        </div>
    `;
    
    const btnNext = div.querySelector('.btn-next');
    const btnEdit = div.querySelector('.btn-edit');
    const btnDelete = div.querySelector('.btn-delete');
    
    btnNext.addEventListener('click', function() {
        habitService.cambiarEstado(habito.id);
        renderizar();
    });
    
    btnEdit.addEventListener('click', function() {
        editarTitulo(div, habito.id);
    });
    
    btnDelete.addEventListener('click', function() {
        if(confirm('¿Seguro que quieres eliminar este hábito?')) {
            habitService.eliminar(habito.id);
            renderizar();
        }
    });
    
    return div;
}

function editarTitulo(card, habitoId) {
    const titleText = card.querySelector('.title-text');
    const titleInput = card.querySelector('.title-input');
    const btnEdit = card.querySelector('.btn-edit');
    
    if(habitoEditando === habitoId) {
        const nuevoTitulo = titleInput.value.trim();
        if(nuevoTitulo) {
            habitService.actualizar(habitoId, { title: nuevoTitulo });
            renderizar();
        }
        habitoEditando = null;
    } else {
        titleText.style.display = 'none';
        titleInput.style.display = 'block';
        titleInput.focus();
        btnEdit.textContent = 'Guardar';
        btnEdit.classList.remove('btn-edit');
        btnEdit.classList.add('btn-save');
        habitoEditando = habitoId;
    }
}

function actualizarContadores() {
    const conteos = habitService.contarPorEstado();
    
    document.getElementById('totalCount').textContent = conteos.total;
    document.getElementById('pendingCount').textContent = conteos.pendiente;
    document.getElementById('progressCount').textContent = conteos.enProceso;
    document.getElementById('doneCount').textContent = conteos.completado;
}}
document.addEventListener('DOMContentLoaded', () => {
    // Variables de control de estado para habilitar botones finales
    let seccionesGuardadas = {
        datosGenerales: false,
        datosCuerpoAgua: false,
        numeroControl: false
    };

    /**
     * Función genérica para validar campos vacíos en un contenedor específico
     * @param {string} containerId - ID del contenedor del acordeón
     */
    function validarCampos(containerId) {
        const container = document.getElementById(containerId);
        const inputs = container.querySelectorAll('input, select, textarea');
        let todoLleno = true;

        inputs.forEach(input => {
            if (input.value.trim() === "" || input.value === "Seleccione Zona...") {
                input.style.borderColor = "red"; // Feedback visual de error
                todoLleno = false;
            } else {
                input.style.borderColor = "#ccc";
            }
        });

        if (!todoLleno) {
            alert("Por favor, completa todos los campos de esta sección antes de guardar.");
        }
        return todoLleno;
    }

    /**
     * Actualiza el estado de los botones de acción finales (Guardar / Iniciar Protocolo)
     */
    function actualizarBotonesFinales() {
        const btnVerde = document.querySelector('.createProject-btn-action-green');
        const btnAzul = document.querySelector('.createProject-btn-action-blue');
        
        const todosGuardados = seccionesGuardadas.datosGenerales && 
                               seccionesGuardadas.datosCuerpoAgua && 
                               seccionesGuardadas.numeroControl;

        if (todosGuardados) {
            btnVerde.classList.remove('createProject-btn-action-gray');
            btnAzul.classList.remove('createProject-btn-action-gray');
            btnVerde.style.pointerEvents = "auto";
            btnAzul.style.pointerEvents = "auto";
            btnVerde.style.opacity = "1";
            btnAzul.style.opacity = "1";
        } else {
            // Estado deshabilitado inicial
            btnVerde.style.pointerEvents = "none";
            btnAzul.style.pointerEvents = "none";
            btnVerde.style.opacity = "0.5";
            btnAzul.style.opacity = "0.5";
        }
    }

    // --- Lógica de los botones "Guardar Datos" de los submenús ---

    document.getElementById("btnGuardarDatos1").addEventListener("click", function () {
        if (validarCampos('collapseDatos')) {
            seccionesGuardadas.datosGenerales = true;
            new bootstrap.Collapse(document.getElementById('collapseDatos')).hide();
            new bootstrap.Collapse(document.getElementById('collapseAgua')).show();
            actualizarBotonesFinales();
        }
    });

    document.getElementById("btnGuardarDatos2").addEventListener("click", function () {
        if (validarCampos('collapseAgua')) {
            seccionesGuardadas.datosCuerpoAgua = true;
            new bootstrap.Collapse(document.getElementById('collapseAgua')).hide();
            new bootstrap.Collapse(document.getElementById('collapseID')).show();
            actualizarBotonesFinales();
        }
    });

    document.getElementById("btnGuardarDatos3").addEventListener("click", function () {
        if (validarCampos('collapseID')) {
            seccionesGuardadas.numeroControl = true;
            new bootstrap.Collapse(document.getElementById('collapseID')).hide();
            actualizarBotonesFinales();
        }
    });

    // --- Lógica de Invitación de Colaboradores ---

    const inviteInput = document.querySelector('.createProject-invite-input');
    const addCollabBtn = document.querySelector('.createProject-collab-add');
    const emptyState = document.querySelector('.createProject-empty-state');
    const rightPanel = document.querySelector('.createProject-right-panel > div:first-child');

    // Crear contenedor de lista si no existe
    let collabList = document.querySelector('.createProject-collab-list');
    if (!collabList) {
        collabList = document.createElement('div');
        collabList.className = 'createProject-collab-list';
        rightPanel.appendChild(collabList);
    }

    function agregarColaborador() {
        const email = inviteInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            alert("Por favor, ingresa un correo electrónico válido (ejemplo@dominio.com).");
            return;
        }

        // Simulación de obtención de nombre (esto se conectará a la BD después)
        const nombreSimulado = "Usuario " + email.split('@')[0];

        // Ocultar estado vacío
        emptyState.style.display = "none";

        // Crear elemento de colaborador
        const collabItem = document.createElement('div');
        collabItem.className = 'createProject-collab-item';
        collabItem.innerHTML = `
            <div class="createProject-collab-avatar"><i class="fas fa-user"></i></div>
            <div class="createProject-collab-info">
                <p class="createProject-collab-name">${nombreSimulado}</p>
                <p class="createProject-collab-email">${email}</p>
            </div>
            <i class="far fa-times-circle createProject-collab-remove"></i>
        `;

        // Evento para eliminar
        collabItem.querySelector('.createProject-collab-remove').addEventListener('click', function() {
            collabItem.remove();
            if (collabList.children.length === 0) {
                emptyState.style.display = "block";
            }
        });

        collabList.appendChild(collabItem);
        inviteInput.value = ""; // Limpiar input
    }

    addCollabBtn.addEventListener('click', agregarColaborador);
    inviteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') agregarColaborador();
    });

    // Inicializar botones finales como deshabilitados
    actualizarBotonesFinales();
});
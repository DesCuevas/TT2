let currentStep = 1;
const totalSteps = 4;

const progressBar = document.getElementById('progress-bar');
const btnNext = document.getElementById('btn-next');
const btnBack = document.getElementById('btn-back');
const btnSave = document.getElementById('btn-save');
const stepTitle = document.getElementById('step-title');
const successModal = document.getElementById('success-modal');

const titles = [
    "Llena tus Materiales",
    "Llena tus Materiales",
    "Responsables del Muestreo",
    "Firma del Responsable"
];

// Navegación
btnNext.addEventListener('click', () => {
    if (currentStep < totalSteps) {
        currentStep++;
        updateUI();
    }
});

btnBack.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
});

function updateUI() {
    // Alternar visibilidad de pasos
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.dataset.step) === currentStep) {
            step.classList.add('active');
        }
    });

    // Actualizar barra de progreso
    progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
    
    // Actualizar Título
    stepTitle.innerText = titles[currentStep - 1];

    // Control de botones
    btnBack.disabled = (currentStep === 1);
    btnBack.style.background = (currentStep === 1) ? "#ccc" : "#999";

    if (currentStep === totalSteps) {
        btnNext.style.display = 'none';
        btnSave.style.display = 'block';
    } else {
        btnNext.style.display = 'block';
        btnSave.style.display = 'none';
    }
}

// Lógica de Contadores (Paso 2)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('plus')) {
        const span = e.target.previousElementSibling;
        span.innerText = parseInt(span.innerText) + 1;
    }
    if (e.target.classList.contains('minus')) {
        const span = e.target.nextElementSibling;
        if (parseInt(span.innerText) > 0) {
            span.innerText = parseInt(span.innerText) - 1;
        }
    }
});

// Añadir Responsable (Paso 3)
document.getElementById('add-responsable').addEventListener('click', () => {
    const container = document.getElementById('responsables-container');
    const newRow = document.createElement('div');
    newRow.className = 'responsable-row';
    newRow.innerHTML = `
        <div class="input-group">
            <label>Nombre:</label>
            <input type="text" placeholder="Indique el nombre del responsable">
        </div>
        <div class="input-group">
            <label>Tipo:</label>
            <select>
                <option>Técnico</option>
                <option>Conductor</option>
                <option>Investigador</option>
            </select>
        </div>
    `;
    container.appendChild(newRow);
});

// Guardar y Finalizar
btnSave.addEventListener('click', () => {
    // Buscamos el modal por su ID
    const modal = document.getElementById('success-modal');
    
    // Primero lo ponemos en flex para que el navegador lo renderice
    modal.style.display = 'flex';
    
    // Usamos un pequeño delay para que la transición de opacidad y escala sea visible
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Redirección automática
    setTimeout(() => {
        window.location.href = "inicio.html";
    }, 10000);
});
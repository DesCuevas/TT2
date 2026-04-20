document.addEventListener('DOMContentLoaded', () => {
    const btnModificar = document.getElementById('btnModificar');
    const btnGuardar = document.getElementById('btnGuardar');
    const allInputs = document.querySelectorAll('#protocolOneAccordion input, #protocolOneAccordion select');
    const listResponsables = document.getElementById('responsablesList');
    const btnAddResp = document.getElementById('btnAddResp');
    const btnAddOther = document.getElementById('btnAddOtherMaterial');
    const othersContainer = document.getElementById('othersTableContainer');

    // 1. Lógica Edición (Admin)
    if (btnModificar) {
        btnModificar.addEventListener('click', () => {
            // Habilitar todos los inputs, selects y textareas
            const allFormElements = document.querySelectorAll('#protocolOneAccordion input, #protocolOneAccordion textarea, #protocolOneAccordion select');
    
            allFormElements.forEach(el => {
                el.disabled = false;
            });

            // Mostrar botones de gestión
            if (btnAddOther) btnAddOther.classList.remove('d-none');
            document.querySelectorAll('.btn-remove-other, btn-remove-resp').forEach(btn => btn.classList.remove('d-none'));

            btnModificar.classList.add('d-none');
            btnGuardar.classList.remove('d-none');
        });

        btnGuardar.addEventListener('click', () => {
            // Deshabilitar todo de nuevo
            document.querySelectorAll('#protocolOneAccordion input, #protocolOneAccordion textarea').forEach(el => {
                el.disabled = true;
            });

            // Ocultar botones de gestión
            if (btnAddOther) btnAddOther.classList.add('d-none');
            document.querySelectorAll('.btn-remove-other').forEach(btn => btn.classList.add('d-none'));

            btnGuardar.classList.add('d-none');
            btnModificar.classList.remove('d-none');
        });
    }

    // 2. Gestión de Responsables
    if (btnAddResp) {
        btnAddResp.addEventListener('click', () => {
            const name = document.getElementById('newRespName').value;
            const role = document.getElementById('newRespRole').value;

            if (!name) return alert("Ingresa un nombre");

            const card = document.createElement('div');
            card.className = 'protocolOne-resp-card';
            card.innerHTML = `
                <div class="protocolOne-resp-icon"><i class="fas fa-user"></i></div>
                <div class="flex-grow-1">
                    <p class="protocolOne-resp-name">${name}</p>
                    <p class="protocolOne-resp-role">${role}</p>
                </div>
                <button class="btn-remove-resp"><i class="fas fa-times"></i></button>
            `;
            
            listResponsables.appendChild(card);
            document.getElementById('newRespName').value = '';
        });
    }

    // Eliminar responsable (delegación de eventos)
    listResponsables.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-resp')) {
            e.target.closest('.protocolOne-resp-card').remove();
        }
    });

    // 2. Lógica para agregar "Otros Materiales"
    if (btnAddOther) {
        btnAddOther.addEventListener('click', () => {
            const newRow = document.createElement('div');
            newRow.className = 'protocolOne-table-row other-item';
            newRow.innerHTML = `
                <input type="text" class="mat-input-name-other" placeholder="Nombre del material..." value="">
                <input type="number" class="mat-input-unit" value="1">
                <button class="btn-remove-other"><i class="fas fa-minus-circle"></i></button>
            `;
            othersContainer.appendChild(newRow);
        });
    }

    // 3. Eliminar fila de otros
    othersContainer.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-other')) {
            e.target.closest('.other-item').remove();
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const zoneSelect = document.querySelector('.family-header-sub select');
    const tableContainer = document.querySelector('.main-content .container-fluid');
    const addFamilyForm = document.getElementById('add-family-form');
    const imageInput = document.getElementById('family-image-input');
    const uploadTrigger = document.getElementById('family-upload-trigger');
    const uploadText = document.getElementById('upload-text');

    // Base de datos simulada extendida
    const bmwpData = {
        "Sierra Gorda": {
            "Ceptarogeneidae": 10,
            "Hepterogenidae": 8,
            "Liniodae": 7
        },
        "Tehuacán": {
            "Ceptarogeneidae": 5,
            "Hepterogenidae": 5,
            "Liniodae": 5
        }
    };

    // --- 1. Lógica del Explorador de Archivos ---
    uploadTrigger.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', () => {
        if (imageInput.files && imageInput.files[0]) {
            uploadText.textContent = `Imagen: ${imageInput.files[0].name}`;
            uploadTrigger.style.borderColor = "#2196F3";
        }
    });

    // --- 2. Lógica para Añadir Familia ---
    addFamilyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Obtener valores
        const name = document.getElementById('new-family-name').value.trim();
        const order = document.getElementById('new-family-order').value.trim();
        const size = document.getElementById('new-family-size').value.trim();
        const zoneInputs = document.querySelectorAll('.zone-value-input');

        // Validar imagen
        if (imageInput.files.length === 0) {
            alert("Por favor, selecciona una imagen para la familia.");
            return;
        }

        // 3. Actualizar objeto de datos BMWP
        zoneInputs.forEach(input => {
            const zoneName = input.getAttribute('data-zone');
            const val = parseInt(input.value);
            if (!bmwpData[zoneName]) bmwpData[zoneName] = {};
            bmwpData[zoneName][name] = val;
        });

        // 4. Crear nueva fila en la tabla[cite: 15, 16]
        const newRow = document.createElement('div');
        newRow.className = 'family-table-row';
        newRow.innerHTML = `
            <div class="family-col-name">${name}</div>
            <div class="family-col-orden">${order}</div>
            <div class="family-col-tamano">${size}</div>
            <div class="family-col-val2"></div>
        `;

        tableContainer.appendChild(newRow);

        // Limpiar y cerrar modal
        addFamilyForm.reset();
        uploadText.textContent = "Agregar Imagen";
        bootstrap.Modal.getInstance(document.getElementById('addFamilyModal')).hide();
        
        // Refrescar valores BMWP según la zona actual seleccionada
        updateTableValues();
    });

    // --- 3. Función de actualización de BMWP (ajustada para nuevas filas) ---
    const updateTableValues = () => {
        const selectedZone = zoneSelect.value;
        const rows = document.querySelectorAll('.family-table-row');

        rows.forEach(row => {
            const familyName = row.querySelector('.family-col-name').textContent.trim();
            const valueCell = row.querySelector('.family-col-val2');

            if (selectedZone === "Seleccionar zona..." || !selectedZone) {
                valueCell.textContent = "";
            } else if (bmwpData[selectedZone] && bmwpData[selectedZone][familyName] !== undefined) {
                valueCell.textContent = bmwpData[selectedZone][familyName];
            } else {
                valueCell.textContent = "-";
            }
        });
    };

    zoneSelect.addEventListener('change', updateTableValues);
    updateTableValues();
});
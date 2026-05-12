document.addEventListener('DOMContentLoaded', () => {
    // 1. Selección de elementos del DOM basándose en las clases del HTML
    const inputsGenerales = document.querySelectorAll('.addZones-input');
    const descripcionTextarea = document.querySelector('.addZones-textarea');
    
    // Asignación específica por orden de aparición en el HTML original
    const inputNombreZona = inputsGenerales[0];
    const inputCoordenadas = inputsGenerales[1];
    const inputUbicacion = inputsGenerales[2];
    const inputBMWP = inputsGenerales[3]; // El campo de valor BMWP/MEX
    
    const selectFamilia = document.querySelector('.addZones-reg-list select');
    const btnRegistrarFamilia = document.querySelector('.addZones-btn-register');
    const panelFamilias = document.querySelector('.addZones-right-panel');
    const btnGuardarZona = document.querySelector('.zone-btn-save');

    // Contenedor donde se insertarán las familias (después del título del panel)
    const containerFamilias = panelFamilias;

    // 2. Limpieza inicial del panel derecho (opcional, para empezar desde cero)
    // Si deseas que las familias estáticas del HTML desaparezcan al iniciar:
    document.querySelectorAll('.addZones-product-card').forEach(card => card.remove());

    /**
     * Función para agregar una familia al panel derecho
     */
    btnRegistrarFamilia.addEventListener('click', (e) => {
        e.preventDefault();

        const nombreFamilia = selectFamilia.value;
        const valorBMWP = inputBMWP.value.trim();

        // Validación: No permitir si el valor BMWP está vacío
        if (valorBMWP === "") {
            alert("Por favor, asigne un valor BMWP/MEX a la familia antes de agregarla.");
            return;
        }

        // Crear la estructura del card respetando las clases originales
        const nuevaFamiliaCard = document.createElement('div');
        nuevaFamiliaCard.className = 'addZones-product-card';
        
        // Usamos una imagen genérica o podrías mapearla según la familia
        nuevaFamiliaCard.innerHTML = `
            <i class="far fa-times-circle addZones-card-close"></i>
            <div class="addZones-card-img-box">
                <img src="img/bicho1.jpg" alt="${nombreFamilia}" class="addZones-card-img">
            </div>
            <div class="addZones-card-content">
                <h6 class="addZones-card-title">${nombreFamilia}</h6>
                <p class="addZones-card-subtitle">Valor BMWP: ${valorBMWP}</p>
            </div>
        `;

        // Añadir funcionalidad para eliminar la card
        const btnCerrar = nuevaFamiliaCard.querySelector('.addZones-card-close');
        btnCerrar.addEventListener('click', () => {
            nuevaFamiliaCard.remove();
        });

        // Insertar en el panel antes de las acciones de guardado
        const accionesGuardado = document.querySelector('.zone-save-actions');
        containerFamilias.insertBefore(nuevaFamiliaCard, accionesGuardado);

        // Limpiar campo de valor después de agregar
        inputBMWP.value = "";
    });

    /**
     * Validación para "Guardar Zona"
     */
    btnGuardarZona.addEventListener('click', (e) => {
        const nombreVal = inputNombreZona.value.trim();
        const coordVal = inputCoordenadas.value.trim();
        const ubiVal = inputUbicacion.value.trim();
        const descVal = descripcionTextarea.value.trim();
        
        // Contar cuántas familias hay agregadas actualmente
        const numFamilias = document.querySelectorAll('.addZones-product-card').length;

        // Verificar si faltan campos o familias
        let errores = [];
        if (!nombreVal || !coordVal || !ubiVal || !descVal) {
            errores.push("Debe llenar todos los campos de Datos Generales (Nombre, Coordenadas, Ubicación y Descripción).");
        }
        if (numFamilias === 0) {
            errores.push("Debe agregar al menos una familia a la zona.");
        }

        if (errores.length > 0) {
            e.preventDefault(); // Detiene la navegación a zonas.html
            alert(errores.join("\n"));
        } else {
            alert("¡Zona guardada con éxito!");
            // Aquí se permitiría la redirección natural del enlace <a>
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionamos el campo de entrada de búsqueda y todas las filas de datos de la tabla
    const searchInput = document.querySelector('.table-info-search-input');
    const projectRows = document.querySelectorAll('.table-info-data-row');

    // 2. Escuchamos el evento 'input' para filtrar mientras el usuario escribe
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        projectRows.forEach(row => {
            // Obtenemos el texto de las columnas relevantes: Nombre, Responsable, Zona y Ubicación[cite: 10, 11]
            const projectName = row.querySelector('.table-info-col-name').textContent.toLowerCase();
            const responsible = row.querySelector('.table-info-col-resp').textContent.toLowerCase();
            const zone = row.querySelector('.table-info-col-zona').textContent.toLowerCase();
            const location = row.querySelector('.table-info-col-ubic').textContent.toLowerCase();

            // 3. Verificamos si el término de búsqueda coincide con alguno de los campos
            if (
                projectName.includes(searchTerm) ||
                responsible.includes(searchTerm) ||
                zone.includes(searchTerm) ||
                location.includes(searchTerm)
            ) {
                // Mostramos la fila si hay coincidencia (usamos 'flex' porque es el estilo original en CSS)
                row.style.display = 'flex';
            } else {
                // Ocultamos la fila si no coincide
                row.style.display = 'none';
            }
        });
    });
});
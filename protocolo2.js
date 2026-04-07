 document.addEventListener('DOMContentLoaded', () => {
            
            // Lógica de Tabs (Pestañas)
            const chips = document.querySelectorAll('.protocol-chip');
            const sections = document.querySelectorAll('.protocol-section');

            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    // Limpiar clases activas
                    chips.forEach(c => c.classList.remove('active'));
                    sections.forEach(sec => sec.classList.remove('active-section'));
                    
                    // Activar el chip correspondiente y su sección
                    chip.classList.add('active');
                    const targetId = chip.getAttribute('data-target');
                    const targetSection = document.getElementById(targetId);
                    if(targetSection) {
                        targetSection.classList.add('active-section');
                    }
                });
            });

            // Lógica Edición Global
            const btnModificar = document.getElementById('btnModificar');
            const btnGuardar = document.getElementById('btnGuardarGlobal');
            const inputs = document.querySelectorAll('.protocol-section input');

            if(btnModificar && btnGuardar) {
                btnModificar.addEventListener('click', () => {
                    inputs.forEach(input => input.disabled = false);
                    btnModificar.classList.add('d-none');
                    btnGuardar.classList.remove('d-none');
                });

                btnGuardar.addEventListener('click', () => {
                    inputs.forEach(input => input.disabled = true);
                    btnGuardar.classList.add('d-none');
                    btnModificar.classList.remove('d-none');
                });
            }
        });
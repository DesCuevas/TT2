document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos todos los botones que tienen la clase 'btn-toggle-edit'
    const botonesEdicion = document.querySelectorAll('.btn-toggle-edit');

    botonesEdicion.forEach(boton => {
        boton.addEventListener('click', function (e) {
            e.preventDefault(); // Evita que la página se recargue si está dentro de un form

            // Encontramos el contenedor padre específico de este botón (.createProject-accordion-body)
            const contenedor = this.closest('.createProject-accordion-body');

            // Buscamos solo los inputs y selects dentro de ese contenedor
            const campos = contenedor.querySelectorAll('input, select');

            // Verificamos si los campos están deshabilitados usando el primero como referencia
            const isEditing = !campos[0].disabled;

            if (isEditing) {
                // MODO GUARDAR -> Pasa a Modo Lectura (Bloqueado)
                campos.forEach(campo => campo.disabled = true);
                this.innerHTML = '<i class="fas fa-edit me-2"></i> Modificar Datos';
                this.classList.replace('btn-success', 'btn-modificar');
            } else {
                // MODO LECTURA -> Pasa a Modo Edición (Habilitado)
                campos.forEach(campo => campo.disabled = false);
                this.innerHTML = '<i class="fas fa-save me-2"></i> Guardar Datos';
                this.classList.replace('btn-modificar', 'btn-success');
            }
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
//Aqui se tienen que cargar dinamicamente y se actualiza el modal según si existe o no el protocolo.
    const protocolos = {
        1: "protocolo1.html", // existe pero especial, cambiar a "protocolo1.html" para ver cambio de modal a página
        2: "protocolo2.html",
        3: "protocolo3.html",
        4: "protocolo4.html",
        5: "protocolo5.html"
    };

    const modalGeneral = new bootstrap.Modal(document.getElementById('protocolModal'));
    const modalP1 = new bootstrap.Modal(document.getElementById('protocolModal1'));

    document.querySelectorAll(".visualizer-protocol-card").forEach(card => {

        card.addEventListener("click", function () {

            const id = this.getAttribute("data-protocol");
            const link = protocolos[id];

            if (id == 1) {
                // 🔥 CASO ESPECIAL
                if (link) {
                    window.location.href = link;
                }

                else {
                    modalP1.show();
                }

            } else if (link) {
                // ✅ Existe
                window.location.href = link;

            } else {
                // ❌ No existe
                modalGeneral.show();
            }

        });

    });

});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionamos el panel que contiene a todos los colaboradores
    const collabPanel = document.querySelector('.visualizer-collab-panel');

    if (collabPanel) {
        collabPanel.addEventListener('click', function (e) {
            // 2. Verificamos si el clic fue en el icono de eliminar (el tache)
            // Buscamos la clase 'createProject-collab-remove' que definiste en el HTML
            if (e.target.classList.contains('createProject-collab-remove')) {
                
                // 3. Confirmación de seguridad (Opcional pero recomendado para el admin)
                const confirmacion = confirm("¿Estás seguro de que deseas eliminar a este colaborador?");
                
                if (confirmacion) {
                    // 4. Encontramos el contenedor padre del colaborador para eliminarlo
                    const collabItem = e.target.closest('.visualizer-collab-item');
                    
                    if (collabItem) {
                        // Animación opcional de desvanecimiento antes de remover
                        collabItem.style.transition = 'opacity 0.3s ease';
                        collabItem.style.opacity = '0';
                        
                        setTimeout(() => {
                            collabItem.remove();
                            // Aquí podrías añadir una llamada al backend en el futuro
                            console.log("Colaborador eliminado por el administrador.");
                        }, 300);
                    }
                }
            }
        });
    }
});

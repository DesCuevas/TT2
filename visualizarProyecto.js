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

    const protocolos = {
        1: null, // existe pero especial
        2: "protocolo2.html",
        3: "protocolo3.html",
        4: null,
        5: null
    };

    const modalGeneral = new bootstrap.Modal(document.getElementById('protocolModal'));
    const modalP1 = new bootstrap.Modal(document.getElementById('protocolModal1'));

    document.querySelectorAll(".visualizer-protocol-card").forEach(card => {

        card.addEventListener("click", function () {

            const id = this.getAttribute("data-protocol");
            const link = protocolos[id];

            if (id == 1) {
                // 🔥 CASO ESPECIAL
                modalP1.show();

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


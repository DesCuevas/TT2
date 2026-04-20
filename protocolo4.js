document.addEventListener('DOMContentLoaded', () => {
    const btnModificar = document.getElementById('btnModificar');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnAddOther = document.getElementById('btnAddOther');
    const container = document.getElementById('othersListContainer');

    // 1. Lógica de Edición
    if (btnModificar) {
        btnModificar.addEventListener('click', () => {
            document.querySelectorAll('#protocolFourAccordion input, #protocolFourAccordion textarea').forEach(el => el.disabled = false);
            document.querySelectorAll('.metric-slider, .btn-remove-item').forEach(el => el.classList.remove('d-none'));
            if (btnAddOther) btnAddOther.classList.remove('d-none');

            btnModificar.classList.add('d-none');
            btnGuardar.classList.remove('d-none');
        });

        btnGuardar.addEventListener('click', () => {
            document.querySelectorAll('#protocolFourAccordion input, #protocolFourAccordion textarea').forEach(el => el.disabled = true);
            document.querySelectorAll('.metric-slider, .btn-remove-item').forEach(el => el.classList.add('d-none'));
            if (btnAddOther) btnAddOther.classList.add('d-none');

            btnGuardar.classList.add('d-none');
            btnModificar.classList.remove('d-none');
        });
    }

    // 2. Actualizar barras de Porcentaje (Hábitat)
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('habitat-pct')) {
            const val = Math.min(100, Math.max(0, e.target.value));
            e.target.value = val;
            const bar = e.target.closest('.habitat-item').querySelector('.progress-fill');
            bar.style.width = val + '%';
        }
    });

    // 3. Actualizar barras de Métrica (Fauna)
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('metric-slider')) {
            const val = e.target.value;
            const bar = e.target.closest('.metric-bar-deep');
            const num = e.target.closest('.fauna-metric-item').querySelector('.metric-num');
            bar.setAttribute('data-value', val);
            num.innerText = val;
        }
    });

    // 4. Agregar Otros
    if (btnAddOther) {
        btnAddOther.addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'habitat-item mb-2 other-row';
            row.innerHTML = `
                <div class="d-flex align-items-center gap-2">
                    <input type="text" class="form-control form-control-sm other-name" placeholder="Nombre...">
                    <input type="number" class="form-control habitat-pct" value="0">
                    <div class="progress-container-deep"><div class="progress-fill bg-success" style="width: 0%"></div></div>
                    <button class="btn-remove-item"><i class="fas fa-minus-circle"></i></button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    container.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-item')) e.target.closest('.other-row').remove();
    });
});
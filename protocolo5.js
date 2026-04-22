const catalogo = [
    { id: 1, nombre: "Perlidae", bmwp: 10, imagen: "img/bicho1.jpg" },
    { id: 2, nombre: "Oligoneuriidae", bmwp: 10, imagen: "img/bicho1.jpg" },
    { id: 3, nombre: "Calopterygidae", bmwp: 8, imagen: "img/bicho2.jpg" },
    { id: 4, nombre: "Baetidae", bmwp: 4, imagen: "img/bicho2.jpg" },
    { id: 5, nombre: "Chironomidae", bmwp: 2, imagen: "img/bicho1.jpg" },
    { id: 6, nombre: "FamiliaP", bmwp: 50, imagen: "img/bicho2.jpg" }
];

let addedFamilies = [
    { id: 1, nombre: "Perlidae", bmwp: 10, qty: 5, imagen: "img/bicho1.jpg" },
    { id: 4, nombre: "Baetidae", bmwp: 4, qty: 12, imagen: "img/bicho2.jpg" }
];

let isEditing = false; // Estado de edición

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupAdminControls();
});

function setupAdminControls() {
    const btnModificar = document.getElementById('btnModificar');
    const btnGuardar = document.getElementById('btnGuardar');
    const searchSection = document.getElementById('adminSearchSection');
    const searchInput = document.getElementById('familySearch');

    if (btnModificar && btnGuardar) {
        btnModificar.addEventListener('click', () => {
            isEditing = true;
            btnModificar.classList.add('d-none');
            btnGuardar.classList.remove('d-none');
            searchSection.classList.add('opacity-100');
            searchInput.placeholder = "Buscar familia...";
            updateUI();
            renderCatalog();
        });

        btnGuardar.addEventListener('click', () => {
            isEditing = false;
            btnGuardar.classList.add('d-none');
            btnModificar.classList.remove('d-none');
            searchSection.classList.remove('opacity-100');
            searchInput.placeholder = "Primero haz clic en Modificar datos...";
            updateUI();
            renderCatalog();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderCatalog(e.target.value.toLowerCase()));
    }
}

function renderCatalog(filter = "") {
    const list = document.getElementById('catalogList');
    if (!list) return;
    list.innerHTML = "";
    
    // Solo mostramos items si estamos editando
    if (!isEditing) {
        list.innerHTML = "<p class='text-muted small text-center mt-2'>Habilita la edición para agregar familias.</p>";
        return;
    }

    catalogo.filter(f => f.nombre.toLowerCase().includes(filter)).forEach(f => {
        const item = document.createElement('div');
        item.className = "d-flex justify-content-between align-items-center p-2 border-bottom";
        item.innerHTML = `
            <span class="small fw-bold">${f.nombre} (${f.bmwp} pts)</span>
            <button class="btn btn-sm btn-primary py-0" onclick="addFamily(${f.id})">+</button>
        `;
        list.appendChild(item);
    });
}

function updateUI() {
    const container = document.getElementById('analysisContainer');
    container.innerHTML = "";
    let totalBMWP = 0;

    addedFamilies.forEach(f => {
        totalBMWP += f.bmwp;
        const card = document.createElement('div');
        card.className = "protocolFive-family-card";
        
        // Lógica de controles dinámicos
        let controls = "";
        if (typeof role !== 'undefined' && role === 'admin') {
            if (isEditing) {
                controls = `
                <div class="d-flex align-items-center gap-2">
                    <input type="number" value="${f.qty}" class="qty-input-edit" onchange="updateQty(${f.id}, this.value)">
                    <i class="fas fa-trash text-danger" style="cursor:pointer" onclick="removeFamily(${f.id})"></i>
                </div>`;
            } else {
                controls = `<span class="small text-muted fw-bold"> ${f.qty}</span>`;
            }
        } else {
            controls = `<span class="small text-muted"> ${f.qty}</span>`;
        }

        /* Cambiar aqui para que aparezcan las imágenes en lugar del icono (fa-layer-group)*/
        card.innerHTML = `
            <div class="protocolFive-card-left">
                <div class="protocolFive-icon-wrapper">
                    <img src="${f.imagen}" alt="${f.nombre}" class="img-family-protocol">
                </div>
                <div>
                    <p class="protocolFive-family-name">${f.nombre}</p>
                    <p class="protocolFive-family-sub">Valor BMWP: ${f.bmwp}</p>
                </div>
            </div>
            <div class="protocolFive-card-right">
                <span class="protocolFive-value-big">${f.bmwp}</span>
                <span class="protocolFive-value-label">Cantidad encontrada:</span>
                ${controls}
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('totalBmwpLabel').innerText = `BMWP/MX: ${totalBMWP}`;
    document.getElementById('totalQualityBox').innerText = `Total de índice BMWP/Mex: ${totalBMWP}`;
    updateQualityResults(totalBMWP);
}

// Funciones de datos se mantienen iguales...
function addFamily(id) {
    if (addedFamilies.find(f => f.id === id)) return;
    const f = catalogo.find(fam => fam.id === id);
    addedFamilies.push({ ...f, qty: 1 });
    updateUI();
}

function removeFamily(id) {
    addedFamilies = addedFamilies.filter(f => f.id !== id);
    updateUI();
}

function updateQty(id, val) {
    const f = addedFamilies.find(fam => fam.id === id);
    if (f) f.qty = parseInt(val) || 0;
}

// Función de tabla de calidad se mantiene igual...
function updateQualityResults(score) {
    const resClass = document.getElementById('resClass');
    const resRange = document.getElementById('resRange');
    const resQuality = document.getElementById('resQuality');
    const resDot = document.getElementById('resDot');

    let data = { class: "Extremadamente contaminada", range: "< 19", desc: "Aguas extremadamente contaminadas", color: "#b00000" };

    if (score > 150) data = { class: "Excelente", range: "> 150", desc: "Aguas de calidad excelente", color: "#002b4f" };
    else if (score >= 78) data = { class: "Buena", range: "78-149", desc: "Aguas de calidad buena", color: "#5d98ff" };
    else if (score >= 59) data = { class: "Regular", range: "59 - 77", desc: "Aguas de calidad regular", color: "#44bf58" };
    else if (score >= 39) data = { class: "Contaminada", range: "39 - 58", desc: "Aguas contaminadas", color: "#f6f93d" };
    else if (score >= 20) data = { class: "Muy contaminada", range: "20 - 38", desc: "Aguas muy contaminadas", color: "#ed7f2b" };

    resClass.innerText = data.class;
    resRange.innerText = data.range;
    resQuality.innerText = data.desc;
    resDot.style.backgroundColor = data.color;
    resDot.style.boxShadow = `0 0 10px ${data.color}`;
}
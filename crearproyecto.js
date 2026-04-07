document.getElementById("btnGuardarDatos1").addEventListener("click", function () {
    
    // Cerrar el primero
    let collapseDatos = new bootstrap.Collapse(document.getElementById('collapseDatos'), {
        toggle: false
    });
    collapseDatos.hide();

    // Abrir el segundo
    let collapseAgua = new bootstrap.Collapse(document.getElementById('collapseAgua'), {
        toggle: false
    });
    collapseAgua.show();
});

document.getElementById("btnGuardarDatos2").addEventListener("click", function () {
    
    // Cerrar el primero
    let collapseAgua = new bootstrap.Collapse(document.getElementById('collapseAgua'), {
        toggle: false
    });
    collapseAgua.hide();

    // Abrir el segundo
    let collapseID = new bootstrap.Collapse(document.getElementById('collapseID'), {
        toggle: false
    });
    collapseID.show();
});

document.getElementById("btnGuardarDatos3").addEventListener("click", function () {
    
    // Cerrar el primero
    let collapseID = new bootstrap.Collapse(document.getElementById('collapseID'), {
        toggle: false
    });
    collapseID.hide();
});
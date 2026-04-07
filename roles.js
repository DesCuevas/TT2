// Simulación (cámbialo luego por backend)
const role = "admin"; 
// prueba con "colaborador"

// Filtrar elementos por rol
document.querySelectorAll("[data-role]").forEach(el => {
  const roles = el.getAttribute("data-role").split(" ");

  if (!roles.includes(role)) {
    el.remove(); // elimina lo que no corresponde
  }
});
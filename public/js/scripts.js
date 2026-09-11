// Mostrar el botón cuando el usuario hace scroll hacia abajo
window.onscroll = function() {
    let btn = document.getElementById("btnTop");
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
};

// Función para volver al tope
document.getElementById("btnTop").onclick = function() {
    window.scrollTo({top: 0, behavior: 'smooth'});
};



// JavaScript para resaltar el enlace activo 

 // Obtener la URL actual
const currentURL = window.location.pathname;

 // Función para activar el enlace correspondiente
function activateNavLink(linkId) {
    document.getElementById(linkId).classList.add('active-link');
}

 // Activar el enlace basado en la URL actual
if (currentURL.includes("nosotros")) activateNavLink("nosotros-link");
else if (currentURL.includes("servicios")) activateNavLink("servicios-link");
else if (currentURL.includes("portafolio")) activateNavLink("portafolio-link");
else if (currentURL.includes("cliente")) activateNavLink("cliente-link");
else if (currentURL.includes("contacto")) activateNavLink("contacto-link");
else activateNavLink("inicio-link");

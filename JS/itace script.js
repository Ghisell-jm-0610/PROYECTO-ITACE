const carruselInstalaciones = document.querySelector(".carrusel-instalaciones");

if (carruselInstalaciones) {
    const diapositivas = carruselInstalaciones.querySelectorAll(".diapositiva-instalaciones");
    const botonAnterior = document.getElementById("anterior-instalaciones");
    const botonSiguiente = document.getElementById("siguiente-instalaciones");
    const indicador = document.getElementById("indicador-instalaciones");

    let diapositivaActual = 0;

    function mostrarDiapositiva(indice) {
        diapositivas.forEach((diapositiva, i) => {
            diapositiva.classList.toggle("activa", i === indice);
        });

        if (indicador) {
            indicador.textContent = `${diapositivaActual + 1} / ${diapositivas.length}`;
        }
    }

    if (botonAnterior) {
        botonAnterior.addEventListener("click", function () {
            diapositivaActual--;

            if (diapositivaActual < 0) {
                diapositivaActual = diapositivas.length - 1;
            }

            mostrarDiapositiva(diapositivaActual);
        });
    }

    if (botonSiguiente) {
        botonSiguiente.addEventListener("click", function () {
            diapositivaActual++;

            if (diapositivaActual >= diapositivas.length) {
                diapositivaActual = 0;
            }

            mostrarDiapositiva(diapositivaActual);
        });
    }

    mostrarDiapositiva(diapositivaActual);
}

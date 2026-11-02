// ANIMACION | CONTADOR INSTITUCIONAL

const contadores = document.querySelectorAll(".numero-contador");
const seccionContador = document.querySelector(".contador-institucional");

const observador = new IntersectionObserver((entradas, observer) => {

    entradas.forEach(entrada => {

        if (entrada.isIntersecting) {

            contadores.forEach(contador => {

                const objetivo = Number(contador.dataset.target);
                const duracion = 2000;
                const inicio = performance.now();

                function actualizarNumero(tiempoActual) {

                    const progreso = Math.min(
                        (tiempoActual - inicio) / duracion,
                        1
                    );

                    const numeroActual = Math.floor(objetivo * progreso);

                    contador.textContent = numeroActual.toLocaleString("es-MX");

                    if (progreso < 1) {
                        requestAnimationFrame(actualizarNumero);
                    } else {
                        contador.textContent = objetivo.toLocaleString("es-MX");
                    }
                }

                requestAnimationFrame(actualizarNumero);

            });

            observer.unobserve(entrada.target);
        }

    });

}, {
    threshold: 0.4
});

if (seccionContador) {
    observador.observe(seccionContador);
}

// VIDEOS AL PASAR EL CURSOR O TOCAR LAS ESPECIALIDADES

const tarjetasEspecialidad = document.querySelectorAll(".especialidad");
const pantallaTactil = window.matchMedia("(hover: none)").matches;

let videoActivo = null;

function detenerVideo(tarjeta) {
    const video = tarjeta.querySelector(".imagen-especialidad video");

    if (video) {
        video.pause();
        video.currentTime = 0;
    }

    tarjeta.classList.remove("reproduciendo");

    if (videoActivo === tarjeta) {
        videoActivo = null;
    }
}

function reproducirVideo(tarjeta) {
    const video = tarjeta.querySelector(".imagen-especialidad video");

    if (!video) return;

    if (videoActivo && videoActivo !== tarjeta) {
        detenerVideo(videoActivo);
    }

    tarjeta.classList.add("reproduciendo");
    videoActivo = tarjeta;

    video.play().catch(() => {
        tarjeta.classList.remove("reproduciendo");
        videoActivo = null;
    });
}

tarjetasEspecialidad.forEach(tarjeta => {
    if (pantallaTactil) {

        tarjeta.addEventListener("click", () => {
            if (tarjeta.classList.contains("reproduciendo")) {
                detenerVideo(tarjeta);
            } else {
                reproducirVideo(tarjeta);
            }
        });

    } else {

        tarjeta.addEventListener("mouseenter", () => {
            reproducirVideo(tarjeta);
        });

        tarjeta.addEventListener("mouseleave", () => {
            detenerVideo(tarjeta);
        });

    }
});
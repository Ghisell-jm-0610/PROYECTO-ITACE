document.addEventListener("DOMContentLoaded", () => {

    const buscarNombre = document.getElementById("buscarNombre");
    const buscarMateria = document.getElementById("buscarMateria");
    const filtroArea = document.getElementById("filtroArea");
    const limpiarFiltros = document.getElementById("limpiarFiltros");

    const tarjetasDocentes = document.getElementById("tarjetasDocentes");
    const sinResultados = document.getElementById("sinResultados");
    const errorDirectorio = document.getElementById("errorDirectorio");

    let docentes = [];

    if (
        !buscarNombre ||
        !buscarMateria ||
        !filtroArea ||
        !limpiarFiltros ||
        !tarjetasDocentes ||
        !sinResultados ||
        !errorDirectorio
    ) {
        console.error("Faltan elementos del HTML del directorio.");
        return;
    }

    function normalizar(texto) {
        return String(texto ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    // Crear avatar genérico cuando no hay fotografía
    function crearAvatar(clase) {
        const avatar = document.createElement("div");
        avatar.className = clase;
        avatar.setAttribute("role", "img");
        avatar.setAttribute("aria-label", "Sin fotografía");

        avatar.innerHTML = `
            <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="35" r="19" fill="currentColor"/>
                <path d="M15 91 C17 67 31 56 50 56 C69 56 83 67 85 91 Z"
                    fill="currentColor"/>
            </svg>
        `;

        return avatar;
    }

    // Crear fotografía o avatar
    function crearFoto(docente, clase) {
        if (!docente.foto) {
            return crearAvatar(clase + " avatar-docente");
        }

        const foto = document.createElement("img");
        foto.className = clase;
        foto.src = docente.foto;
        foto.alt = "Fotografía de " + docente.nombre;

        foto.addEventListener("error", () => {
            foto.replaceWith(crearAvatar(clase + " avatar-docente"));
        }, { once: true });

        return foto;
    }

    // Cargar docentes
    async function cargarDocentes() {
        try {
            console.log("Iniciando carga de docentes...");

            const respuesta = await fetch("../datos/docentes.json");

            if (!respuesta.ok) {
                throw new Error("No se pudo cargar el JSON. Código: " + respuesta.status);
            }

            const datos = await respuesta.json();

            if (!Array.isArray(datos)) {
                throw new Error("El JSON no contiene una lista válida.");
            }

            docentes = datos;

            console.log("Docentes cargados correctamente:", docentes.length);

            mostrarDocentes(docentes);

        } catch (error) {
            console.error("ERROR DEL DIRECTORIO:", error);

            tarjetasDocentes.innerHTML = "";
            sinResultados.hidden = true;
            errorDirectorio.hidden = false;
            errorDirectorio.textContent =
                "Error al cargar docentes: " + error.message;
        }
    }

    // Aplicar filtros
    function filtrarDocentes() {
        const nombre = normalizar(buscarNombre.value);
        const materia = normalizar(buscarMateria.value);
        const area = normalizar(filtroArea.value);

        const resultados = docentes.filter(docente => {

            const coincideNombre = !nombre ||
                normalizar(docente.nombre).includes(nombre);

            const materias = normalizar(
                (docente.materias || []).join(" ")
            );

            const formacion = normalizar(docente.formacion);
            const perfil = normalizar(docente.perfil);

            const coincideMateria = !materia ||
                materias.includes(materia) ||
                formacion.includes(materia) ||
                perfil.includes(materia);

            const areas = Array.isArray(docente.area)
                ? docente.area
                : [docente.area];

            const coincideArea = !area ||
                areas.some(a => normalizar(a) === area);

            return coincideNombre && coincideMateria && coincideArea;
        });

        mostrarDocentes(resultados);
    }

    // Mostrar tarjetas
    function mostrarDocentes(lista) {
        tarjetasDocentes.innerHTML = "";
        errorDirectorio.hidden = true;
        sinResultados.hidden = lista.length !== 0;

        lista.forEach(docente => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-docente";

            const foto = crearFoto(docente, "foto-docente");

            const informacion = document.createElement("div");
            informacion.className = "datos-docente";

            const nombre = document.createElement("h3");
            nombre.textContent = docente.nombre || "Nombre no disponible";

            const botonPerfil = document.createElement("button");
            botonPerfil.type = "button";
            botonPerfil.className = "btn-perfil";
            botonPerfil.textContent = "Ver perfil";

            botonPerfil.addEventListener("click", () => {
                mostrarPerfil(docente);
            });

            informacion.append(nombre, botonPerfil);
            tarjeta.append(foto, informacion);
            tarjetasDocentes.appendChild(tarjeta);
        });
    }

    // Mostrar perfil completo
    function mostrarPerfil(docente) {
        cerrarPerfil();

        const perfil = document.createElement("div");
        perfil.id = "perfilDocente";
        perfil.className = "perfil-docente";
        perfil.setAttribute("role", "dialog");
        perfil.setAttribute("aria-modal", "true");
        perfil.setAttribute("aria-label", "Perfil de " + docente.nombre);

        const contenido = document.createElement("div");
        contenido.className = "contenido-perfil";

        const cerrar = document.createElement("button");
        cerrar.type = "button";
        cerrar.className = "cerrar-perfil";
        cerrar.textContent = "×";
        cerrar.setAttribute("aria-label", "Cerrar perfil");
        cerrar.addEventListener("click", cerrarPerfil);

        const foto = crearFoto(docente, "foto-perfil");

        const nombre = document.createElement("h2");
        nombre.textContent = docente.nombre || "Nombre no disponible";

        const datos = [
            ["Formación académica", docente.formacion],
            ["Área", Array.isArray(docente.area) ? docente.area.join(", ") : docente.area],
            ["Salón", docente.salon],
            [
                "Antigüedad en ITACE",
                docente.antiguedad != null
                    ? docente.antiguedad + " años"
                    : "Por confirmar"
            ],
            [
                "Materias o actividades",
                docente.materias?.length
                    ? docente.materias.join(", ")
                    : "Por confirmar"
            ],
            [
                "Semestres",
                docente.semestres?.length
                    ? docente.semestres.join(", ")
                    : "Por confirmar"
            ],
            ["Perfil profesional", docente.perfil]
        ];

        contenido.append(cerrar, foto, nombre);

        datos.forEach(([etiqueta, valor]) => {
            const parrafo = document.createElement("p");
            const titulo = document.createElement("strong");

            titulo.textContent = etiqueta + ": ";

            parrafo.append(
                titulo,
                document.createTextNode(valor || "Por confirmar")
            );

            contenido.appendChild(parrafo);
        });

        perfil.appendChild(contenido);

        perfil.addEventListener("click", evento => {
            if (evento.target === perfil) {
                cerrarPerfil();
            }
        });

        document.body.appendChild(perfil);
        document.addEventListener("keydown", cerrarConEscape);

        cerrar.focus();
    }

    // Cerrar perfil
    function cerrarPerfil() {
        const perfil = document.getElementById("perfilDocente");

        if (perfil) {
            perfil.remove();
        }

        document.removeEventListener("keydown", cerrarConEscape);
    }

    function cerrarConEscape(evento) {
        if (evento.key === "Escape") {
            cerrarPerfil();
        }
    }

    // Eventos de búsqueda
    buscarNombre.addEventListener("input", filtrarDocentes);
    buscarMateria.addEventListener("input", filtrarDocentes);
    filtroArea.addEventListener("change", filtrarDocentes);

    // Limpiar filtros
    limpiarFiltros.addEventListener("click", () => {
        buscarNombre.value = "";
        buscarMateria.value = "";
        filtroArea.value = "";

        mostrarDocentes(docentes);
    });

    cargarDocentes();
});
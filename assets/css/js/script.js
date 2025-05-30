const formBuscar = document.getElementById("Buscador");
const contenedorPadre = document.querySelector("#container .row");
const urlDragonBall = "https://dragonball-api.com/api/characters";

let page = 1;
let loading = false;
let ultimaBusqueda = "";

// Función para cargar datos desde la API
const cargarDatos = async (url, page = 1) => {
  try {
    loading = true;
    const response = await fetch(`${url}?page=${page}`);
    if (!response.ok) {
      throw new Error("Error en la API");
    }
    const data = await response.json();
    loading = false;
    return data;
  } catch (error) {
    loading = false;
    console.log(error);
    return null;
  }
};

// Renderiza personajes (agrega si append=true, reemplaza si append=false)
const renderPersonajes = (personajes, append = false) => {
  if (!append) contenedorPadre.innerHTML = "";
  if (!personajes || personajes.length === 0) {
    if (!append) contenedorPadre.innerHTML = "<p class='text-danger'>No se encontraron personajes.</p>";
    return;
  }
  personajes.forEach((personaje) => {
    contenedorPadre.innerHTML += `
      <div class="col-3 pb-2 d-flex justify-content-center" data-id="${personaje.id}">
        <div class="card">
          <img class="card-img-top" src="${personaje.image}" alt="${personaje.name}" />
          <div class="card-body">
            <h5 class="card-title">${personaje.name}</h5>
            <p class="card-text">${personaje.race} - ${personaje.gender}</p>
            <button class="btn btn-success btn-ver-detalles">Ver más</button>
          </div>
        </div>
      </div>
    `;
  });
};

// Mostrar personajes al cargar la página
window.addEventListener("DOMContentLoaded", async () => {
  page = 1;
  const data = await cargarDatos(urlDragonBall, page);
  renderPersonajes(data && data.items ? data.items : []);
});

// Evento para buscar personajes (filtra por nombre)
formBuscar.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = formBuscar.querySelector("input[type='search']");
  const texto = input.value.trim().toLowerCase();
  ultimaBusqueda = texto;
  page = 1;

  const data = await cargarDatos(urlDragonBall, page);
  if (!data || !data.items) {
    contenedorPadre.innerHTML = "<p class='text-danger'>No se pudieron cargar los personajes.</p>";
    return;
  }

  const filtrados = data.items.filter((personaje) =>
    personaje.name.toLowerCase().includes(texto)
  );
  renderPersonajes(filtrados);
});

// Scroll infinito
window.addEventListener("scroll", async () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
    !loading
  ) {
    page++;
    const data = await cargarDatos(urlDragonBall, page);
    if (!data || !data.items) return;

    // Si hay búsqueda activa, filtra antes de agregar
    let personajes = data.items;
    if (ultimaBusqueda) {
      personajes = personajes.filter((personaje) =>
        personaje.name.toLowerCase().includes(ultimaBusqueda)
      );
    }
    renderPersonajes(personajes, true);
  }
});

// Delegación de eventos para el botón "Ver más"
contenedorPadre.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-ver-detalles")) {
    const cardPadre = e.target.closest(".col-3");
    const id = cardPadre.dataset.id;
    verDetalles(id);
  }
});

// Función para ver detalles de un personaje
const verDetalles = async (id) => {
  try {
    const response = await fetch(`${urlDragonBall}/${id}`);
    if (!response.ok) {
      throw new Error("Error en la API");
    }
    const data = await response.json();
    alert(data.description || "Sin descripción disponible");
  } catch (error) {
    console.log(error);
  }
};
// script.js

// URL de la API (ajusta según tu backend en Render)
const API_URL = "https://crud-mongo-rsxf.onrender.com/api/characters";

/**
 * Función para escapar caracteres especiales y evitar inyecciones HTML.
 * Convierte: &, <, >, " y ' en sus entidades HTML.
 */
function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>"']/g, function(match) {
    switch (match) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "\"": return "&quot;";
      case "'": return "&#39;";
      default: return match;
    }
  });
}

/**
 * Función para detectar si hay etiquetas HTML o scripts.
 * Devuelve true si se detecta alguna etiqueta HTML.
 */
function contieneEtiquetas(str) {
  if (typeof str !== "string") return false;
  return /<\/?[a-z][\s\S]*>/i.test(str);
}

document.addEventListener("DOMContentLoaded", () => {

  /*****************************************************
   * 1) PÁGINA: AGREGAR HÉROE (addPage)
   *****************************************************/
  if (document.body.classList.contains("addPage")) {
    const addHeroForm = document.getElementById("addHeroForm");
    if (addHeroForm) {
      addHeroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Verificar que cada campo exista antes de leer .value
        const heroNameInput = document.getElementById("heroName");
        if (!heroNameInput) {
          alert("No se encontró el campo 'Nombre' en el formulario.");
          return;
        }
        const name = heroNameInput.value;

        const ability1Input = document.getElementById("ability1");
        if (!ability1Input) {
          alert("No se encontró el campo 'Habilidad 1'.");
          return;
        }
        const ability2Input = document.getElementById("ability2");
        if (!ability2Input) {
          alert("No se encontró el campo 'Habilidad 2'.");
          return;
        }
        const ability3Input = document.getElementById("ability3");
        if (!ability3Input) {
          alert("No se encontró el campo 'Habilidad 3'.");
          return;
        }
        const ability4Input = document.getElementById("ability4");
        if (!ability4Input) {
          alert("No se encontró el campo 'Habilidad 4'.");
          return;
        }
        const abilities = [
          ability1Input.value,
          ability2Input.value,
          ability3Input.value,
          ability4Input.value,
        ];

        // Validaciones de nombre y habilidades...
        if (contieneEtiquetas(name)) {
          alert("El campo 'Nombre' no debe contener etiquetas HTML o scripts.");
          return;
        }
        for (let i = 0; i < abilities.length; i++) {
          if (contieneEtiquetas(abilities[i])) {
            alert(`La habilidad ${i + 1} no debe contener etiquetas HTML o scripts.`);
            return;
          }
        }

        const heroLevelInput = document.getElementById("heroLevel");
        if (!heroLevelInput) {
          alert("No se encontró el campo 'Nivel'.");
          return;
        }
        const levelValue = heroLevelInput.value;
        const level = Number(levelValue);
        if (isNaN(level)) {
          alert("El campo 'Nivel' debe ser un número válido.");
          return;
        }
        if (level < 1 || level > 18) {
          alert("El nivel debe estar entre 1 y 18.");
          return;
        }

        const heroPasivoInput = document.getElementById("heroPasivo");
        if (!heroPasivoInput) {
          alert("No se encontró el campo 'Pasivo'.");
          return;
        }
        const pasivo = heroPasivoInput.value;

        const runasSelect = document.getElementById("heroRunas");
        if (!runasSelect) {
          alert("No se encontró el campo 'Runas'.");
          return;
        }
        const runas = Array.from(runasSelect.selectedOptions).map(option => option.value);

        try {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, abilities, level, pasivo, runas }),
          });
          if (res.ok) {
            alert("Héroe agregado correctamente");
            addHeroForm.reset();
          } else {
            alert("Error al agregar el héroe");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Error en la conexión");
        }
      });
    }
  }

  /*****************************************************
   * 2) PÁGINA: LISTA DE HÉROES (listPage)
   *****************************************************/
  if (document.body.classList.contains("listPage")) {
    const carousel = document.getElementById("carousel");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let heroesData = [];
    let currentIndex = 0;

    // Función para renderizar la lista de habilidades saniteada
    function renderAbilitiesList(abilities) {
      return `
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${abilities
            .map((ability, i) => `<li>Habilidad ${i + 1}: ${sanitize(ability)}</li>`)
            .join("")}
        </ul>
      `;
    }

    // Obtener héroes del backend
    async function fetchHeroes() {
      try {
        const res = await fetch(API_URL);
        heroesData = await res.json();

        if (heroesData.length === 0) {
          carousel.innerHTML = "<p>No hay héroes registrados.</p>";
        } else {
          renderCarousel();
        }
      } catch (error) {
        console.error("Error al obtener héroes:", error);
        carousel.innerHTML = "<p>Error al cargar los héroes.</p>";
      }
    }

    // Renderizar la vista según la cantidad de héroes
    function renderCarousel() {
      carousel.innerHTML = "";

      // Si hay MÁS de 3 héroes, ocultamos botones y mostramos todos en forma de grid
      if (heroesData.length > 3) {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";

        heroesData.forEach((hero) => {
          const card = document.createElement("div");
          card.classList.add("card");
          card.innerHTML = `
            <h2>${sanitize(hero.name)}</h2>
            <p><strong>Habilidades:</strong></p>
            ${renderAbilitiesList(hero.abilities)}
            <p><strong>Nivel:</strong> ${hero.level}</p>
          `;
          carousel.appendChild(card);
        });
      } 
      // Si hay 3 o menos héroes, se muestra el carrusel con navegación
      else {
        prevBtn.style.display = "inline-block";
        nextBtn.style.display = "inline-block";

        const leftIndex = (currentIndex - 1 + heroesData.length) % heroesData.length;
        const rightIndex = (currentIndex + 1) % heroesData.length;
        let indicesToShow = [leftIndex, currentIndex, rightIndex];

        if (heroesData.length === 1) {
          indicesToShow = [currentIndex];
        } else if (heroesData.length === 2) {
          indicesToShow = [currentIndex, rightIndex];
        }

        indicesToShow.forEach((idx) => {
          const hero = heroesData[idx];
          const card = document.createElement("div");
          card.classList.add("card");

          // Resaltar la tarjeta central
          if (idx === currentIndex) {
            card.classList.add("active");
          }

          card.innerHTML = `
            <h2>${sanitize(hero.name)}</h2>
            <p><strong>Habilidades:</strong></p>
            ${renderAbilitiesList(hero.abilities)}
            <p><strong>Nivel:</strong> ${hero.level}</p>
          `;
          carousel.appendChild(card);
        });
      }
    }

    // Funciones de navegación para el carrusel
    function nextHero() {
      currentIndex = (currentIndex + 1) % heroesData.length;
      renderCarousel();
    }

    function prevHero() {
      currentIndex = (currentIndex - 1 + heroesData.length) % heroesData.length;
      renderCarousel();
    }

    if (prevBtn) prevBtn.addEventListener("click", prevHero);
    if (nextBtn) nextBtn.addEventListener("click", nextHero);

    fetchHeroes();
  }

  /*****************************************************
   * 3) PÁGINA: EDITAR/ELIMINAR HÉROES (editPage)
   *****************************************************/
  if (document.body.classList.contains("editPage")) {
    const heroList = document.getElementById("heroList");

    async function fetchHeroes() {
      try {
        const res = await fetch(API_URL);
        const heroes = await res.json();
        heroList.innerHTML = "";

        heroes.forEach((hero) => {
          const card = document.createElement("div");
          card.classList.add("edit-card");

          card.innerHTML = `
            <h2>Nombre:</h2>
            <input type="text" value="${sanitize(hero.name)}" id="name-${hero._id}" />

            <h3>Habilidades:</h3>
            <input type="text" value="${sanitize(hero.abilities[0])}" id="ab1-${hero._id}" />
            <input type="text" value="${sanitize(hero.abilities[1])}" id="ab2-${hero._id}" />
            <input type="text" value="${sanitize(hero.abilities[2])}" id="ab3-${hero._id}" />
            <input type="text" value="${sanitize(hero.abilities[3])}" id="ab4-${hero._id}" />

            <h3>Nivel:</h3>
            <input type="number" value="${hero.level}" id="level-${hero._id}" min="1" max="18" />

            <!-- NUEVO: Campo para Pasivo (select) -->
            <h3>Pasivo:</h3>
            <select id="pasivo-${hero._id}" required>
              <option value="">Selecciona un pasivo</option>
              <option value="pasivo1" ${hero.pasivo === "pasivo1" ? "selected" : ""}>Pasivo 1</option>
              <option value="pasivo2" ${hero.pasivo === "pasivo2" ? "selected" : ""}>Pasivo 2</option>
              <option value="pasivo3" ${hero.pasivo === "pasivo3" ? "selected" : ""}>Pasivo 3</option>
              <option value="pasivo4" ${hero.pasivo === "pasivo4" ? "selected" : ""}>Pasivo 4</option>
              <option value="pasivo5" ${hero.pasivo === "pasivo5" ? "selected" : ""}>Pasivo 5</option>
              <option value="pasivo6" ${hero.pasivo === "pasivo6" ? "selected" : ""}>Pasivo 6</option>
            </select>

            <!-- NUEVO: Campo para Runas (multi-select) -->
            <h3>Runas:</h3>
            <select id="runas-${hero._id}" multiple required>
              <option value="runa1" ${hero.runas && hero.runas.includes("runa1") ? "selected" : ""}>Runa 1</option>
              <option value="runa2" ${hero.runas && hero.runas.includes("runa2") ? "selected" : ""}>Runa 2</option>
              <option value="runa3" ${hero.runas && hero.runas.includes("runa3") ? "selected" : ""}>Runa 3</option>
              <option value="runa4" ${hero.runas && hero.runas.includes("runa4") ? "selected" : ""}>Runa 4</option>
              <option value="runa5" ${hero.runas && hero.runas.includes("runa5") ? "selected" : ""}>Runa 5</option>
              <option value="runa6" ${hero.runas && hero.runas.includes("runa6") ? "selected" : ""}>Runa 6</option>
              <option value="runa7" ${hero.runas && hero.runas.includes("runa7") ? "selected" : ""}>Runa 7</option>
            </select>

            <div class="buttons">
              <button onclick="updateHero('${hero._id}')">Guardar cambios</button>
              <button onclick="deleteHero('${hero._id}')">Eliminar</button>
            </div>
          `;
          heroList.appendChild(card);
        });
      } catch (error) {
        console.error("Error al obtener héroes:", error);
      }
    }

    window.updateHero = async function (id) {
      // Verificar que los campos existan antes de usarlos
      const nameEl = document.getElementById(`name-${id}`);
      if (!nameEl) {
        alert("No se encontró el campo 'Nombre'.");
        return;
      }
      const name = nameEl.value;

      const ab1El = document.getElementById(`ab1-${id}`);
      const ab2El = document.getElementById(`ab2-${id}`);
      const ab3El = document.getElementById(`ab3-${id}`);
      const ab4El = document.getElementById(`ab4-${id}`);
      if (!ab1El || !ab2El || !ab3El || !ab4El) {
        alert("No se encontró alguno de los campos de habilidades.");
        return;
      }
      const abilities = [
        ab1El.value,
        ab2El.value,
        ab3El.value,
        ab4El.value,
      ];

      // Validaciones (nombre y habilidades)
      if (contieneEtiquetas(name)) {
        alert("El campo 'Nombre' no debe contener etiquetas HTML o scripts.");
        return;
      }
      for (let i = 0; i < abilities.length; i++) {
        if (contieneEtiquetas(abilities[i])) {
          alert(`La habilidad ${i + 1} no debe contener etiquetas HTML o scripts.`);
          return;
        }
      }

      const levelEl = document.getElementById(`level-${id}`);
      if (!levelEl) {
        alert("No se encontró el campo 'Nivel'.");
        return;
      }
      const levelValue = levelEl.value;
      const level = Number(levelValue);
      if (isNaN(level)) {
        alert("El campo 'Nivel' debe ser un número válido.");
        return;
      }
      if (level < 1 || level > 18) {
        alert("El nivel debe estar entre 1 y 18.");
        return;
      }

      const pasivoEl = document.getElementById(`pasivo-${id}`);
      if (!pasivoEl) {
        alert("No se encontró el campo 'Pasivo'.");
        return;
      }
      const pasivo = pasivoEl.value;

      const runasSelect = document.getElementById(`runas-${id}`);
      if (!runasSelect) {
        alert("No se encontró el campo 'Runas'.");
        return;
      }
      const runas = Array.from(runasSelect.selectedOptions).map(option => option.value);

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, abilities, level, pasivo, runas }),
        });
        if (res.ok) {
          alert("Héroe actualizado");
          fetchHeroes();
        } else {
          alert("Error al actualizar");
        }
      } catch (error) {
        console.error("Error al actualizar:", error);
      }
    };

    window.deleteHero = async function (id) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("Héroe eliminado");
          fetchHeroes();
        } else {
          alert("Error al eliminar");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    };

    fetchHeroes();
  }
});

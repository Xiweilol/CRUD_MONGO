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

document.addEventListener("DOMContentLoaded", () => {

  /*****************************************************
   * 1) PÁGINA: AGREGAR HÉROE (addPage)
   *****************************************************/
  if (document.body.classList.contains("addPage")) {
    const addHeroForm = document.getElementById("addHeroForm");
    if (addHeroForm) {
      addHeroForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("heroName").value;
        const abilities = [
          document.getElementById("ability1").value,
          document.getElementById("ability2").value,
          document.getElementById("ability3").value,
          document.getElementById("ability4").value,
        ];

        // Validación del nivel
        const levelValue = document.getElementById("heroLevel").value;
        const level = Number(levelValue);
        if (isNaN(level)) {
          alert("El campo 'Nivel' debe ser un número válido.");
          return;
        }
        if (level < 1 || level > 18) {
          alert("El nivel debe estar entre 1 y 18.");
          return;
        }

        try {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, abilities, level }),
          });
          if (res.ok) {
            alert("Heroe agregado correctamente");
            addHeroForm.reset();
          } else {
            alert("Error al agregar el heroe");
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
        console.error("Error al obtener heroes:", error);
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

            <div class="buttons">
              <button onclick="updateHero('${hero._id}')">Guardar cambios</button>
              <button onclick="deleteHero('${hero._id}')">Eliminar</button>
            </div>
          `;
          heroList.appendChild(card);
        });
      } catch (error) {
        console.error("Error al obtener heroes:", error);
      }
    }

    window.updateHero = async function (id) {
      const name = document.getElementById(`name-${id}`).value;
      const abilities = [
        document.getElementById(`ab1-${id}`).value,
        document.getElementById(`ab2-${id}`).value,
        document.getElementById(`ab3-${id}`).value,
        document.getElementById(`ab4-${id}`).value,
      ];
      const levelValue = document.getElementById(`level-${id}`).value;
      const level = Number(levelValue);

      if (isNaN(level)) {
        alert("El campo 'Nivel' debe ser un número válido.");
        return;
      }
      if (level < 1 || level > 18) {
        alert("El nivel debe estar entre 1 y 18.");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, abilities, level }),
        });
        if (res.ok) {
          alert("Heroe actualizado");
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
          alert("Heroe eliminado");
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

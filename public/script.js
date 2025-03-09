// Ajusta la URL de tu backend en Render:
const API_URL = "https://crud-mongo-rsxf.onrender.com/api/characters";

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

        // POST para crear héroe
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
  
    // Función para renderizar la lista de habilidades
    function renderAbilitiesList(abilities) {
      return `
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${abilities
            .map((ability, i) => `<li>Habilidad ${i + 1}: ${ability}</li>`)
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
      // Limpiamos el contenedor
      carousel.innerHTML = "";
  
      // Si hay MÁS de 3 héroes, ocultamos botones y mostramos todos en una sola vista
      if (heroesData.length > 3) {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
  
        heroesData.forEach((hero) => {
          const card = document.createElement("div");
          card.classList.add("card");
          card.innerHTML = `
            <h2>${hero.name}</h2>
            <p><strong>Habilidades:</strong></p>
            ${renderAbilitiesList(hero.abilities)}
            <p><strong>Nivel:</strong> ${hero.level}</p>
          `;
          carousel.appendChild(card);
        });
      } 
      // De lo contrario, mostramos el carrusel con hasta 3 tarjetas
      else {
        prevBtn.style.display = "inline-block";
        nextBtn.style.display = "inline-block";
  
        // Calculamos índices de la tarjeta izquierda, central y derecha
        const leftIndex = (currentIndex - 1 + heroesData.length) % heroesData.length;
        const rightIndex = (currentIndex + 1) % heroesData.length;
  
        // Por defecto, mostramos [left, current, right]
        let indicesToShow = [leftIndex, currentIndex, rightIndex];
  
        // Ajustes si hay menos de 3 héroes
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
            <h2>${hero.name}</h2>
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
  
    // Eventos de los botones
    if (prevBtn) prevBtn.addEventListener("click", nextHero);
    if (nextBtn) nextBtn.addEventListener("click", prevHero);
  
    // Iniciar
    fetchHeroes();
  }

/*****************************************************
 * PÁGINA: EDITAR/ELIMINAR HÉROES (editPage)
 *****************************************************/
if (document.body.classList.contains("editPage")) {
    const heroList = document.getElementById("heroList");
  
    async function fetchHeroes() {
      try {
        const res = await fetch(API_URL);
        const heroes = await res.json();
        heroList.innerHTML = "";
  
        heroes.forEach((hero) => {
          // Creamos un div con clase "edit-card"
          const card = document.createElement("div");
          card.classList.add("edit-card");
  
          card.innerHTML = `
            <h2>Nombre:</h2>
            <input type="text" value="${hero.name}" id="name-${hero._id}" />
  
            <h3>Habilidades:</h3>
            <input type="text" value="${hero.abilities[0]}" id="ab1-${hero._id}" />
            <input type="text" value="${hero.abilities[1]}" id="ab2-${hero._id}" />
            <input type="text" value="${hero.abilities[2]}" id="ab3-${hero._id}" />
            <input type="text" value="${hero.abilities[3]}" id="ab4-${hero._id}" />
  
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
  

    // Función global para actualizar
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

      // Validaciones
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

    // Función global para eliminar
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

    // Cargamos la lista al iniciar la página
    fetchHeroes();
  }
});

// script.js

// URL de la API (ajusta según tu backend en Render)
const API_URL = "https://crud-mongo-rsxf.onrender.com/api/characters";

document.addEventListener("DOMContentLoaded", () => {
  // Código para la página de agregar héroe
  const addHeroForm = document.getElementById('addHeroForm');
  if (addHeroForm) {
    addHeroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('heroName').value;
      const abilities = [
        document.getElementById('ability1').value,
        document.getElementById('ability2').value,
        document.getElementById('ability3').value,
        document.getElementById('ability4').value
      ];
      
      // Obtener y validar el nivel
      const levelValue = document.getElementById('heroLevel').value;
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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, abilities, level })
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

  // Funciones y código compartido para las páginas de edición y lista
  const heroList = document.getElementById("heroList");
  if (heroList) {
    // Función para obtener y renderizar héroes
    async function fetchHeroes() {
      try {
        const res = await fetch(API_URL);
        const heroes = await res.json();
        heroList.innerHTML = "";
        heroes.forEach(hero => {
          // Si es la página de edición, mostramos inputs y botones
          if (document.body.classList.contains('editPage')) {
            const li = document.createElement('li');
            li.innerHTML = `
              <strong>Nombre:</strong> <input type="text" value="${hero.name}" id="name-${hero._id}" /><br>
              <strong>Habilidades:</strong>
              <input type="text" value="${hero.abilities[0]}" id="ab1-${hero._id}" />
              <input type="text" value="${hero.abilities[1]}" id="ab2-${hero._id}" />
              <input type="text" value="${hero.abilities[2]}" id="ab3-${hero._id}" />
              <input type="text" value="${hero.abilities[3]}" id="ab4-${hero._id}" /><br>
              <strong>Nivel:</strong> <input type="number" value="${hero.level}" id="level-${hero._id}" min="1" max="18"/><br>
              <button onclick="updateHero('${hero._id}')">Guardar cambios</button>
              <button onclick="deleteHero('${hero._id}')">Eliminar</button>
              <hr>
            `;
            heroList.appendChild(li);
          } else {
            // Si es la página de lista, mostramos solo los datos
            const li = document.createElement('li');
            li.textContent = `Nombre: ${hero.name} | Habilidades: ${hero.abilities.join(", ")} | Nivel: ${hero.level}`;
            heroList.appendChild(li);
          }
        });
      } catch (error) {
        console.error("Error al obtener heroes:", error);
      }
    }
    
    // Llamamos a la función para cargar la lista
    fetchHeroes();

    // Sólo para la página de edición, definimos las funciones globales de actualizar y eliminar
    if (document.body.classList.contains('editPage')) {
      window.updateHero = async function(id) {
        const name = document.getElementById(`name-${id}`).value;
        const abilities = [
          document.getElementById(`ab1-${id}`).value,
          document.getElementById(`ab2-${id}`).value,
          document.getElementById(`ab3-${id}`).value,
          document.getElementById(`ab4-${id}`).value
        ];
        const levelValue = document.getElementById(`level-${id}`).value;
        const level = Number(levelValue);
        
        // Validación en la edición
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
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, abilities, level })
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
    
      window.deleteHero = async function(id) {
        try {
          const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
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
    }
  }
});

// URL de la API (ajusta según tu backend en Render)
const API_URL = "https://crud-mongo-rsxf.onrender.com/api/characters";
const API_REGISTER = "https://crud-mongo-rsxf.onrender.com/api/register";
const API_LOGIN    = "https://crud-mongo-rsxf.onrender.com/api/login";
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
        const name = document.getElementById("heroName").value;
        const abilities = [
          document.getElementById("ability1").value,
          document.getElementById("ability2").value,
          document.getElementById("ability3").value,
          document.getElementById("ability4").value,
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
  
        // NUEVO: Obtener valores para pasivo y runas
        const pasivo = document.getElementById("heroPasivo").value;
        const runasSelect = document.getElementById("heroRunas");
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
      const name = document.getElementById(`name-${id}`).value;
      const abilities = [
        document.getElementById(`ab1-${id}`).value,
        document.getElementById(`ab2-${id}`).value,
        document.getElementById(`ab3-${id}`).value,
        document.getElementById(`ab4-${id}`).value,
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
  
      // Validación del nivel
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
  
      // NUEVO: Obtener valores para pasivo y runas
      const pasivo = document.getElementById(`pasivo-${id}`).value;
      const runasSelect = document.getElementById(`runas-${id}`);
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


/*****************************************************
 * 4) PÁGINA: LOGIN.HTML (LOGIN) con redirección según el rol
 *****************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evitamos el envío inmediato del formulario

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      // Validar que los campos no estén vacíos
      if (username === "" || password === "") {
        alert("Por favor, completa todos los campos.");
        return;
      }

      // Validar que los campos no contengan etiquetas HTML o scripts
      if (contieneEtiquetas(username) || contieneEtiquetas(password)) {
        alert("Los campos no deben contener etiquetas HTML o scripts.");
        return;
      }

      // Se prepara el payload (se asume que username es el email)
      const payload = { username, password };

      try {
        const response = await fetch(API_LOGIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
          const errorMsg = data.error || (data.errors && data.errors.map(err => err.msg).join(", "));
          alert("Error en el inicio de sesión: " + errorMsg);
        } else {
          // Guardamos el token en sessionStorage
          sessionStorage.setItem("token", data.token);
          
          // Guardamos el rol del usuario también
          sessionStorage.setItem("userRole", data.user.rol);
          
          alert("¡Inicio de sesión exitoso!");
          
          // Redireccionamos según el rol
          if (data.user.rol === "admin") {
            window.location.href = "editHero.html";
          } else {
            window.location.href = "listHeroes.html";
          }
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error en la conexión. Intenta nuevamente.");
      }
    });
  }
});

/*****************************************************
 * 5) PÁGINA: empezar.html (REGISTRO) con verificación de código admin
 *****************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registroForm");
  if (!registerForm) return; // Si no existe, no continúa para evitar errores en otras páginas

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita el envío automático del formulario

    // Obtener y limpiar los valores de cada campo
    const nombre   = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email    = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    // Aquí usamos el campo "rol" para enviar el código admin
    const codigoAdmin = document.getElementById("rol").value.trim();
    const password = document.getElementById("password").value;

    // Verificar que ninguno de los campos obligatorios esté vacío
    if (!nombre || !apellido || !email || !telefono || !password) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Validar que ningún campo contenga etiquetas HTML o scripts
    if (
      contieneEtiquetas(nombre) ||
      contieneEtiquetas(apellido) ||
      contieneEtiquetas(email) ||
      contieneEtiquetas(telefono) ||
      (codigoAdmin && contieneEtiquetas(codigoAdmin)) ||
      contieneEtiquetas(password)
    ) {
      alert("Ningún campo debe contener etiquetas HTML o scripts.");
      return;
    }

    // Validar el formato del email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("El formato del email es incorrecto.");
      return;
    }

    // Expresión regular para verificar que solo haya números en el teléfono
    const soloNumeros = /^\d+$/;
    if (!soloNumeros.test(telefono)) {
      alert("El teléfono debe contener solo números.");
      return;
    }

    // Preparar el payload para enviar a la API. 
    // El backend se encargará de asignar el rol "admin" o "user" según el código.
    const payload = { 
      nombre, 
      apellido, 
      email, 
      telefono, 
      codigoAdmin, 
      password 
    };

    try {
      const response = await fetch(API_REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error || (data.errors && data.errors.map(err => err.msg).join(", "));
        alert("Error en el registro: " + errorMsg);
      } else {
        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        // Redireccionar a la página de login
        window.location.href = "login.html";
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error en la conexión. Intenta nuevamente.");
    }
  });
});


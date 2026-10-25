/* Kends web — lógica de la página principal */

/* ---------- Reloj del vlog (REC) ---------- */
const tiempo = document.getElementById('tiempo');

if (tiempo) {
  const inicio = Date.now();
  /** @param {number} n */
  const p = n => String(n).padStart(2, '0');
  /** @type {number | null} */
  let intervalo = null;

  const actualizar = () => {
    const s = Math.floor((Date.now() - inicio) / 1000);
    tiempo.textContent =
      p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60);
  };

  const arrancar = () => {
    if (intervalo !== null) return;
    actualizar();
    intervalo = setInterval(actualizar, 1000);
  };

  const parar = () => {
    if (intervalo === null) return;
    clearInterval(intervalo);
    intervalo = null;
  };

  arrancar();

  // Ahorra batería cuando la pestaña no está visible.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) parar();
    else arrancar();
  });
}

/* ---------- Paneles: pulsar la sección ya abierta la cierra ---------- */
const paneles = Array.from(document.querySelectorAll('.panel'));
const enlacesNav = document.querySelectorAll('.vlog nav a');
const idsPaneles = paneles.map(panel => panel.id);

/** @type {string | null} */
let abierto = null;

const estaAbierto = id => abierto === id;

/** Refleja el estado en el DOM (la clase .abierto es la que anima el panel). */
const pintarPaneles = () => {
  paneles.forEach(panel => panel.classList.toggle('abierto', panel.id === abierto));
  enlacesNav.forEach(enlace => {
    const id = idDeEnlace(enlace);
    if (id) enlace.setAttribute('aria-expanded', String(estaAbierto(id)));
  });
};

/** @param {Element} enlace */
function idDeEnlace(enlace) {
  const href = enlace.getAttribute('href') || '';
  return href.length > 1 && href.startsWith('#') ? href.slice(1) : null;
}

/** Quita el hash de la URL sin dejar una "#" suelta ni mover el scroll. */
const limpiarHash = () => {
  try {
    history.replaceState(null, '', location.pathname + location.search);
  } catch {
    // Algunos navegadores (file://) bloquean replaceState: como último recurso.
    location.hash = '';
  }
};

/** Sincroniza el estado con el hash actual (carga inicial, atrás/adelante, enlaces). */
const sincronizarPaneles = () => {
  const id = location.hash.slice(1);
  abierto = idsPaneles.includes(id) ? id : null;
  pintarPaneles();
};

enlacesNav.forEach(enlace => {
  enlace.addEventListener('click', evento => {
    const id = idDeEnlace(enlace);
    if (!id || !idsPaneles.includes(id)) return;

    if (estaAbierto(id)) {
      // Ya estaba abierto: lo cerramos sin navegar.
      evento.preventDefault();
      abierto = null;
      pintarPaneles();
      limpiarHash();
      return;
    }

    // Abrir: dejamos que el navegador cambie el hash y haga el scroll.
    abierto = id;
    pintarPaneles();
  });
});

window.addEventListener('hashchange', sincronizarPaneles);
sincronizarPaneles();

/* ---------- Animación de encendido del CRT ---------- */
const crt = document.getElementById('crt');

if (crt) {
  /** @param {number} ms */
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  const cargada =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));

  const fuentes = document.fonts ? document.fonts.ready : Promise.resolve();

  const terminar = () => {
    crt.classList.add('listo');
    document.body.classList.remove('cargando');
    setTimeout(() => crt.remove(), 400);
  };

  Promise.race([
    Promise.all([esperar(800), cargada, fuentes]),
    esperar(6000) // red de seguridad: nunca dejar la web tapada
  ]).then(terminar, terminar);
}

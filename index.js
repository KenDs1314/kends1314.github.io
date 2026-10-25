  document.querySelectorAll('.vlog nav a').forEach(enlace => {
      enlace.addEventListener('click', evento => {
        if (location.hash === enlace.getAttribute('href')) {
          evento.preventDefault();
          location.hash = '';
        }
      });
    });
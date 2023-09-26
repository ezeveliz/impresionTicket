let swlocation = "sw.js";

if(navigator.serviceWorker){
  if(window.location.href.includes("localhost")) swlocation="/sw.js";
  navigator.serviceWorker.register(swlocation);
}

/*if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('Service Worker registrado con éxito:', registration);
        })
        .catch(error => {
          console.error('Error al registrar el Service Worker:', error);
        });
    });
}*/
  


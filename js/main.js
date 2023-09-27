class Main {
  constructor() {
      this.registerServiceWorker();
  }

  registerServiceWorker() {
      if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                  .then(registration => {
                      console.log('Service Worker registrado con éxito:', registration);
                  })
                  .catch(error => {
                      console.error('Error al registrar el Service Worker:', error);
                  });
          });
      }
  }
}

window.addEventListener('load', () => {
  new Main();
});

// Obtener el elemento de entrada de archivo
const fileInput = document.getElementById('fileInput');

// Registrar el evento 'fileinput' para manejar la carga del archivo compartido
fileInput.addEventListener('change', (event) => {
  const sharedFiles = event.target.files;
  if (sharedFiles.length > 0) {
    const sharedFile = sharedFiles[0]; // Obtener el primer archivo compartido
    // Haz algo con el archivo compartido, por ejemplo, muestra su nombre en la consola
    console.log('Archivo compartido:', sharedFile.name);
  }
});


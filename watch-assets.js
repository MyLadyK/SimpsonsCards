// watch-assets.js
const { exec } = require('child_process');
const chokidar = require('chokidar');

// Ruta absoluta o relativa a la carpeta de assets del frontend
const assetsPath = './frontend/simpsons-cards/src/assets';

// Comando para matar todos los procesos node (ng serve) y lanzar ng serve con proxy
const ngServeCmd = 'taskkill /IM node.exe /F & cd frontend/simpsons-cards && start cmd /k "ng serve --proxy-config proxy.conf.json"';

console.log('Observando nuevas imágenes en:', assetsPath);

// Observa cambios en la carpeta de assets
chokidar.watch(assetsPath, { ignoreInitial: true }).on('add', (path) => {
  console.log(`Imagen nueva detectada: ${path}. Reiniciando Angular...`);
  exec(ngServeCmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Error reiniciando Angular:', err);
    } else {
      console.log('Angular reiniciado.');
    }
  });
});

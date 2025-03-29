const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'springfield_shuffle'
};

// Conectar a la base de datos
const connection = mysql.createConnection(dbConfig);

// Función para obtener la rareza basada en el personaje
function getRarity(characterName) {
  const mainCharacters = ['Homer', 'Bart', 'Lisa', 'Marge', 'Maggie'];
  
  if (mainCharacters.includes(characterName)) {
    return 'Common';
  }
  
  return 'Uncommon';
}

// Función para obtener la descripción basada en el nombre del archivo
function getDescription(fileName, characterName) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const descriptions = {
    'space_homer': 'Homer Simpson en su traje espacial, listo para viajar a las estrellas. Esta icónica imagen muestra a Homer en su momento más heroico, aunque probablemente no sepa cómo usar el control de la nave.',
    'no_beer_no_tv': 'Homer Simpson en su estado más desesperado: sin cerveza ni televisión. Esta carta muestra a Homer en su sofá, con cara de tristeza y una mirada vacía, reflejando su dependencia de las dos cosas que más ama en la vida.',
    'ny_bills': 'Homer Simpson mostrando su fanatismo por los Buffalo Bills. Aunque no es el equipo más exitoso de la NFL, Homer mantiene su lealtad inquebrantable, incluso cuando el equipo está en su peor momento.',
    'naked_bart': 'Bart Simpson en su estado más natural. Esta carta muestra a Bart desnudo, corriendo por Springfield con su característica risa y una expresión de total despreocupación.',
    'loser_lisa': 'Lisa Simpson en su momento más vulnerable. Aunque es la más inteligente de la familia, incluso ella tiene sus momentos de duda y frustración. Esta carta muestra a Lisa en un momento de reflexión.',
    'cool_lisa': 'Lisa Simpson mostrando su lado más rebelde. Con gafas de sol y una actitud despreocupada, esta carta muestra a Lisa disfrutando de la vida y rompiendo sus propias reglas por una vez.',
    'mayor_marge': 'Marge Simpson en su papel como alcaldesa de Springfield. Con su característico peinado azul y un traje de poder, esta carta muestra a Marge enfrentando los desafíos de gobernar una ciudad llena de personajes excéntricos.',
    'witch_marge': 'Marge Simpson transformada en bruja durante Halloween. Con un sombrero puntiagudo y una varita mágica, esta carta muestra a Marge en uno de los episodios más memorables de la serie.',
    'violent_maggie': 'Maggie Simpson mostrando su lado más peligroso. Aunque parece una bebé indefensa, Maggie tiene una fuerza sorprendente y no duda en usar su chupete como arma cuando es necesario.',
    'barts_snake': 'El momento icónico donde Bart Simpson es atacado por una serpiente. Esta carta muestra la escena que se convirtió en uno de los momentos más memorables de la serie, con Bart gritando mientras la serpiente lo persigue.',
    'the_stonecutters': 'Los Stonecutters en su reunión secreta. Esta carta muestra a Homer descubriendo la sociedad secreta más poderosa de Springfield, con todos los miembros usando máscaras y mantos ceremoniales.',
    'crying_bart': 'Bart Simpson llorando desconsoladamente. Esta carta muestra un lado más vulnerable de Bart, demostrando que incluso el niño más travieso de Springfield tiene sus momentos de tristeza.',
    'home': 'La casa de los Simpson vista desde el exterior. Esta carta muestra la icónica casa amarilla con su césped perfectamente cortado y la valla blanca, el escenario de tantas aventuras familiares.',
    'baby_sax': 'Lisa Simpson tocando su saxofón como bebé. Esta carta muestra a Lisa demostrando su talento musical desde muy temprana edad, con su característica expresión concentrada y el saxofón rosado.',
    'homerlike_lisa': 'Lisa Simpson imitando a Homer. Esta carta muestra a Lisa en uno de sus momentos más cómicos, adoptando la actitud y el comportamiento de su padre para sorpresa de todos.',
    'lisa_for_president': 'Lisa Simpson en su campaña presidencial. Con un traje de poder y un cartel de campaña, esta carta muestra a Lisa en uno de sus momentos más ambiciosos y políticos.',
    'kan_maggie': 'Maggie Simpson con su chupete de "Kan". Esta carta muestra a Maggie en su versión más kawaii, con su chupete característico y una expresión tranquila y serena.',
    'maggie_spears': 'Maggie Simpson con su jabalí. Esta carta muestra a Maggie en una de sus aventuras más peligrosas, enfrentándose a un jabalí salvaje con su característica valentía.',
    'police_marge': 'Marge Simpson como policía. Con uniforme y gafas de sol, esta carta muestra a Marge en uno de sus papeles más autoritarios, manteniendo el orden en Springfield.',
    'moe': 'Moe Szyslak en el Moe\'s Tavern. Esta carta muestra a Moe en su bar, con su característica barba y una expresión de descontento, siempre listo para servir una cerveza a sus clientes habituales.',
    'whole_town': 'Vista panorámica de toda Springfield. Esta carta muestra la ciudad en su totalidad, con todos sus lugares emblemáticos y personajes característicos en un solo plano.'
  };
  
  return descriptions[baseName] || `${characterName} en "${baseName}"`;
}

// Obtener todos los archivos de imágenes
const assetsDir = path.join(__dirname, '../../frontend/simpsons-cards/src/assets');
const imageFiles = [];

// Recorrer las carpetas y subcarpetas
function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath);
    } else {
      const ext = path.extname(f).toLowerCase();
      if (ext === '.jpg' || ext === '.png') {
        imageFiles.push(path.join(dirPath));
      }
    }
  });
}

walkDir(assetsDir);

// Borrar las cartas existentes
connection.query('DELETE FROM cards', (err) => {
  if (err) throw err;
  
  // Insertar las nuevas cartas
  const insertPromises = imageFiles.map(filePath => {
    const relativePath = path.relative(assetsDir, filePath);
    const parts = relativePath.split(path.sep);
    const characterName = parts[0];
    const fileName = parts[parts.length - 1];
    
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO cards (name, character_name, image_url, description, rarity) VALUES (?, ?, ?, ?, ?)',
        [
          fileName.replace(path.extname(fileName), ''),
          characterName.charAt(0).toUpperCase() + characterName.slice(1),
          `/assets/${relativePath}`,
          getDescription(fileName, characterName),
          getRarity(characterName)
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  // Ejecutar todas las inserciones
  Promise.all(insertPromises)
    .then(() => {
      console.log('Cartas actualizadas exitosamente');
      connection.end();
    })
    .catch(err => {
      console.error('Error:', err);
      connection.end();
    });
});

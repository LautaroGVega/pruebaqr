const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key';
const TOKEN_EXPIRATION_TIME = 10; // Segundos

// Habilitar CORS
app.use(cors());

let currentToken = null;

// Generar token controller
function generateToken() {
  const token = jwt.sign({ url: 'https://www.mercadolibre.com.ar/licor-jagermeister-manifest-1000/p/MLA21647371' }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION_TIME });
  
  currentToken = token;
  
  // Imprimir el token en la consola cada vez que se genera
  console.log(`Nuevo token generado: ${token}`);
  
  return token;
}

// Generar QR que apunta a la ruta de verificación de token en el backend CONTROLLER
async function generateQRCode(token) {
  const url = `http://localhost:${PORT}/verify-token?token=${token}`; // URL local para la verificación del token
  return await QRCode.toDataURL(url); // QR ahora genera un link a la ruta de verificación
}

// Ruta para obtener el QR ROUTES
app.get('/generate-qr', async (req, res) => {
  const token = generateToken();
  const qrCode = await generateQRCode(token);
  res.json({ qrCode });
});

// Ruta de verificación del token ROUTES
app.get('/verify-token', (req, res) => {
  const token = req.query.token;

  try {
    // Verificar el token
    const decoded = jwt.verify(token, SECRET_KEY);
    // Si es válido, redirigir a la URL original
    res.redirect(decoded.url);
  } catch (err) {
    // Si el token ha expirado o es inválido, mostrar error
    res.status(401).send('El token ha expirado o es inválido.');
  }
});

// Reiniciar el QR cada 10 segundos CONTROLLER
setInterval(() => {
  generateToken();
  console.log('Nuevo QR generado');
}, TOKEN_EXPIRATION_TIME * 1000);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

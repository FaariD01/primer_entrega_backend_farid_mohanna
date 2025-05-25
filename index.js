const httpServer = require('./src/app.js');

const PORT = 8080;

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

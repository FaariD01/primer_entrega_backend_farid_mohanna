const { app, httpServer } = require('./src/app.js');


const PORT = 3000;

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

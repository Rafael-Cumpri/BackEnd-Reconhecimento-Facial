const express = require('express');
const multer = require('multer');
const path = require('path');
const controllers = require('./controllers');

// Configuração do servidor
const app = express();
app.use(express.json());

// Configura o armazenamento de imagens no upload/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Rota para carregar modelos face-api.js
app.get('/load-models', async (req, res) => {
  await loadModels();
  res.json({ message: 'Modelos carregados' });
});

// Rotas CRUD
app.get('/pessoas', controllers.getAllPessoas);
app.get('/pessoas/:id', controllers.getPessoaById);
app.post('/pessoas', upload.single('imagem'), controllers.createPessoa);
app.put('/pessoas/:id', controllers.updatePessoa);
app.delete('/pessoas/:id', controllers.deletePessoa);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

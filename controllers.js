const pool = require('./db');
const fs = require('fs');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

// Setup face-api.js for Node.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Carrega os modelos da face-api.js
const MODEL_URL = path.join(__dirname, 'models');
async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
}

// Função para extrair descritores faciais de uma imagem
async function getFaceDescriptor(imagePath) {
  const img = await canvas.loadImage(imagePath);
  const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  if (!detections) return null;
  return detections.descriptor.join(',');
}

// CRUD
const controllers = {
  // GET ALL
  getAllPessoas: async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM pessoas');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  // GET por ID
  getPessoaById: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM pessoas WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  // POST (criar nova pessoa)
  createPessoa: async (req, res) => {
    const { nome } = req.body;
    const imagePath = req.file.path;

    try {
      // Gera descritor facial
      const descriptorFacial = await getFaceDescriptor(imagePath);
      if (!descriptorFacial) return res.status(400).json({ error: 'Nenhum rosto detectado' });

      // Inserir pessoa no banco de dados
      const result = await pool.query(
        'INSERT INTO pessoas (nome, caminho_imagem, descriptor_facial) VALUES ($1, $2, $3) RETURNING *',
        [nome, imagePath, descriptorFacial]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  // PUT (atualizar pessoa)
  updatePessoa: async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    try {
      const result = await pool.query(
        'UPDATE pessoas SET nome = $1 WHERE id = $2 RETURNING *',
        [nome, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  // DELETE (remover pessoa)
  deletePessoa: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM pessoas WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
      res.json({ message: 'Pessoa deletada com sucesso' });
    } catch (err) {
      res.status(500).json(err.message);
    }
  }
};

module.exports = controllers;
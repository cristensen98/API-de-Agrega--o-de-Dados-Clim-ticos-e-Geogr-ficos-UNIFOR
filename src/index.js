const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const climaRoutes = require('./routes/clima');
const cidadesRoutes = require('./routes/cidades');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Charset UTF-8 para respostas JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Rotas
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/clima', climaRoutes);
app.use('/api/v1/cidades', cidadesRoutes);

// Handler 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    erro: true,
    codigo: 'ROTA_NAO_ENCONTRADA',
    mensagem: `A rota ${req.method} ${req.originalUrl} não existe`
  });
});

// Só inicia o servidor se não estiver em modo de teste
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
  });
}

module.exports = app;

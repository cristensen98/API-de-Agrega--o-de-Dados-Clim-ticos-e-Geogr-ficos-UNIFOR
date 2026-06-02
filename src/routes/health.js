const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/v1/health
 * Verifica o status da API e dos serviços externos.
 */
router.get('/', async (req, res) => {
  try {
    await axios.get(
      'https://brasilapi.com.br/api/cptec/v1/cidade/Fortaleza',
      { timeout: 5000 }
    );

    return res.status(200).json({
      status: 'healthy',
      versao: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({
      status: 'degraded',
      versao: '1.0.0',
      timestamp: new Date().toISOString(),
      motivo: 'Serviço externo indisponível'
    });
  }
});

module.exports = router;

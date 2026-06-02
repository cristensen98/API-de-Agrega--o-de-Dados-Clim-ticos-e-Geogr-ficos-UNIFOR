const express = require('express');
const router = express.Router();
const axios = require('axios');

const BRASIL_API_BASE = 'https://brasilapi.com.br/api';

// Lista oficial de siglas UF do Brasil
const SIGLAS_UF_VALIDAS = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]);

/**
 * GET /api/v1/cidades/:sigla_uf
 * Retorna lista de municípios de um estado brasileiro.
 *
 * Query params:
 *   limite (int, default: 10, max: 100) — quantidade máxima de cidades retornadas
 */
router.get('/:sigla_uf', async (req, res) => {
  const { sigla_uf } = req.params;
  const limiteParam = req.query.limite;

  // Validação do formato da sigla (exatamente 2 letras)
  if (!sigla_uf || sigla_uf.length !== 2 || !/^[a-zA-Z]{2}$/.test(sigla_uf)) {
    return res.status(400).json({
      erro: true,
      codigo: 'SIGLA_UF_INVALIDA',
      mensagem: 'A sigla do estado deve conter exatamente 2 letras',
      sigla_uf_informada: sigla_uf
    });
  }

  const siglaUpper = sigla_uf.toUpperCase();

  // Valida se a UF existe
  if (!SIGLAS_UF_VALIDAS.has(siglaUpper)) {
    return res.status(404).json({
      erro: true,
      codigo: 'UF_NAO_ENCONTRADA',
      mensagem: 'Estado com a sigla informada não foi encontrado',
      sigla_uf_informada: sigla_uf
    });
  }

  // Valida e limita o parâmetro 'limite'
  let limite = 10;
  if (limiteParam !== undefined) {
    const limiteNumero = parseInt(limiteParam, 10);
    if (isNaN(limiteNumero) || limiteNumero < 1 || limiteNumero > 100) {
      return res.status(400).json({
        erro: true,
        codigo: 'PARAMETRO_INVALIDO',
        mensagem: 'O parâmetro limite deve ser um número inteiro entre 1 e 100',
        valor_informado: limiteParam
      });
    }
    limite = limiteNumero;
  }

  try {
    const response = await axios.get(
      `${BRASIL_API_BASE}/ibge/municipios/v1/${siglaUpper}?providers=dados-abertos-br,gov,wikipedia`,
      { timeout: 10000 }
    );

    const municipios = response.data;

    if (!municipios || municipios.length === 0) {
      return res.status(404).json({
        erro: true,
        codigo: 'UF_NAO_ENCONTRADA',
        mensagem: 'Estado com a sigla informada não foi encontrado',
        sigla_uf_informada: sigla_uf
      });
    }

    const cidadesLimitadas = municipios
      .slice(0, limite)
      .map(m => ({ nome: m.nome }));

    return res.status(200).json({
      uf: siglaUpper,
      quantidade_retornada: cidadesLimitadas.length,
      cidades: cidadesLimitadas,
      consultado_em: new Date().toISOString()
    });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        erro: true,
        codigo: 'UF_NAO_ENCONTRADA',
        mensagem: 'Estado com a sigla informada não foi encontrado',
        sigla_uf_informada: sigla_uf
      });
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        erro: true,
        codigo: 'SERVICO_EXTERNO_INDISPONIVEL',
        mensagem: 'Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes',
        servico: 'BRASILAPI'
      });
    }

    console.error('[CIDADES] Erro inesperado:', error.message);
    return res.status(500).json({
      erro: true,
      codigo: 'ERRO_INTERNO',
      mensagem: 'Ocorreu um erro interno no servidor'
    });
  }
});

module.exports = router;

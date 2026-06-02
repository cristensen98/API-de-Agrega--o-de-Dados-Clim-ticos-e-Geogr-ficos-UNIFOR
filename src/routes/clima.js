const express = require('express');
const router = express.Router();
const axios = require('axios');

const BRASIL_API_BASE = 'https://brasilapi.com.br/api';

// Mapa de códigos de condição climática do CPTEC para descrições
const CONDICOES_TEMPO = {
  'ec': 'Encoberto com Chuvas Isoladas',
  'ci': 'Chuvas Isoladas',
  'c': 'Chuva',
  'in': 'Instável',
  'pp': 'Possibilidade de Pancadas de Chuva',
  'cm': 'Chuva pela Manhã',
  'cn': 'Chuva à Noite',
  'pt': 'Pancadas de Chuva à Tarde',
  'pm': 'Pancadas de Chuva pela Manhã',
  'np': 'Nublado e Pancadas de Chuva',
  'pc': 'Pancadas de Chuva',
  'pn': 'Parcialmente Nublado',
  'cv': 'Chuvisco',
  'ch': 'Chuvoso',
  'nt': 'Nublado',
  'e': 'Encoberto',
  'nv': 'Nevoeiro',
  'gr': 'Granizo',
  'tp': 'Tempestade',
  'ps': 'Predomínio de Sol',
  'bl': 'Branco',
  'vn': 'Ventos Intensos',
  'ne': 'Neve',
  'nd': 'Não Definido',
  'psc': 'Possibilidade de Chuva',
  'pcm': 'Possibilidade de Chuva pela Manhã',
  'pct': 'Possibilidade de Chuva à Tarde',
  'pcn': 'Possibilidade de Chuva à Noite',
  'npt': 'Nublado com Pancadas à Tarde',
  'npn': 'Nublado com Pancadas à Noite',
  'ncn': 'Nublado com Chuva à Noite',
  'nct': 'Nublado com Chuva à Tarde',
  'ncm': 'Nublado com Chuva de Manhã',
  'npm': 'Nublado com Pancadas de Manhã',
  'npp': 'Nublado com Possibilidade de Chuva',
  'vf': 'Variedade de Fenômenos',
  'sci': 'Sol com Chuva Isolada',
  'cpm': 'Chuva pela Manhã e à Tarde'
};

/**
 * GET /api/v1/clima/:nome_cidade
 * Retorna informações geográficas e climáticas de uma cidade brasileira.
 */
router.get('/:nome_cidade', async (req, res) => {
  const { nome_cidade } = req.params;

  // Validação: nome mínimo de 2 caracteres
  if (!nome_cidade || nome_cidade.trim().length < 2) {
    return res.status(400).json({
      erro: true,
      codigo: 'NOME_INVALIDO',
      mensagem: 'O nome da cidade deve conter pelo menos 2 caracteres',
      nome_informado: nome_cidade || ''
    });
  }

  try {
    // ── Passo 1: Buscar cidade pelo nome via CPTEC ──────────────────────────
    let cidadeResponse;
    try {
      cidadeResponse = await axios.get(
        `${BRASIL_API_BASE}/cptec/v1/cidade/${encodeURIComponent(nome_cidade.trim())}`,
        { timeout: 10000 }
      );
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        return res.status(503).json({
          erro: true,
          codigo: 'SERVICO_EXTERNO_INDISPONIVEL',
          mensagem: 'Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes',
          servico: 'CPTEC'
        });
      }
      throw err;
    }

    const cidades = cidadeResponse.data;

    if (!cidades || cidades.length === 0) {
      return res.status(404).json({
        erro: true,
        codigo: 'CIDADE_NAO_ENCONTRADA',
        mensagem: 'Nenhuma cidade encontrada com o nome informado',
        nome_informado: nome_cidade
      });
    }

    // Escolhe a cidade mais próxima ao nome buscado (primeiro resultado)
    const cidade = cidades[0];

    // ── Passo 2: Buscar previsão climática pelo código CPTEC da cidade ──────
    let climaData = null;
    try {
      const previsaoResponse = await axios.get(
        `${BRASIL_API_BASE}/cptec/v1/clima/previsao/${cidade.id}`,
        { timeout: 10000 }
      );

      if (previsaoResponse.data?.clima?.length > 0) {
        climaData = previsaoResponse.data.clima[0];
      }
    } catch (climaErr) {
      // Tenta endpoint alternativo de capitais
      try {
        const altResponse = await axios.get(
          `${BRASIL_API_BASE}/cptec/v1/clima/capital/${cidade.id}/previsao`,
          { timeout: 10000 }
        );
        if (Array.isArray(altResponse.data) && altResponse.data.length > 0) {
          climaData = altResponse.data[0];
        }
      } catch {
        // Dados climáticos indisponíveis, retorna apenas dados geográficos
      }
    }

    // ── Passo 3: Montar resposta combinada ──────────────────────────────────
    const resposta = {
      nome: cidade.nome,
      estado: cidade.estado,
      consultado_em: new Date().toISOString()
    };

    if (climaData) {
      resposta.clima = {
        temperatura_min: climaData.temperatura_minima ?? climaData.min ?? null,
        temperatura_max: climaData.temperatura_maxima ?? climaData.max ?? null,
        condicao: CONDICOES_TEMPO[climaData.condicao] ?? climaData.condicao_desc ?? climaData.condicao ?? 'Não Definido',
        unidades: {
          temperatura: '°C'
        }
      };
    }

    return res.status(200).json(resposta);

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        erro: true,
        codigo: 'CIDADE_NAO_ENCONTRADA',
        mensagem: 'Nenhuma cidade encontrada com o nome informado',
        nome_informado: nome_cidade
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

    console.error('[CLIMA] Erro inesperado:', error.message);
    return res.status(500).json({
      erro: true,
      codigo: 'ERRO_INTERNO',
      mensagem: 'Ocorreu um erro interno no servidor'
    });
  }
});

module.exports = router;

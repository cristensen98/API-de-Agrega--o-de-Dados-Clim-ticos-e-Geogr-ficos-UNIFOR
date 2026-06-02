const request = require('supertest');
const app = require('../src/index');

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Health Check
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/v1/health', () => {
  test('deve retornar HTTP 200 com campos obrigatórios', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('versao', '1.0.0');
    expect(res.body).toHaveProperty('timestamp');
    expect(['healthy', 'degraded']).toContain(res.body.status);
  });

  test('timestamp deve estar no formato ISO 8601', async () => {
    const res = await request(app).get('/api/v1/health');
    const ts = new Date(res.body.timestamp);
    expect(ts.toString()).not.toBe('Invalid Date');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Endpoint Clima
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/v1/clima/:nome_cidade', () => {

  // ── Casos de sucesso ──────────────────────────────────────────────────────

  test('deve retornar HTTP 200 com dados de Fortaleza', async () => {
    const res = await request(app).get('/api/v1/clima/Fortaleza');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nome');
    expect(res.body).toHaveProperty('estado');
    expect(res.body).toHaveProperty('consultado_em');
    expect(typeof res.body.nome).toBe('string');
  }, 20000);

  test('deve retornar HTTP 200 com dados de São Paulo', async () => {
    const res = await request(app).get('/api/v1/clima/Sao Paulo');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nome');
    expect(res.body).toHaveProperty('estado');
    expect(res.body).toHaveProperty('consultado_em');
    expect(typeof res.body.nome).toBe('string');
  }, 20000);

  // ── Tratamento de erros ───────────────────────────────────────────────────

  test('deve retornar HTTP 404 para cidade inexistente', async () => {
    const res = await request(app).get('/api/v1/clima/CidadeInexistente99999');

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe(true);
    expect(res.body.codigo).toBe('CIDADE_NAO_ENCONTRADA');
    expect(res.body).toHaveProperty('nome_informado');
  }, 20000);

  test('deve retornar HTTP 400 para nome com menos de 2 caracteres', async () => {
    const res = await request(app).get('/api/v1/clima/X');

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe(true);
    expect(res.body.codigo).toBe('NOME_INVALIDO');
    expect(res.body.nome_informado).toBe('X');
  });

  test('deve retornar HTTP 400 para nome com numero)', async () => {
    const res = await request(app).get('/api/v1/clima/ ');

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe(true);
    expect(res.body.codigo).toBe('NOME_INVALIDO');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Endpoint Cidades por Estado
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/v1/cidades/:sigla_uf', () => {

  // ── Casos de sucesso ──────────────────────────────────────────────────────

  test('deve retornar HTTP 200 com lista de cidades do CE', async () => {
    const res = await request(app).get('/api/v1/cidades/CE');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uf', 'CE');
    expect(res.body).toHaveProperty('quantidade_retornada');
    expect(res.body).toHaveProperty('cidades');
    expect(res.body).toHaveProperty('consultado_em');
    expect(Array.isArray(res.body.cidades)).toBe(true);
    expect(res.body.cidades.length).toBeGreaterThan(0);
  }, 20000);

  test('deve aceitar sigla em minúsculas (ce) e retornar UF em maiúsculas', async () => {
    const res = await request(app).get('/api/v1/cidades/ce');

    expect(res.status).toBe(200);
    expect(res.body.uf).toBe('CE');
  }, 20000);

  test('deve respeitar o parâmetro limite=5', async () => {
    const res = await request(app).get('/api/v1/cidades/SP?limite=5');

    expect(res.status).toBe(200);
    expect(res.body.cidades.length).toBeLessThanOrEqual(5);
    expect(res.body.quantidade_retornada).toBeLessThanOrEqual(5);
  }, 20000);

  test('cada cidade deve ter apenas o campo nome', async () => {
    const res = await request(app).get('/api/v1/cidades/RJ?limite=3');

    expect(res.status).toBe(200);
    res.body.cidades.forEach(c => {
      expect(c).toHaveProperty('nome');
      expect(typeof c.nome).toBe('string');
    });
  }, 20000);

  // ── Tratamento de erros ───────────────────────────────────────────────────

  test('deve retornar HTTP 400 para sigla com mais de 2 caracteres', async () => {
    const res = await request(app).get('/api/v1/cidades/ceara');

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe(true);
    expect(res.body.codigo).toBe('SIGLA_UF_INVALIDA');
  });

  test('deve retornar HTTP 400 para sigla com números', async () => {
    const res = await request(app).get('/api/v1/cidades/C1');

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe(true);
    expect(res.body.codigo).toBe('SIGLA_UF_INVALIDA');
  });

  test('deve retornar HTTP 404 para UF inexistente (XX)', async () => {
    const res = await request(app).get('/api/v1/cidades/XX');

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe(true);
    expect(res.body.codigo).toBe('UF_NAO_ENCONTRADA');
    expect(res.body).toHaveProperty('sigla_uf_informada');
  });
});

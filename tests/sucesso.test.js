const request = require('supertest');
const app = require('../src/index');

// Suite: Health Check — Sucesso
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

// Suite: Endpoint Clima — Sucesso
describe('GET /api/v1/clima/:nome_cidade — Sucesso', () => {
  test('deve retornar HTTP 200 com dados de Fortaleza', async () => {
    const res = await request(app).get('/api/v1/clima/Fortaleza');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nome');
    expect(res.body).toHaveProperty('estado');
    expect(res.body).toHaveProperty('consultado_em');
    expect(typeof res.body.nome).toBe('string');
  }, 20000);

  test('deve retornar HTTP 200 com dados de São Paulo', async () => {
    const res = await request(app).get('/api/v1/clima').query({ nome_cidade: 'São Paulo' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nome');
    expect(res.body).toHaveProperty('estado');
    expect(res.body).toHaveProperty('consultado_em');
    expect(typeof res.body.nome).toBe('string');
  }, 20000);
});

// Suite: Endpoint Cidades por Estado — Sucesso
describe('GET /api/v1/cidades/:sigla_uf — Sucesso', () => {
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
});

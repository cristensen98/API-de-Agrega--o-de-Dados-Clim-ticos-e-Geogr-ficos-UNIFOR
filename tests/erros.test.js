const request = require('supertest');
const app = require('../src/index');

// Suite: Endpoint Clima — Erros
describe('GET /api/v1/clima/:nome_cidade — Erros', () => {
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

  test('deve retornar HTTP 400 para nome vazio (somente espaço)', async () => {
    const res = await request(app).get('/api/v1/clima/ ');

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe(true);
    expect(res.body.codigo).toBe('NOME_INVALIDO');
  });
});

// Suite: Endpoint Cidades por Estado — Erros
describe('GET /api/v1/cidades/:sigla_uf — Erros', () => {
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

// Testes de integração da Sprint 02: login (RF01), cadastro, edição, inativação,
// busca e filtros de animais (RF02, RF03) e isolamento entre propriedades (RNF06).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { sql, prepararBanco, iniciarServidor, cliente } = require('./ajuda');

let servidor; let base;

before(async () => {
  await prepararBanco();
  servidor = await iniciarServidor();
  base = `http://localhost:${servidor.address().port}`;
});

after(async () => {
  servidor.close();
  await sql.end();
});

const animalValido = {
  numero: '120', nome: 'Mimosa', sexo: 'F', categoria: 'novilha', lote_id: '3',
  data_nascimento: '2024-03-10', sinais: 'Malhada, mancha na orelha',
};

// ---------------------------------------------------------------- CA01 / RF01
test('CA01 – página interna sem login redireciona para /login', async () => {
  const c = cliente(base);
  for (const rota of ['/', '/animais', '/animais/1', '/lotes', '/mais']) {
    const r = await c.get(rota);
    assert.equal(r.status, 302, rota);
    assert.equal(r.local, '/login', rota);
  }
});

test('CA01 – senha incorreta não libera o acesso e mantém o e-mail', async () => {
  const c = cliente(base);
  const r = await c.entrar('teste@vacaamarela.dev', 'errada');
  assert.equal(r.status, 401);
  assert.match(r.html, /E-mail ou senha incorretos/);
  assert.match(r.html, /value="teste@vacaamarela.dev"/);
  assert.equal((await c.get('/')).local, '/login');
});

test('CA01 – login correto libera as páginas e elas não ficam em cache', async () => {
  const c = cliente(base);
  const r = await c.entrar('teste@vacaamarela.dev');
  assert.equal(r.status, 302);
  assert.equal(r.local, '/');
  const painel = await c.get('/');
  assert.equal(painel.status, 200);
  assert.match(painel.html, /Resumo do rebanho/);
  assert.equal(painel.cabecalhos.get('cache-control'), 'no-store');
});

test('CA01 – após Sair, a sessão deixa de valer', async () => {
  const c = cliente(base);
  await c.entrar('teste@vacaamarela.dev');
  const sair = await c.post('/sair');
  assert.equal(sair.local, '/login');
  assert.equal((await c.get('/animais')).local, '/login');
});

// ---------------------------------------------------------------- CA02 / RF02
test('CA02 – cadastrar animal: aparece na ficha e registra a entrada no lote', async () => {
  const c = cliente(base);
  await c.entrar('teste@vacaamarela.dev');
  const r = await c.post('/animais', animalValido);
  assert.equal(r.status, 302);
  const ficha = await c.get(r.local);
  assert.match(ficha.html, /Nº 120 · Mimosa/);
  assert.match(ficha.html, /salvo com sucesso/);
  assert.match(ficha.html, /Entrada em <strong>Recria/);
});

test('CA02 – número repetido é recusado e os demais campos são mantidos', async () => {
  const c = cliente(base);
  await c.entrar('teste@vacaamarela.dev');
  const r = await c.post('/animais', { ...animalValido, numero: '01', nome: 'Repetida' });
  assert.equal(r.status, 422);
  assert.match(r.html, /Já existe um animal com o número 01/);
  assert.match(r.html, /value="Repetida"/);
  assert.match(r.html, /Malhada, mancha na orelha/);
});

test('CA02 – campos obrigatórios vazios e dados inválidos são indicados', async () => {
  const c = cliente(base);
  await c.entrar('teste@vacaamarela.dev');
  const r = await c.post('/animais', { numero: '', sexo: 'M', categoria: 'matriz', data_nascimento: '2999-01-01' });
  assert.equal(r.status, 422);
  assert.match(r.html, /Informe o número pintado/);
  assert.match(r.html, /não combina com o sexo/);
  assert.match(r.html, /não pode ser futura/);
});

// ---------------------------------------------------------------- CA03 / RF02
test('CA03 – edição com troca de lote registra a movimentação', async () => {
  const c = cliente(base);
  await c.entrar('teste@vacaamarela.dev');
  const r = await c.post('/animais/3', {
    numero: '03', sexo: 'F', categoria: 'novilha', lote_id: '1', nome: 'Branquinha',
  });
  assert.equal(r.local, '/animais/3');
  const ficha = await c.get('/animais/3');
  assert.match(ficha.html, /Nº 03 · Branquinha/);
  assert.match(ficha.html, /Recria → <strong>Matrizes/);
  const [mov] = await sql`SELECT count(*)::int AS n FROM movimentacao_lote WHERE animal_id = 3`;
  assert.equal(mov.n, 2);
});

test('CA03 – inativar retira da lista de ativos, aparece em Inativos e mantém o histórico', async () => {
  const c = cliente(base);
  await c.entrar('teste@vacaamarela.dev');
  await c.post('/animais/4/inativar');
  const ativos = await c.get('/animais');
  assert.doesNotMatch(ativos.html, /Tufão/);
  const inativos = await c.get('/animais?situacao=inativos');
  assert.match(inativos.html, /Tufão/);
  const ficha = await c.get('/animais/4');
  assert.match(ficha.html, /inativo/);
  assert.match(ficha.html, /Entrada em <strong>Matrizes/);
  await c.post('/animais/4/reativar');
});

// ---------------------------------------------------------------- CA04 / RF03
test('CA04 – busca por número ou nome e filtros combinados', async () => {
  const c = cliente(base);
  await c.entrar('teste@vacaamarela.dev');
  const porNome = await c.get('/animais?busca=estrela');
  assert.match(porNome.html, /Estrela/);
  assert.doesNotMatch(porNome.html, /Pintada/);
  const porNumero = await c.get('/animais?busca=02');
  assert.match(porNumero.html, /Pintada/);
  const combinado = await c.get('/animais?categoria=matriz&lote=1');
  assert.match(combinado.html, /Estrela/);
  assert.match(combinado.html, /Pintada/);
  assert.doesNotMatch(combinado.html, /Tufão/);
  const vazio = await c.get('/animais?busca=inexistente');
  assert.match(vazio.html, /Nenhum animal encontrado/);
});

// ---------------------------------------------------------------- CA14 / RNF06
test('CA14 – usuário de outra propriedade não vê nem altera os animais da propriedade de teste', async () => {
  const c = cliente(base);
  await c.entrar('outra@vacaamarela.dev');
  const lista = await c.get('/animais');
  assert.match(lista.html, /Animal de outra propriedade/);
  assert.doesNotMatch(lista.html, /Estrela/);
  assert.equal((await c.get('/animais/1')).status, 404);
  assert.equal((await c.get('/animais/1/editar')).status, 404);
  assert.equal((await c.post('/animais/1/inativar')).status, 404);
  const tentativa = await c.post('/animais/1', { numero: 'X', sexo: 'F', categoria: 'matriz' });
  assert.equal(tentativa.status, 404);
  const [estrela] = await sql`SELECT numero, situacao FROM animal WHERE id = 1`;
  assert.deepEqual({ ...estrela }, { numero: '01', situacao: 'ativo' });
});

test('CA14 – não é possível vincular lote de outra propriedade', async () => {
  const c = cliente(base);
  await c.entrar('teste@vacaamarela.dev');
  const r = await c.post('/animais', { ...animalValido, numero: '121', lote_id: '4' });
  assert.equal(r.status, 422);
  assert.match(r.html, /Lote inválido/);
});

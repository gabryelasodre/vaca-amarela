const animais = require('../models/animalModel');
const lotes = require('../models/loteModel');
const { validarAnimal, CATEGORIAS, hojeISO } = require('../validacao/animal');

const SITUACOES = ['ativos', 'inativos', 'todos'];

function idValido(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function listar(req, res, next) {
  try {
    const pid = req.session.usuario.propriedadeId;
    const filtros = {
      busca: String(req.query.busca || '').trim().slice(0, 40),
      categoria: CATEGORIAS[req.query.categoria] ? req.query.categoria : '',
      loteId: idValido(req.query.lote),
      situacao: SITUACOES.includes(req.query.situacao) ? req.query.situacao : 'ativos',
    };
    const [lista, listaLotes] = await Promise.all([animais.listar(pid, filtros), lotes.listar(pid)]);
    res.render('animais/lista', {
      titulo: 'Animais', ativo: 'animais', animais: lista, lotes: listaLotes,
      filtros, categorias: Object.keys(CATEGORIAS),
    });
  } catch (erro) { next(erro); }
}

async function opcoesFormulario(pid, animalId) {
  const [listaLotes, maes] = await Promise.all([lotes.listar(pid), animais.femeas(pid, animalId)]);
  return { lotes: listaLotes, maes, categorias: Object.keys(CATEGORIAS), hoje: hojeISO() };
}

async function novo(req, res, next) {
  try {
    res.render('animais/formulario', {
      titulo: 'Cadastrar animal', ativo: 'animais', animal: { sexo: '', categoria: '' }, erros: {},
      acao: '/animais', ...(await opcoesFormulario(req.session.usuario.propriedadeId)),
    });
  } catch (erro) { next(erro); }
}

// Confere se lote e mãe escolhidos pertencem à mesma propriedade.
async function validarVinculos(pid, dados, erros, animalId) {
  if (dados.lote_id && !(await lotes.pertence(pid, dados.lote_id))) erros.lote_id = 'Lote inválido.';
  if (dados.mae_id) {
    const mae = await animais.buscar(pid, dados.mae_id);
    if (!mae || mae.sexo !== 'F' || mae.id === animalId) erros.mae_id = 'Escolha uma fêmea da propriedade.';
  }
}

async function salvar(req, res, next) {
  const pid = req.session.usuario.propriedadeId;
  const animalId = req.params.id ? idValido(req.params.id) : null;
  const { dados, erros } = validarAnimal(req.body);
  const reexibir = async (status) => res.status(status).render('animais/formulario', {
    titulo: animalId ? 'Editar animal' : 'Cadastrar animal', ativo: 'animais',
    animal: { ...dados, id: animalId }, erros,
    acao: animalId ? `/animais/${animalId}` : '/animais',
    ...(await opcoesFormulario(pid, animalId)),
  });
  try {
    if (req.params.id && !animalId) return res.status(404).render('paginas/mensagem', naoEncontrado);
    await validarVinculos(pid, dados, erros, animalId);
    if (Object.keys(erros).length) return reexibir(422);

    let id = animalId;
    if (animalId) {
      if (!(await animais.atualizar(pid, animalId, dados))) {
        return res.status(404).render('paginas/mensagem', naoEncontrado);
      }
    } else {
      id = await animais.criar(pid, dados);
    }
    req.session.aviso = `Animal nº ${dados.numero} salvo com sucesso.`;
    res.redirect(`/animais/${id}`);
  } catch (erro) {
    if (erro.code === '23505') {
      if (String(erro.constraint_name).includes('brinco')) erros.brinco = 'Este brinco já está cadastrado.';
      else erros.numero = `Já existe um animal com o número ${dados.numero} nesta propriedade.`;
      return reexibir(422);
    }
    next(erro);
  }
}

const naoEncontrado = {
  titulo: 'Animal não encontrado', ativo: 'animais',
  texto: 'O animal não existe ou não pertence à sua propriedade.',
};

async function ficha(req, res, next) {
  try {
    const id = idValido(req.params.id);
    const animal = id && await animais.buscar(req.session.usuario.propriedadeId, id);
    if (!animal) return res.status(404).render('paginas/mensagem', naoEncontrado);
    res.render('animais/ficha', {
      titulo: `Nº ${animal.numero}`, ativo: 'animais', animal,
      historico: await animais.historicoLotes(animal.id),
    });
  } catch (erro) { next(erro); }
}

async function editar(req, res, next) {
  try {
    const pid = req.session.usuario.propriedadeId;
    const id = idValido(req.params.id);
    const animal = id && await animais.buscar(pid, id);
    if (!animal) return res.status(404).render('paginas/mensagem', naoEncontrado);
    res.render('animais/formulario', {
      titulo: 'Editar animal', ativo: 'animais', animal, erros: {},
      acao: `/animais/${id}`, ...(await opcoesFormulario(pid, id)),
    });
  } catch (erro) { next(erro); }
}

function mudarSituacao(situacao, mensagem) {
  return async (req, res, next) => {
    try {
      const id = idValido(req.params.id);
      const ok = id && await animais.alterarSituacao(req.session.usuario.propriedadeId, id, situacao);
      if (!ok) return res.status(404).render('paginas/mensagem', naoEncontrado);
      req.session.aviso = mensagem;
      res.redirect(`/animais/${id}`);
    } catch (erro) { next(erro); }
  };
}

module.exports = {
  listar, novo, salvar, ficha, editar,
  inativar: mudarSituacao('inativo', 'Animal inativado. O histórico foi mantido.'),
  reativar: mudarSituacao('ativo', 'Animal reativado.'),
};

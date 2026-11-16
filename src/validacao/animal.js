// Validação dos dados do formulário de animal (executada no servidor).
const CATEGORIAS = {
  matriz: 'F', novilha: 'F', bezerra: 'F',
  touro: 'M', boi: 'M', garrote: 'M', bezerro: 'M',
};

function hojeISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function inteiroOuNulo(v) {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : NaN;
}

function validarAnimal(corpo) {
  const texto = (v) => (v === undefined || v === null ? '' : String(v).trim());
  const erros = {};
  const dados = {
    numero: texto(corpo.numero).toUpperCase(),
    nome: texto(corpo.nome) || null,
    brinco: texto(corpo.brinco) || null,
    sinais: texto(corpo.sinais) || null,
    sexo: texto(corpo.sexo),
    raca: texto(corpo.raca) || null,
    data_nascimento: texto(corpo.data_nascimento) || null,
    nascimento_estimado: corpo.nascimento_estimado === 'on' || corpo.nascimento_estimado === 'true',
    categoria: texto(corpo.categoria),
    lote_id: inteiroOuNulo(corpo.lote_id),
    mae_id: inteiroOuNulo(corpo.mae_id),
    observacoes: texto(corpo.observacoes) || null,
  };

  if (!dados.numero) erros.numero = 'Informe o número pintado no animal.';
  else if (!/^[A-Z0-9-]{1,12}$/.test(dados.numero)) erros.numero = 'Use até 12 letras, números ou hífen.';
  if (dados.nome && dados.nome.length > 60) erros.nome = 'Use no máximo 60 caracteres.';
  if (dados.brinco && dados.brinco.length > 30) erros.brinco = 'Use no máximo 30 caracteres.';
  if (dados.sinais && dados.sinais.length > 200) erros.sinais = 'Use no máximo 200 caracteres.';
  if (!['F', 'M'].includes(dados.sexo)) erros.sexo = 'Escolha o sexo.';
  if (!CATEGORIAS[dados.categoria]) erros.categoria = 'Escolha a categoria.';
  else if (!erros.sexo && CATEGORIAS[dados.categoria] !== dados.sexo) {
    erros.categoria = `A categoria "${dados.categoria}" não combina com o sexo escolhido.`;
  }
  if (dados.data_nascimento) {
    const valida = /^\d{4}-\d{2}-\d{2}$/.test(dados.data_nascimento)
      && !Number.isNaN(Date.parse(dados.data_nascimento));
    if (!valida) erros.data_nascimento = 'Data inválida.';
    else if (dados.data_nascimento > hojeISO()) erros.data_nascimento = 'A data de nascimento não pode ser futura.';
  }
  if (Number.isNaN(dados.lote_id)) erros.lote_id = 'Lote inválido.';
  if (Number.isNaN(dados.mae_id)) erros.mae_id = 'Mãe inválida.';

  return { dados, erros };
}

module.exports = { validarAnimal, CATEGORIAS, hojeISO };

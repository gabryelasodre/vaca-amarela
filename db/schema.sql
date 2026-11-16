-- Vaca Amarela – estrutura inicial do banco (PostgreSQL 16)
-- Todas as tabelas de negócio são vinculadas a uma propriedade (isolamento dos dados – RNF06).

CREATE TABLE IF NOT EXISTS propriedade (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(120) NOT NULL,
  municipio   VARCHAR(120),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuario (
  id             SERIAL PRIMARY KEY,
  propriedade_id INTEGER NOT NULL REFERENCES propriedade(id),
  nome           VARCHAR(120) NOT NULL,
  email          VARCHAR(160) NOT NULL UNIQUE,
  senha_hash     VARCHAR(100) NOT NULL,            -- bcrypt (RNF05)
  ativo          BOOLEAN NOT NULL DEFAULT true,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lote (
  id             SERIAL PRIMARY KEY,
  propriedade_id INTEGER NOT NULL REFERENCES propriedade(id),
  nome           VARCHAR(60) NOT NULL,
  descricao      VARCHAR(200),
  ativo          BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (propriedade_id, nome)
);

-- Identificação definida com a propriedade (validação da Sprint 01): número pintado no animal
-- (obrigatório e único na propriedade) + nome. O brinco é opcional, pois a propriedade
-- ainda não possui brincos de identificação.
CREATE TABLE IF NOT EXISTS animal (
  id                 SERIAL PRIMARY KEY,
  propriedade_id     INTEGER NOT NULL REFERENCES propriedade(id),
  numero             VARCHAR(12) NOT NULL,            -- número pintado
  brinco             VARCHAR(30),
  nome               VARCHAR(60),
  sinais             VARCHAR(200),                  -- pelagem, marcas, chifres etc.
  sexo               CHAR(1) NOT NULL CHECK (sexo IN ('F', 'M')),
  raca               VARCHAR(60),
  data_nascimento    DATE,
  nascimento_estimado BOOLEAN NOT NULL DEFAULT false,
  categoria          VARCHAR(20) NOT NULL
                     CHECK (categoria IN ('matriz','novilha','bezerro','bezerra','garrote','touro','boi')),
  lote_id            INTEGER REFERENCES lote(id),
  mae_id             INTEGER REFERENCES animal(id),
  situacao           VARCHAR(12) NOT NULL DEFAULT 'ativo'
                     CHECK (situacao IN ('ativo','inativo','vendido','morto','descartado')),
  observacoes        TEXT,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (propriedade_id, numero),
  UNIQUE (propriedade_id, brinco)
);

-- Histórico de lotes: cada transferência fica registrada, preservando onde o animal estava em cada data.
CREATE TABLE IF NOT EXISTS movimentacao_lote (
  id             SERIAL PRIMARY KEY,
  animal_id      INTEGER NOT NULL REFERENCES animal(id),
  lote_origem_id INTEGER REFERENCES lote(id),
  lote_destino_id INTEGER NOT NULL REFERENCES lote(id),
  data           DATE NOT NULL DEFAULT CURRENT_DATE
);

-- id_requisicao: identificador gerado no formulário; impede registro duplicado
-- quando o usuário reenvia após falha de conexão.
CREATE TABLE IF NOT EXISTS pesagem (
  id            SERIAL PRIMARY KEY,
  animal_id     INTEGER NOT NULL REFERENCES animal(id),
  data          DATE NOT NULL,
  peso_kg       NUMERIC(6,1) NOT NULL CHECK (peso_kg > 0 AND peso_kg < 2000),
  id_requisicao UUID NOT NULL UNIQUE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Manejo coletivo: registra a aplicação feita em um lote inteiro.
CREATE TABLE IF NOT EXISTS manejo_coletivo (
  id                SERIAL PRIMARY KEY,
  lote_id           INTEGER NOT NULL REFERENCES lote(id),
  tipo              VARCHAR(20) NOT NULL CHECK (tipo IN ('vacina','vermifugo','medicamento','outro')),
  produto           VARCHAR(120) NOT NULL,
  data_aplicacao    DATE NOT NULL,
  proxima_aplicacao DATE,
  id_requisicao     UUID NOT NULL UNIQUE,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Manejo individual: SEMPRE existe uma linha por animal tratado.
-- No manejo por lote, o sistema gera uma linha para cada animal presente no lote na data,
-- vinculada ao manejo_coletivo. Assim o histórico individual não muda se o animal trocar de lote.
CREATE TABLE IF NOT EXISTS manejo (
  id                 SERIAL PRIMARY KEY,
  animal_id          INTEGER NOT NULL REFERENCES animal(id),
  manejo_coletivo_id INTEGER REFERENCES manejo_coletivo(id),
  tipo               VARCHAR(20) NOT NULL CHECK (tipo IN ('vacina','vermifugo','medicamento','outro')),
  produto            VARCHAR(120) NOT NULL,
  data_aplicacao     DATE NOT NULL,
  proxima_aplicacao  DATE,
  realizado          BOOLEAN NOT NULL DEFAULT true,
  observacoes        TEXT,
  id_requisicao      UUID UNIQUE,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evento_reprodutivo (
  id        SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES animal(id),
  tipo      VARCHAR(20) NOT NULL CHECK (tipo IN ('cobertura','inseminacao','diagnostico','parto')),
  data      DATE NOT NULL,
  resultado VARCHAR(60),
  cria_id   INTEGER REFERENCES animal(id)
);

CREATE TABLE IF NOT EXISTS saida (
  id        SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL UNIQUE REFERENCES animal(id),
  tipo      VARCHAR(12) NOT NULL CHECK (tipo IN ('venda','morte','descarte')),
  data      DATE NOT NULL,
  motivo    VARCHAR(200)
);

CREATE INDEX IF NOT EXISTS idx_animal_propriedade ON animal (propriedade_id, situacao);
CREATE INDEX IF NOT EXISTS idx_pesagem_animal_data ON pesagem (animal_id, data);
CREATE INDEX IF NOT EXISTS idx_manejo_proxima ON manejo (proxima_aplicacao) WHERE proxima_aplicacao IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_movimentacao_animal ON movimentacao_lote (animal_id, data);

-- Sprint 02 ---------------------------------------------------------------
-- Sessões de login guardadas no banco (sobrevivem a reinícios do servidor).
CREATE TABLE IF NOT EXISTS sessao (
  sid       VARCHAR(64) PRIMARY KEY,
  dados     JSONB NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessao_expira ON sessao (expira_em);

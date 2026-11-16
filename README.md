# Vaca Amarela

Aplicação web responsiva para gestão do rebanho de pequenos pecuaristas: cadastro de animais, pesagens com ganho de peso médio diário (GMD) e calendário sanitário com alertas.

Projeto extensionista da disciplina **Programação Web Aplicada** (Análise e Desenvolvimento de Sistemas – UniEVANGÉLICA, 2026/2), desenvolvido com a **Fazenda Barreiro** (Niquelândia/GO) como propriedade piloto.

## Tecnologias

- Node.js 20+ e Express (servidor, rotas e regras de negócio)
- EJS (páginas renderizadas no servidor) e Bootstrap 5 (layout responsivo)
- PostgreSQL 16 (persistência), acessado pela biblioteca postgres.js
- express-session (sessão guardada no banco) e bcryptjs (senhas)
- Hospedagem prevista: AWS (EC2 + Amazon RDS for PostgreSQL)

## Estrutura

```
src/
  app.js            configuração do Express (views, arquivos estáticos, rotas)
  server.js         ponto de entrada (sobe o servidor HTTP)
  config/db.js      conexão com o PostgreSQL (pool)
  routes/           definição das rotas
  controllers/      tratamento das requisições (camada Controller)
  models/           acesso aos dados (camada Model)
  views/            páginas EJS (camada View)
  middlewares/      autenticação e mensagens
  validacao/        regras de validação dos formulários
public/             CSS, JavaScript e imagens servidos ao navegador
db/schema.sql       criação das tabelas
db/seed.sql         dados FICTÍCIOS para desenvolvimento
test/               testes de integração (node:test)
docs/               diagramas e wireframes do projeto
```

## Como executar localmente

1. Instale o Node.js 20+ e o PostgreSQL 16 (ou use `docker compose up -d` para subir o banco).
2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL`.
3. Instale as dependências e prepare o banco:

```bash
npm install
npm run db:setup   # cria as tabelas e insere os dados fictícios
npm run dev        # http://localhost:3000
```

4. Acesse `http://localhost:3000/saude` para conferir a conexão com o banco.
5. Entre com o usuário fictício `teste@vacaamarela.dev` e a senha `vaca123` (apenas desenvolvimento).

## Testes automatizados

Os testes de integração sobem a aplicação e usam um banco separado (`vaca_amarela_teste`, recriado a cada execução):

```bash
createdb vaca_amarela_teste        # uma única vez (ou pelo pgAdmin)
npm test
```

Para usar outro endereço de banco nos testes, defina `TEST_DATABASE_URL`.

## Funcionalidades disponíveis

| Sprint | Funcionalidade | Requisito |
|---|---|---|
| 01 | Estrutura do banco, servidor Express (MVC), rota `/saude`, layout base | RNF01, RNF07 |
| 02 | Login, sessão e proteção das páginas | RF01, RNF05 |
| 02 | Cadastro, edição, inativação, busca e filtros de animais; histórico de lotes | RF02, RF03 |
| 02 | Isolamento dos dados por propriedade | RNF06 |

## Privacidade

O repositório não contém dados reais do rebanho nem credenciais. O arquivo `.env` está no `.gitignore`; use apenas `.env.example` como modelo.

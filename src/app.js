// Configuração da aplicação Express (padrão MVC).
const path = require('path');
const express = require('express');
const session = require('express-session');
const { SessaoPostgres } = require('./config/sessao');
const { avisos } = require('./middlewares/autenticacao');
const rotas = require('./routes');

const app = express();
const producao = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
if (producao) app.set('trust proxy', 1);            // atrás do Nginx (HTTPS)

app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '7d' }));
// Bootstrap servido localmente (sem CDN externa) para reduzir dependência de rede.
app.use('/vendor/bootstrap',
  express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist'), { maxAge: '30d' }));

app.use(session({
  name: 'vaca.sid',
  store: new SessaoPostgres(),
  secret: process.env.SESSION_SECRET || 'apenas-desenvolvimento',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { httpOnly: true, sameSite: 'lax', secure: producao, maxAge: 8 * 60 * 60 * 1000 },
}));
app.use(avisos);

app.use(rotas);

// Página não encontrada
app.use((req, res) => {
  res.status(404).render('paginas/mensagem', {
    titulo: 'Página não encontrada', ativo: '',
    texto: 'O endereço acessado não existe.',
  });
});

// Erros inesperados (ex.: banco indisponível): mensagem amigável, sem expor detalhes técnicos.
// eslint-disable-next-line no-unused-vars
app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).render('paginas/mensagem', {
    titulo: 'Algo deu errado', ativo: '',
    texto: 'Não foi possível carregar as informações agora. Verifique a conexão e tente novamente.',
  });
});

module.exports = app;

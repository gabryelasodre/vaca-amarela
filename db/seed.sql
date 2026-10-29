-- Dados FICTÍCIOS para desenvolvimento e testes. Não representam o rebanho real.
TRUNCATE saida, evento_reprodutivo, manejo, manejo_coletivo, pesagem,
         movimentacao_lote, animal, lote, usuario, propriedade RESTART IDENTITY CASCADE;

INSERT INTO propriedade (nome, municipio) VALUES ('Propriedade de Teste', 'Niquelândia/GO');

INSERT INTO lote (propriedade_id, nome, descricao) VALUES
  (1, 'Matrizes', 'Vacas em produção – pasto da represa'),
  (1, 'Bezerros', 'Bezerros e bezerras ao pé'),
  (1, 'Recria', 'Novilhas e garrotes');

INSERT INTO animal (propriedade_id, numero, brinco, nome, sinais, sexo, raca,
                    data_nascimento, nascimento_estimado, categoria, lote_id) VALUES
  (1, '01', NULL, 'Estrela', 'Malhada, mancha branca na testa', 'F', 'Girolando', '2019-08-10', true, 'matriz', 1),
  (1, '02', NULL, 'Pintada', 'Vermelha, chifre curto', 'F', 'Nelore x Gir', '2020-02-01', true, 'matriz', 1),
  (1, '03', NULL, NULL, 'Branca, orelha cortada', 'F', 'Nelore', '2023-09-15', false, 'novilha', 3),
  (1, '04', NULL, 'Tufão', 'Preto, cupim alto', 'M', 'Nelore', '2018-05-20', true, 'touro', 1);

INSERT INTO animal (propriedade_id, numero, nome, sinais, sexo, raca,
                    data_nascimento, categoria, lote_id, mae_id) VALUES
  (1, '05', NULL, 'Malhado, filho da Estrela', 'M', 'Girolando', '2026-06-02', 'bezerro', 2, 1);

INSERT INTO movimentacao_lote (animal_id, lote_origem_id, lote_destino_id, data)
SELECT id, NULL, lote_id, criado_em::date FROM animal;

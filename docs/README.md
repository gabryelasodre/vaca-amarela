# Documentação do projeto

| Arquivo | Conteúdo | Seção do relatório |
|---|---|---|
| `diagramas/fluxo-navegacao.dot/.png` | Fluxo de navegação e comportamento ao salvar (sucesso, dados inválidos, sem conexão) | 6.3 |
| `wireframes/wireframes.html` e `.png` | Wireframes de baixa fidelidade – celular e tela grande | 6.4 |
| `diagramas/arquitetura.dot/.png` | Arquitetura da solução na AWS | 6.5 |
| `diagramas/modelo-dados.mmd/.png` | Modelo de dados (entidades e relacionamentos) | 6.6 |

Para regenerar: `dot -Tpng -Gdpi=220 arquivo.dot -o arquivo.png` (Graphviz) e `mmdc -i modelo-dados.mmd -o modelo-dados.png` (Mermaid CLI).

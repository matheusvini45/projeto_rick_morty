# Rick and Morty | Galeria de Personagens

Site estático (HTML + CSS + JavaScript puro, sem frameworks) que consome a
[Rick and Morty API](https://rickandmortyapi.com/) com `fetch` e cria os cards dos
personagens dinamicamente com `createElement` e `appendChild`.

## Funcionalidades
- Cards gerados via JavaScript (nome, imagem, status, espécie, gênero e origem)
- Coração de favorito em cada card (salvo no navegador)
- Busca por nome, filtro por status e paginação
- Layout responsivo e tratamento de erros

## Como executar
Abra o arquivo `index.html` no navegador (é preciso ter internet para a API responder).

## Estrutura
- `index.html`: estrutura da página (contêiner vazio `#cards`)
- `style.css`: estilos e responsividade
- `script.js`: fetch da API e criação dos cards

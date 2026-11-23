// ============================================================
// Rick and Morty - Galeria de Personagens
// Consome https://rickandmortyapi.com/api/character com fetch
// e cria os cards dinamicamente (createElement + appendChild).
// ============================================================

const API_URL = "https://rickandmortyapi.com/api/character";

const traducoes = {
  status: { alive: "Vivo", dead: "Morto", unknown: "Desconhecido" },
  genero: { Male: "Masculino", Female: "Feminino", Genderless: "Sem gênero", unknown: "Desconhecido" },
  especie: { Human: "Humano", Alien: "Alienígena", Robot: "Robô", Animal: "Animal", Humanoid: "Humanoide", unknown: "Desconhecida" }
};

// Elementos da página
const containerCards = document.getElementById("cards");
const campoBusca = document.getElementById("busca");
const filtroStatus = document.getElementById("filtro-status");
const btnFavoritos = document.getElementById("btn-favoritos");
const btnAnterior = document.getElementById("btn-anterior");
const btnProxima = document.getElementById("btn-proxima");
const infoPagina = document.getElementById("info-pagina");
const mensagem = document.getElementById("mensagem");

// Estado da aplicação
let paginaAtual = 1;
let totalPaginas = 1;
let personagensAtuais = [];
let mostrarSoFavoritos = false;
let favoritos = carregarFavoritos();

// ---------- Favoritos (guardados no navegador) ----------
function carregarFavoritos() {
  try {
    return JSON.parse(localStorage.getItem("favoritos-rm")) || [];
  } catch (e) {
    return [];
  }
}

function salvarFavoritos() {
  try {
    localStorage.setItem("favoritos-rm", JSON.stringify(favoritos));
  } catch (e) { /* sem localStorage: segue sem persistir */ }
}

// ---------- Busca de dados na API ----------
async function buscarPersonagens(pagina = 1) {
  const params = new URLSearchParams({ page: pagina });
  const nome = campoBusca.value.trim();
  if (nome) params.set("name", nome);
  if (filtroStatus.value) params.set("status", filtroStatus.value);

  mostrarMensagem("Carregando personagens...");
  containerCards.replaceChildren();

  try {
    const resposta = await fetch(`${API_URL}?${params}`);

    // A API devolve 404 quando nenhum personagem atende ao filtro
    if (resposta.status === 404) {
      personagensAtuais = [];
      totalPaginas = 1;
      paginaAtual = 1;
      mostrarMensagem("Nenhum personagem encontrado com esses filtros.");
      atualizarPaginacao();
      return;
    }
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

    const dados = await resposta.json();
    personagensAtuais = dados.results;
    totalPaginas = dados.info.pages;
    paginaAtual = pagina;
    mostrarMensagem(`${dados.info.count} personagens encontrados.`);
    renderizarCards();
  } catch (erro) {
    console.error(erro);
    personagensAtuais = [];
    mostrarMensagem("Não foi possível carregar os dados. Verifique sua conexão e tente novamente.", true);
  }
  atualizarPaginacao();
}

// ---------- Criação dinâmica dos cards ----------
function criarCard(personagem) {
  const card = document.createElement("article");
  card.className = "card";

  // Coração de favorito (canto superior direito)
  const btnFav = document.createElement("button");
  btnFav.type = "button";
  btnFav.className = "btn-favorito";
  atualizarCoracao(btnFav, favoritos.includes(personagem.id), personagem.name);
  btnFav.addEventListener("click", () => alternarFavorito(personagem, btnFav));

  // Nome
  const nome = document.createElement("h3");
  nome.className = "card-nome";
  nome.textContent = personagem.name;

  // Imagem
  const imagem = document.createElement("img");
  imagem.className = "card-imagem";
  imagem.src = personagem.image;
  imagem.alt = `Imagem de ${personagem.name}`;
  imagem.loading = "lazy";

  // Informações adicionais (status, espécie, gênero, origem)
  const lista = document.createElement("ul");
  lista.className = "card-info";
  lista.appendChild(criarItem("Status", criarStatus(personagem.status)));
  lista.appendChild(criarItem("Espécie", traduzir(traducoes.especie, personagem.species)));
  lista.appendChild(criarItem("Gênero", traduzir(traducoes.genero, personagem.gender)));
  lista.appendChild(criarItem("Origem", personagem.origin.name));

  card.appendChild(btnFav);
  card.appendChild(nome);
  card.appendChild(imagem);
  card.appendChild(lista);
  return card;
}

function criarItem(rotulo, conteudo) {
  const li = document.createElement("li");
  const forte = document.createElement("strong");
  forte.textContent = `${rotulo}: `;
  li.appendChild(forte);
  if (conteudo instanceof Node) li.appendChild(conteudo);
  else li.appendChild(document.createTextNode(conteudo));
  return li;
}

function criarStatus(status) {
  const span = document.createElement("span");
  span.className = `status ${status.toLowerCase()}`;
  span.textContent = traduzir(traducoes.status, status.toLowerCase());
  return span;
}

function traduzir(tabela, valor) {
  return tabela[valor] || valor;
}

function renderizarCards() {
  containerCards.replaceChildren();

  const lista = mostrarSoFavoritos
    ? personagensAtuais.filter((p) => favoritos.includes(p.id))
    : personagensAtuais;

  if (mostrarSoFavoritos && lista.length === 0 && personagensAtuais.length > 0) {
    mostrarMensagem("Nenhum favorito nesta página. Clique no ♥ de algum card!");
  }

  lista.forEach((personagem) => {
    containerCards.appendChild(criarCard(personagem));
  });
}

// ---------- Favoritos ----------
function atualizarCoracao(botao, favorito, nome) {
  botao.textContent = favorito ? "♥" : "♡";
  botao.setAttribute("aria-pressed", String(favorito));
  botao.setAttribute("aria-label", `${favorito ? "Remover" : "Adicionar"} ${nome} ${favorito ? "dos" : "aos"} favoritos`);
}

function alternarFavorito(personagem, botao) {
  const indice = favoritos.indexOf(personagem.id);
  if (indice >= 0) favoritos.splice(indice, 1);
  else favoritos.push(personagem.id);
  salvarFavoritos();

  if (mostrarSoFavoritos) renderizarCards();
  else atualizarCoracao(botao, favoritos.includes(personagem.id), personagem.name);
}

// ---------- Interface ----------
function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function atualizarPaginacao() {
  infoPagina.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  btnAnterior.disabled = paginaAtual <= 1;
  btnProxima.disabled = paginaAtual >= totalPaginas;
}

// Evita uma requisição a cada tecla digitada
function debounce(funcao, atraso = 400) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcao(...args), atraso);
  };
}

campoBusca.addEventListener("input", debounce(() => buscarPersonagens(1)));
filtroStatus.addEventListener("change", () => buscarPersonagens(1));
btnAnterior.addEventListener("click", () => buscarPersonagens(paginaAtual - 1));
btnProxima.addEventListener("click", () => buscarPersonagens(paginaAtual + 1));
btnFavoritos.addEventListener("click", () => {
  mostrarSoFavoritos = !mostrarSoFavoritos;
  btnFavoritos.setAttribute("aria-pressed", String(mostrarSoFavoritos));
  renderizarCards();
});

// Carga inicial
buscarPersonagens(1);

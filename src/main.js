import './style.css'
import { supabase } from './lib/supabase.js'

const whatsapp = '5535984258711'

const categorias = [
  'Buquês de borboletas',
  'Buquês de rosas',
  'Cestas',
  'Cestas de chocolate',
  'Aniversário',
  'Outros'
]

let produtos = []
let carrinho = []
let categoriaAtual = 'Todas'

const estilo = document.createElement('style')

estilo.textContent = `
.categorias-lista button.ativo {
  background: #781c42;
  color: white;
}

.produto-card .campos-produto {
  padding: 0 18px 18px;
  display: grid;
  gap: 10px;
}

.campos-produto label {
  font-size: 13px;
  color: #781c42;
  font-weight: 700;
}

.campos-produto input,
.campos-produto textarea,
.finalizar-carrinho input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e7a5bf;
  border-radius: 9px;
  font: inherit;
  background: white;
  box-sizing: border-box;
}

.campos-produto textarea {
  min-height: 58px;
  resize: vertical;
}

.grupo-opcao {
  border: 1px solid #f0c7d8;
  padding: 12px;
  border-radius: 10px;
  background: #fff9fc;
}

.grupo-opcao-titulo {
  display: block;
  margin-bottom: 9px;
  color: #781c42;
  font-weight: 700;
}

.opcao-alternativa {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 7px 0;
  font-weight: 400 !important;
  color: #704257 !important;
}

.opcao-alternativa input {
  width: auto;
  accent-color: #a3295e;
}

.botao-produto {
  width: 100%;
  border: 0;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.prazo {
  font-size: 13px;
  color: #8b5269;
  margin: 8px 0;
}

.carrinho-topo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.botao-carrinho {
  border: 0;
  border-radius: 25px;
  background: #781c42;
  color: white;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 700;
}

.carrinho {
  max-width: 900px;
  margin: 0 auto 45px;
  padding: 25px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 5px 20px #0000000b;
}

.item-carrinho {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 14px 0;
  border-bottom: 1px solid #f1d8e3;
  align-items: center;
}

.item-carrinho small {
  display: block;
  color: #85536a;
  margin-top: 4px;
}

.item-carrinho button {
  border: 0;
  background: #fff0f5;
  color: #a3295e;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.finalizar-carrinho {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}

.finalizar-carrinho label {
  font-size: 13px;
  font-weight: 700;
  color: #781c42;
}

.finalizar-carrinho .campo {
  display: grid;
  gap: 6px;
}

.finalizar-carrinho .largura-total {
  grid-column: 1 / -1;
}

.carrinho-vazio {
  color: #85536a;
  text-align: center;
  padding: 18px;
}

@media(max-width:600px) {
  .finalizar-carrinho {
    grid-template-columns: 1fr;
  }

  .finalizar-carrinho .largura-total {
    grid-column: auto;
  }

  .item-carrinho {
    align-items: flex-start;
  }
}
`

document.head.appendChild(estilo)

document.querySelector('#app').innerHTML = `
<header>
  <a href="#inicio" class="marca-mtk">
    <img src="/logo_mtk_butterfly_redonda.png" alt="Logo MTK Butterfly">
    <span>MTK Butterfly</span>
  </a>

  <nav>
    <a href="#inicio">Início</a>
    <a href="#categorias">Categorias</a>
    <a href="#produtos">Produtos</a>
    <a href="#contato">Contato</a>
  </nav>

  <div class="carrinho-topo">
    <button class="botao-carrinho" id="ir-carrinho">
      🛒 Carrinho (<span id="total-itens">0</span>)
    </button>
  </div>
</header>

<main>
  <section class="categorias" id="categorias">
    <p class="subtitulo">ENCONTRE O PRESENTE IDEAL</p>
    <h2>O que você procura?</h2>
    <div class="categorias-lista" id="lista-categorias"></div>
  </section>

  <section class="produtos" id="produtos">
    <p class="subtitulo">FEITO ESPECIALMENTE PARA VOCÊ</p>
    <h2 id="titulo-produtos">Nossos produtos</h2>
    <div class="grade-produtos" id="lista-produtos">
      <p>Carregando produtos...</p>
    </div>
  </section>

  <section class="carrinho" id="carrinho">
    <h2>🛒 Meu carrinho</h2>
    <div id="itens-carrinho" class="carrinho-vazio">
      Seu carrinho está vazio. Escolha seus presentes favoritos!
    </div>
    <div id="resumo-carrinho"></div>
  </section>

  <section class="contato" id="contato">
    <h2>Um presente especial começa aqui!</h2>
    <p>Fale com a gente e tire suas dúvidas pelo WhatsApp.</p>
    <a href="https://wa.me/${whatsapp}" target="_blank" rel="noopener">
      Conversar pelo WhatsApp
    </a>
  </section>
</main>

<footer>
  <div class="marca-rodape">🦋 MTK Butterfly</div>
  <p>Presentes personalizados feitos com amor. 🦋</p>
  <p class="creditos">
    Desenvolvido por Kátia Tamaishi Mezete.
    © 2026 — Todos os direitos reservados.
  </p>
</footer>

<a class="whatsapp-flutuante"
   href="https://wa.me/${whatsapp}"
   target="_blank"
   rel="noopener">
  WhatsApp
</a>
`

function escaparHTML(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]))
}

function formatarPreco(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',')
}

function obterOpcoes(produto) {
  const opcoes = Array.isArray(produto.opcoes_personalizadas)
    ? produto.opcoes_personalizadas
    : []

  if (opcoes.length) {
    return opcoes
  }

  // Compatibilidade com produtos antigos que possuem apenas cores.
  if (Array.isArray(produto.cores) && produto.cores.length) {
    return [{
      nome: 'Cor',
      alternativas: produto.cores,
      obrigatoria: true,
      multipla: true
    }]
  }

  return []
}

function atualizarCategorias() {
  const el = document.querySelector('#lista-categorias')

  el.innerHTML = ['Todas', ...categorias].map(cat => `
    <button
      type="button"
      class="${categoriaAtual === cat ? 'ativo' : ''}"
      data-categoria="${escaparHTML(cat)}">
      ${cat === 'Todas' ? 'Todos os produtos' : escaparHTML(cat)}
    </button>
  `).join('')

  el.querySelectorAll('[data-categoria]').forEach(btn => {
    btn.addEventListener('click', () => {
      categoriaAtual = btn.dataset.categoria

      atualizarCategorias()

      const filtrados = categoriaAtual === 'Todas'
        ? produtos
        : produtos.filter(p => p.categoria === categoriaAtual)

      mostrarProdutos(filtrados)

      document.querySelector('#titulo-produtos').textContent =
        categoriaAtual === 'Todas' ? 'Nossos produtos' : categoriaAtual

      document.querySelector('#produtos').scrollIntoView({
        behavior: 'smooth'
      })
    })
  })
}

async function carregarProdutos() {
  const { data, error } = await supabase
    .from('produto')
    .select(`
      id,
      nome,
      descricao,
      preco,
      categoria,
      imagem_url,
      cores,
      prazo_producao_dias,
      opcoes_personalizadas
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    document.querySelector('#lista-produtos').innerHTML =
      '<p>Não foi possível carregar os produtos. Tente novamente mais tarde.</p>'
    return
  }

  produtos = data || []

  atualizarCategorias()
  mostrarProdutos(produtos)
}

function montarCamposOpcoes(produto) {
  const grupos = obterOpcoes(produto)

  return grupos.map((grupo, indice) => {
    const alternativas = Array.isArray(grupo.alternativas)
      ? grupo.alternativas
      : []

    if (!alternativas.length) return ''

    return `
      <div class="grupo-opcao"
           data-grupo-opcao="${indice}">

        <span class="grupo-opcao-titulo">
          ${escaparHTML(grupo.nome)}
          ${grupo.obrigatoria ? '*' : '(opcional)'}
        </span>

        ${alternativas.map(alternativa => `
          <label class="opcao-alternativa">
            <input
              type="checkbox"
              data-indice-grupo="${indice}"
              value="${escaparHTML(alternativa)}">
            ${escaparHTML(alternativa)}
          </label>
        `).join('')}

      </div>
    `
  }).join('')
}

function mostrarProdutos(lista) {
  const container = document.querySelector('#lista-produtos')

  if (!lista.length) {
    container.innerHTML = '<p>Nenhum produto nesta categoria no momento.</p>'
    return
  }

  container.innerHTML = lista.map(p => `
    <article class="produto-card" data-produto="${p.id}">

      <img
        src="${escaparHTML(p.imagem_url || 'https://placehold.co/500x600?text=MTK+Butterfly')}"
        alt="${escaparHTML(p.nome)}">

      <div class="produto-info">
        <span class="categoria-produto">
          ${escaparHTML(p.categoria || 'Outros')}
        </span>

        <h3>${escaparHTML(p.nome)}</h3>

        <p>${escaparHTML(p.descricao || '')}</p>

        <p class="prazo">
          ⏳ Prazo de produção:
          ${Number(p.prazo_producao_dias || 0)} dia(s)
        </p>

        <p class="preco">
          R$ ${formatarPreco(p.preco)}
        </p>
      </div>

      <div class="campos-produto">

        ${montarCamposOpcoes(p)}

        <label>Quantidade</label>

        <input
          class="qtd-produto"
          type="number"
          min="1"
          step="1"
          value="1">

        <label>Personalização / observações</label>

        <textarea
          class="obs-produto"
          placeholder="Conte como deseja seu presente (opcional)">
        </textarea>

        <button
          type="button"
          class="botao-produto"
          data-adicionar="${p.id}">
          Adicionar ao carrinho
        </button>

      </div>
    </article>
  `).join('')

  container.querySelectorAll('[data-adicionar]').forEach(btn => {
    btn.addEventListener('click', () => {
      adicionarAoCarrinho(Number(btn.dataset.adicionar))
    })
  })
}

function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => Number(p.id) === id)

  if (!produto) return

  const card = document.querySelector(
    `.produto-card[data-produto="${id}"]`
  )

  const quantidade = Number(
    card.querySelector('.qtd-produto').value
  )

  const observacoes = card.querySelector('.obs-produto').value.trim()

  if (!Number.isInteger(quantidade) || quantidade < 1) {
    alert('Informe uma quantidade válida.')
    return
  }

  const grupos = obterOpcoes(produto)
  const opcoesSelecionadas = []

  for (let indice = 0; indice < grupos.length; indice++) {
    const grupo = grupos[indice]

    const marcadas = [
      ...card.querySelectorAll(
        `input[data-indice-grupo="${indice}"]:checked`
      )
    ].map(input => input.value)

    if (grupo.obrigatoria && marcadas.length === 0) {
      alert(`Escolha pelo menos uma opção em: ${grupo.nome}.`)
      return
    }

    if (marcadas.length) {
      opcoesSelecionadas.push({
        nome: grupo.nome,
        valores: marcadas
      })
    }
  }

  carrinho.push({
    id: produto.id,
    nome: produto.nome,
    preco: Number(produto.preco),
    quantidade,
    opcoes: opcoesSelecionadas,
    observacoes,
    prazo: Number(produto.prazo_producao_dias || 0)
  })

  atualizarCarrinho()

  alert('Produto adicionado ao carrinho! 🦋')
}

function atualizarCarrinho() {
  document.querySelector('#total-itens').textContent =
    carrinho.reduce((soma, item) => soma + item.quantidade, 0)

  const itens = document.querySelector('#itens-carrinho')
  const resumo = document.querySelector('#resumo-carrinho')

  if (!carrinho.length) {
    itens.className = 'carrinho-vazio'
    itens.textContent =
      'Seu carrinho está vazio. Escolha seus presentes favoritos!'
    resumo.innerHTML = ''
    return
  }

  itens.className = ''

  itens.innerHTML = carrinho.map((item, indice) => {
    const textoOpcoes = item.opcoes.map(opcao =>
      `${escaparHTML(opcao.nome)}: ${opcao.valores.map(escaparHTML).join(', ')}`
    ).join('<br>')

    return `
      <div class="item-carrinho">

        <div>
          <strong>${escaparHTML(item.nome)}</strong>

          <small>
            Quantidade: ${item.quantidade}
            ${textoOpcoes ? `<br>${textoOpcoes}` : ''}
            <br>${item.prazo} dia(s) de produção

            ${item.observacoes
              ? `<br>Observações: ${escaparHTML(item.observacoes)}`
              : ''}
          </small>

          <strong>
            R$ ${formatarPreco(item.preco * item.quantidade)}
          </strong>
        </div>

        <button type="button" data-remover="${indice}">
          Remover
        </button>

      </div>
    `
  }).join('')

  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  )

  resumo.innerHTML = `
    <p class="preco">
      Total estimado: R$ ${formatarPreco(total)}
    </p>

    <div class="finalizar-carrinho">

      <div class="campo">
        <label for="data-desejada">Para qual dia deseja?</label>
        <input
          id="data-desejada"
          type="date"
          min="${new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)}">
      </div>

      <div class="campo">
        <label for="nome-cliente">Seu nome (opcional)</label>
        <input
          id="nome-cliente"
          type="text"
          placeholder="Como podemos te chamar?">
      </div>

      <div class="campo largura-total">
        <label for="obs-geral">Observações do pedido (opcional)</label>
        <input
          id="obs-geral"
          type="text"
          placeholder="Mais algum detalhe?">
      </div>

      <button
        type="button"
        class="botao-principal largura-total"
        id="finalizar-whatsapp">
        Enviar carrinho pelo WhatsApp
      </button>

    </div>

    <p class="prazo">
      Os prazos são estimativas de produção.
      A data e a disponibilidade serão confirmadas diretamente pelo WhatsApp.
    </p>
  `

  itens.querySelectorAll('[data-remover]').forEach(btn => {
    btn.addEventListener('click', () => {
      carrinho.splice(Number(btn.dataset.remover), 1)
      atualizarCarrinho()
    })
  })

  document.querySelector('#finalizar-whatsapp')
    .addEventListener('click', finalizarWhatsApp)
}

function finalizarWhatsApp() {
  if (!carrinho.length) return

  const data = document.querySelector('#data-desejada').value
  const nome = document.querySelector('#nome-cliente').value.trim()
  const observacoesGerais = document.querySelector('#obs-geral').value.trim()

  if (!data) {
    alert('Informe a data em que deseja receber seu pedido.')
    return
  }

  const dataFormatada = new Date(`${data}T12:00:00`)
    .toLocaleDateString('pt-BR')

  const linhas = carrinho.map((item, indice) => {
    const opcoesTexto = item.opcoes.map(opcao =>
      `   ${opcao.nome}: ${opcao.valores.join(', ')}`
    ).join('\n')

    return `
${indice + 1}. ${item.nome}
   Quantidade: ${item.quantidade}
${opcoesTexto}
   Valor: R$ ${formatarPreco(item.preco * item.quantidade)}
   Prazo cadastrado: ${item.prazo} dia(s)
   ${item.observacoes ? `Personalização: ${item.observacoes}` : ''}
    `.trim()
  }).join('\n\n')

  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  )

  const mensagem = `
== Olá! Vim pelo site da MTK Butterfly e gostaria de fazer uma encomenda. ===

${nome ? `Nome: ${nome}\n` : ''}
PRODUTOS:

${linhas}

Total estimado: R$ ${formatarPreco(total)}
Data desejada: ${dataFormatada}
${observacoesGerais ? `Observações gerais: ${observacoesGerais}` : ''}

Podemos confirmar a disponibilidade e os detalhes?
  `.trim()

  window.open(
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`,
    '_blank',
    'noopener'
  )
}

document.querySelector('#ir-carrinho').addEventListener('click', () => {
  document.querySelector('#carrinho').scrollIntoView({
    behavior: 'smooth'
  })
})

carregarProdutos()

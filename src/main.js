import './style.css'
import { supabase } from './lib/supabase.js'

const whatsapp = '5535984258711'
const categorias = ['Buquês de borboletas', 'Buquês de rosas', 'Cestas', 'Aniversário', 'Outros']
let produtos = []
let carrinho = []
let categoriaAtual = 'Todas'

const estilo = document.createElement('style')
estilo.textContent = `
.categorias-lista button.ativo{background:#781c42;color:#fff}
.produto-card .campos-produto{padding:0 18px 18px;display:grid;gap:9px}
.campos-produto label{font-size:13px;color:#781c42;font-weight:700}
.campos-produto input,.campos-produto select,.campos-produto textarea,.finalizar-carrinho input{width:100%;padding:10px;border:1px solid #e7a5bf;border-radius:9px;font:inherit;background:#fff}
.campos-produto textarea{min-height:58px;resize:vertical}
.botao-produto{width:100%;border:0;cursor:pointer;font:inherit;font-weight:700}
.prazo{font-size:13px;color:#8b5269;margin:8px 0}
.carrinho-topo{display:flex;align-items:center;gap:10px}
.botao-carrinho{border:0;border-radius:25px;background:#781c42;color:white;padding:12px 18px;cursor:pointer;font-weight:700}
.carrinho{max-width:900px;margin:0 auto 45px;padding:25px;background:white;border-radius:18px;box-shadow:0 5px 20px #0000000b}
.item-carrinho{display:flex;justify-content:space-between;gap:15px;padding:14px 0;border-bottom:1px solid #f1d8e3;align-items:center}
.item-carrinho small{display:block;color:#85536a;margin-top:4px}
.item-carrinho button{border:0;background:#fff0f5;color:#a3295e;padding:8px 12px;border-radius:8px;cursor:pointer}
.finalizar-carrinho{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
.finalizar-carrinho label{font-size:13px;font-weight:700;color:#781c42}
.finalizar-carrinho .campo{display:grid;gap:6px}
.finalizar-carrinho .largura-total{grid-column:1/-1}
.carrinho-vazio{color:#85536a;text-align:center;padding:18px}
@media(max-width:600px){.finalizar-carrinho{grid-template-columns:1fr}.finalizar-carrinho .largura-total{grid-column:auto}.item-carrinho{align-items:flex-start}}
`
document.head.appendChild(estilo)

document.querySelector('#app').innerHTML = `
<header>
 <a href="#inicio" class="marca-mtk">
  <img src="/logo_mtk_butterfly_redonda.png" alt="Logo MTK Butterfly">
  <span>MTK Butterfly</span>
</a>
  <nav><a href="#inicio">Início</a><a href="#categorias">Categorias</a><a href="#produtos">Produtos</a><a href="#contato">Contato</a></nav>
  <div class="carrinho-topo"><button class="botao-carrinho" id="ir-carrinho">🛒 Carrinho (<span id="total-itens">0</span>)</button></div>
</header>
<main>
</section>
<section class="categorias" id="categorias"><p class="subtitulo">ENCONTRE O PRESENTE IDEAL</p><h2>O que você procura?</h2><div class="categorias-lista" id="lista-categorias"></div></section>
<section class="produtos" id="produtos"><p class="subtitulo">FEITO ESPECIALMENTE PARA VOCÊ</p><h2 id="titulo-produtos">Nossos produtos</h2><div class="grade-produtos" id="lista-produtos"><p>Carregando produtos...</p></div></section>
<section class="carrinho" id="carrinho"><h2>🛒 Meu carrinho</h2><div id="itens-carrinho" class="carrinho-vazio">Seu carrinho está vazio. Escolha seus presentes favoritos!</div><div id="resumo-carrinho"></div></section>
<section class="contato" id="contato"><h2>Um presente especial começa aqui!</h2><p>Fale com a gente e tire suas dúvidas pelo WhatsApp.</p><a href="https://wa.me/${whatsapp}" target="_blank" rel="noopener">Conversar pelo WhatsApp</a></section>
</main>
<footer><div class="marca-rodape">🦋 MTK Butterfly</div><p>Presentes personalizados feitos com amor. 🦋</p><p class="creditos">Desenvolvido por Kátia Tamaishi Mezete. © 2026 — Todos os direitos reservados.</p></footer>
<a class="whatsapp-flutuante" href="https://wa.me/${whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`

function escaparHTML(texto) { return String(texto ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }
function formatarPreco(valor) { return Number(valor || 0).toFixed(2).replace('.', ',') }
function atualizarCategorias() {
  const el = document.querySelector('#lista-categorias')
  el.innerHTML = ['Todas', ...categorias].map(cat => `<button type="button" class="${categoriaAtual === cat ? 'ativo' : ''}" data-categoria="${escaparHTML(cat)}">${cat === 'Todas' ? 'Todos os produtos' : escaparHTML(cat)}</button>`).join('')
  el.querySelectorAll('[data-categoria]').forEach(btn => btn.addEventListener('click', () => {
    categoriaAtual = btn.dataset.categoria
    atualizarCategorias()
    mostrarProdutos(categoriaAtual === 'Todas' ? produtos : produtos.filter(p => p.categoria === categoriaAtual))
    document.querySelector('#titulo-produtos').textContent = categoriaAtual === 'Todas' ? 'Nossos produtos' : categoriaAtual
    document.querySelector('#produtos').scrollIntoView({behavior:'smooth'})
  }))
}
async function carregarProdutos() {
  const {data,error} = await supabase.from('produto').select('id,nome,descricao,preco,categoria,imagem_url,cores,prazo_producao_dias').order('created_at',{ascending:false})
  if (error) { console.error(error); document.querySelector('#lista-produtos').innerHTML = '<p>Não foi possível carregar os produtos. Tente novamente mais tarde.</p>'; return }
  produtos = data || []
  atualizarCategorias()
  mostrarProdutos(produtos)
}
function mostrarProdutos(lista) {
  const container = document.querySelector('#lista-produtos')
  if (!lista.length) { container.innerHTML = '<p>Nenhum produto nesta categoria no momento.</p>'; return }
  container.innerHTML = lista.map(p => {
    const cores = Array.isArray(p.cores) ? p.cores : []
    const opcoesCor = cores.length ? `<option value="">Escolha a cor</option>${cores.map(c=>`<option value="${escaparHTML(c)}">${escaparHTML(c)}</option>`).join('')}` : '<option value="">A combinar</option>'
    return `<article class="produto-card"><img src="${escaparHTML(p.imagem_url || 'https://placehold.co/500x600?text=MTK+Butterfly')}" alt="${escaparHTML(p.nome)}"><div class="produto-info"><span class="categoria-produto">${escaparHTML(p.categoria || 'Outros')}</span><h3>${escaparHTML(p.nome)}</h3><p>${escaparHTML(p.descricao || '')}</p><p class="prazo">⏳ Prazo de produção: ${Number(p.prazo_producao_dias || 0)} dia(s)</p><p class="preco">R$ ${formatarPreco(p.preco)}</p></div><div class="campos-produto"><label>Cor desejada</label><select class="cor-produto" data-cor="${p.id}">${opcoesCor}</select><label>Quantidade</label><input class="qtd-produto" data-qtd="${p.id}" type="number" min="1" step="1" value="1"><label>Personalização / observações</label><textarea class="obs-produto" data-obs="${p.id}" placeholder="Conte como deseja seu presente (opcional)"></textarea><button type="button" class="botao-produto" data-adicionar="${p.id}">Adicionar ao carrinho</button></div></article>`
  }).join('')
  container.querySelectorAll('[data-adicionar]').forEach(btn => btn.addEventListener('click', () => adicionarAoCarrinho(Number(btn.dataset.adicionar))))
}
function adicionarAoCarrinho(id) {
  const p = produtos.find(item => Number(item.id) === id)
  if (!p) return
  const qtd = Number(document.querySelector(`[data-qtd="${id}"]`).value)
  const cor = document.querySelector(`[data-cor="${id}"]`).value
  const obs = document.querySelector(`[data-obs="${id}"]`).value.trim()
  if (!Number.isInteger(qtd) || qtd < 1) { alert('Informe uma quantidade válida.'); return }
  if (Array.isArray(p.cores) && p.cores.length && !cor) { alert('Escolha a cor desejada.'); return }
  carrinho.push({id:p.id,nome:p.nome,preco:Number(p.preco),quantidade:qtd,cor:cor || 'A combinar',observacoes:obs,prazo:Number(p.prazo_producao_dias || 0)})
  atualizarCarrinho()
  alert('Produto adicionado ao carrinho! 🦋')
}
function atualizarCarrinho() {
  document.querySelector('#total-itens').textContent = carrinho.reduce((s,i)=>s+i.quantidade,0)
  const itens = document.querySelector('#itens-carrinho')
  const resumo = document.querySelector('#resumo-carrinho')
  if (!carrinho.length) { itens.className='carrinho-vazio'; itens.textContent='Seu carrinho está vazio. Escolha seus presentes favoritos!'; resumo.innerHTML=''; return }
  itens.className=''
  itens.innerHTML = carrinho.map((i,index)=>`<div class="item-carrinho"><div><strong>${escaparHTML(i.nome)}</strong><small>Quantidade: ${i.quantidade} · Cor: ${escaparHTML(i.cor)} · ${i.prazo} dia(s) de produção${i.observacoes ? `<br>Observações: ${escaparHTML(i.observacoes)}` : ''}</small><strong>R$ ${formatarPreco(i.preco*i.quantidade)}</strong></div><button type="button" data-remover="${index}">Remover</button></div>`).join('')
  resumo.innerHTML = `<p class="preco">Total estimado: R$ ${formatarPreco(carrinho.reduce((s,i)=>s+i.preco*i.quantidade,0))}</p><div class="finalizar-carrinho"><div class="campo"><label for="data-desejada">Para qual dia deseja?</label><input id="data-desejada" type="date" min="${new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10)}"></div><div class="campo"><label for="nome-cliente">Seu nome (opcional)</label><input id="nome-cliente" type="text" placeholder="Como podemos te chamar?"></div><div class="campo largura-total"><label for="obs-geral">Observações do pedido (opcional)</label><input id="obs-geral" type="text" placeholder="Mais algum detalhe?"></div><button type="button" class="botao-principal largura-total" id="finalizar-whatsapp">Enviar carrinho pelo WhatsApp</button></div><p class="prazo">Os prazos são estimativas de produção. A data e a disponibilidade serão confirmadas diretamente pelo WhatsApp.</p>`
  itens.querySelectorAll('[data-remover]').forEach(btn=>btn.addEventListener('click',()=>{carrinho.splice(Number(btn.dataset.remover),1);atualizarCarrinho()}))
  document.querySelector('#finalizar-whatsapp').addEventListener('click', finalizarWhatsApp)
}
function finalizarWhatsApp() {
  if (!carrinho.length) return
  const data = document.querySelector('#data-desejada').value
  const nome = document.querySelector('#nome-cliente').value.trim()
  const obs = document.querySelector('#obs-geral').value.trim()
  if (!data) { alert('Informe a data em que deseja receber seu pedido.'); return }
  const dataFormatada = new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')
  const linhas = carrinho.map((i,n)=>`${n+1}. ${i.nome}\n   Quantidade: ${i.quantidade}\n   Cor: ${i.cor}\n   Valor: R$ ${formatarPreco(i.preco*i.quantidade)}\n   Prazo cadastrado: ${i.prazo} dia(s)${i.observacoes ? `\n   Personalização: ${i.observacoes}` : ''}`).join('\n\n')
  const total = carrinho.reduce((s,i)=>s+i.preco*i.quantidade,0)
  const mensagem = `== Olá! Vim pelo site da MTK Butterfly e gostaria de fazer uma encomenda. === \n\n${nome ? `Nome: ${nome}\n` : ''}Produtos:\n${linhas}\n\nTotal estimado: R$ ${formatarPreco(total)}\nData desejada: ${dataFormatada}${obs ? `\nObservações gerais: ${obs}` : ''}\n\nPodemos confirmar a disponibilidade e os detalhes?`
  window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`,'_blank','noopener')
}
document.querySelector('#ir-carrinho').addEventListener('click',()=>document.querySelector('#carrinho').scrollIntoView({behavior:'smooth'}))
carregarProdutos()

import { supabase } from './lib/supabase.js'

const app = document.querySelector('#admin-app')

let produtoEditando = null

// ==========================================
// ESTILIZAÇÃO
// ==========================================

const estilo = document.createElement('style')

estilo.textContent = `
* { box-sizing: border-box; }

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #fff0f5;
    color: #444;
}

.painel {
    min-height: 100vh;
    padding: 30px 15px;
}

.container {
    max-width: 950px;
    margin: auto;
}

.cabecalho {
    background: white;
    padding: 25px;
    border-radius: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    box-shadow: 0 4px 15px #d98ba822;
}

h1, h2 { color: #d63384; }

.cabecalho h1 {
    margin: 0;
    font-size: 24px;
}

.cabecalho p {
    margin-bottom: 0;
    color: #777;
}

.cartao {
    background: white;
    padding: 30px;
    border-radius: 18px;
    margin-bottom: 25px;
    box-shadow: 0 4px 15px #d98ba822;
}

label {
    display: block;
    margin: 16px 0 7px;
    font-weight: bold;
}

input, textarea, select {
    width: 100%;
    padding: 13px;
    border: 1px solid #efb4cf;
    border-radius: 9px;
    font-size: 15px;
}

textarea {
    resize: vertical;
    min-height: 85px;
}

.botao {
    padding: 13px 20px;
    background: #d63384;
    color: white;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    font-size: 15px;
}

.botao:hover { background: #b8256c; }
.botao:disabled { opacity: .6; cursor: wait; }

.botao-secundario { background: #777; }
.botao-excluir { background: #b52d55; }
.botao-sair { background: #777; }
.botao-editar { background: #d63384; }

.linha-tamanho {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 10px;
    margin: 10px 0;
}

.linha-tamanho input { min-width: 0; }

#mensagem, #mensagem-produto {
    margin-top: 15px;
    color: #d63384;
    font-weight: bold;
}

.produto-admin {
    border: 1px solid #f1c5d9;
    border-radius: 12px;
    padding: 15px;
    margin-top: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.produto-admin img {
    width: 85px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
}

.produto-admin-info { flex: 1; }
.produto-admin-info h3 { margin: 0 0 8px; }

.acoes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.link-recuperacao {
    background: none;
    border: none;
    color: #d63384;
    cursor: pointer;
    margin-top: 18px;
    font-size: 14px;
    text-decoration: underline;
}

.link-recuperacao:hover {
    color: #b8256c;
}

@media (max-width: 600px) {
    .cabecalho {
        align-items: flex-start;
        flex-direction: column;
    }

    .cartao { padding: 20px; }

    .produto-admin {
        align-items: flex-start;
        flex-wrap: wrap;
    }
}
`

document.head.appendChild(estilo)


// ==========================================
// VERIFICA SE É ADMINISTRADOR
// ==========================================

async function verificarAdministrador(usuario) {
    const { data, error } = await supabase
        .from('administradores')
        .select('user_id')
        .eq('user_id', usuario.id)
        .maybeSingle()

    if (error || !data) {
        await supabase.auth.signOut()

        mostrarLogin(
            'Você não tem permissão para acessar este painel.'
        )

        return
    }

    mostrarPainel()
}


// ==========================================
// TELA DE LOGIN
// ==========================================

function mostrarLogin(texto = '') {
    app.innerHTML = `
        <div class="painel">
            <div class="container">

                <div class="cartao"
                    style="max-width:420px;margin:100px auto;text-align:center">

                    <h1>MTK BUTTERFLY</h1>

                    <p>Área exclusiva do administrador</p>

                    <form id="form-login">

                        <label>E-mail</label>

                        <input
                            type="email"
                            id="email"
                            required
                        >

                        <label>Senha</label>

                        <input
                            type="password"
                            id="senha"
                            required
                        >

                        <br><br>

                        <button class="botao" type="submit">
                            Entrar no painel
                        </button>

                    </form>

                    <button
                        type="button"
                        class="link-recuperacao"
                        id="esqueci-senha"
                    >
                        Esqueci minha senha
                    </button>

                    <div id="mensagem">${escaparHTML(texto)}</div>

                </div>
            </div>
        </div>
    `

    document
        .querySelector('#form-login')
        .addEventListener('submit', entrar)

    document
        .querySelector('#esqueci-senha')
        .addEventListener('click', solicitarRecuperacao)
}


// ==========================================
// SOLICITAR RECUPERAÇÃO DE SENHA
// ==========================================

async function solicitarRecuperacao() {
    const email = document
        .querySelector('#email')
        .value
        .trim()

    const mensagem = document.querySelector('#mensagem')
    const botao = document.querySelector('#esqueci-senha')

    if (!email) {
        mensagem.textContent = 'Digite seu e-mail primeiro.'
        return
    }

    botao.disabled = true

    mensagem.textContent = 'Enviando e-mail de recuperação...'

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: `${window.location.origin}/admin.html?recuperar=1`
            }
        )

        if (error) {
            throw error
        }

        mensagem.textContent =
            'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada.'

    } catch (erro) {
        console.error(erro)

        mensagem.textContent =
            'Não foi possível enviar o e-mail: ' + erro.message

    } finally {
        botao.disabled = false
    }
}


// ==========================================
// TELA PARA CADASTRAR NOVA SENHA
// ==========================================

function mostrarRedefinirSenha(texto = '') {
    app.innerHTML = `
        <div class="painel">
            <div class="container">

                <div class="cartao"
                    style="max-width:420px;margin:100px auto;text-align:center">

                    <h1>MTK BUTTERFLY</h1>

                    <p>Cadastre sua nova senha</p>

                    <form id="form-nova-senha">

                        <label>Nova senha</label>

                        <input
                            type="password"
                            id="nova-senha"
                            minlength="6"
                            required
                        >

                        <label>Confirme a nova senha</label>

                        <input
                            type="password"
                            id="confirmar-senha"
                            minlength="6"
                            required
                        >

                        <br><br>

                        <button
                            class="botao"
                            type="submit"
                            id="botao-nova-senha"
                        >
                            Salvar nova senha
                        </button>

                    </form>

                    <div id="mensagem">${escaparHTML(texto)}</div>

                </div>
            </div>
        </div>
    `

    document
        .querySelector('#form-nova-senha')
        .addEventListener('submit', salvarNovaSenha)
}


// ==========================================
// SALVAR NOVA SENHA
// ==========================================

async function salvarNovaSenha(evento) {
    evento.preventDefault()

    const senha = document.querySelector('#nova-senha').value
    const confirmacao = document.querySelector('#confirmar-senha').value

    const mensagem = document.querySelector('#mensagem')
    const botao = document.querySelector('#botao-nova-senha')

    if (senha.length < 6) {
        mensagem.textContent =
            'A senha precisa ter pelo menos 6 caracteres.'

        return
    }

    if (senha !== confirmacao) {
        mensagem.textContent = 'As senhas não são iguais.'
        return
    }

    botao.disabled = true

    mensagem.textContent = 'Atualizando sua senha...'

    try {
        const { error } = await supabase.auth.updateUser({
            password: senha
        })

        if (error) {
            throw error
        }

        await supabase.auth.signOut()

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        )

        mostrarLogin(
            'Senha alterada com sucesso! Agora entre com sua nova senha. ❤️'
        )

    } catch (erro) {
        console.error(erro)

        mensagem.textContent =
            'Não foi possível alterar a senha: ' + erro.message

        botao.disabled = false
    }
}


// ==========================================
// LOGIN
// ==========================================

async function entrar(evento) {
    evento.preventDefault()

    const email = document.querySelector('#email').value.trim()
    const senha = document.querySelector('#senha').value

    const mensagem = document.querySelector('#mensagem')

    mensagem.textContent = 'Verificando acesso...'

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
    })

    if (error) {
        mensagem.textContent = 'E-mail ou senha incorretos.'
        return
    }

    await verificarAdministrador(data.user)
}


// ==========================================
// PAINEL ADMINISTRATIVO
// ==========================================

function mostrarPainel() {
    produtoEditando = null

    app.innerHTML = `
        <div class="painel">
            <div class="container">

                <header class="cabecalho">

                    <div>
                        <h1>MTK BUTTERFLY</h1>
                        <p>Gerencie os produtos da sua vitrine virtual</p>
                    </div>

                    <button class="botao botao-sair" id="sair">
                        Sair
                    </button>

                </header>

                <section class="cartao">

                    <h2 id="titulo-formulario">
                        Cadastrar produto
                    </h2>

                    <form id="form-produto">

                        <label>Nome do produto</label>
                        <input type="text" id="nome" required>

                        <label>Descrição</label>
                        <textarea id="descricao"></textarea>

                        <label>Preço (R$)</label>
                        <input
                            type="number"
                            id="preco"
                            min="0.01"
                            step="0.01"
                            required
                        >

                        <label>Categoria</label>

                        <select id="categoria" required>
                            <option value="">Selecione</option>
                            <option value="Buquês de borboletas">Buquês de borboletas</option>
                            <option value="Buquês de rosas">Buquês de rosas</option>
                            <option value="Cestas">Cestas</option>
                            <option value="Cestas de chocolate">Cestas de chocolate</option>
                            <option value="Aniversário">Aniversário</option>
                            <option value="Outros">Outros</option>
                        </select>

                        <label>Foto do produto</label>

                        <input
                            type="file"
                            id="imagem"
                            accept="image/*"
                        >

                        <p id="aviso-imagem">
                            Selecione uma foto para o produto.
                        </p>

                        <label for="cores">Cores disponíveis</label>
                        <input
                            type="text"
                            id="cores"
                            placeholder="Ex.: Azul, rosa, branco, vermelho"
                        >
                        <small>Separe as cores por vírgula. Se deixar vazio, o cliente poderá combinar a cor pelo WhatsApp.</small>

                        <label for="prazo-producao">Prazo de produção (dias)</label>
                        <input
                            type="number"
                            id="prazo-producao"
                            min="0"
                            step="1"
                            value="3"
                            required
                        >

                        <br><br>

                        <button
                            type="submit"
                            class="botao"
                            id="salvar-produto"
                        >
                            Cadastrar produto
                        </button>

                        <button
                            type="button"
                            class="botao botao-secundario"
                            id="cancelar-edicao"
                            hidden
                        >
                            Cancelar edição
                        </button>

                        <div id="mensagem-produto"></div>

                    </form>

                </section>

                <section class="cartao">

                    <h2>Produtos cadastrados</h2>

                    <div id="produtos-cadastrados">
                        Carregando produtos...
                    </div>

                </section>

            </div>
        </div>
    `

    document
        .querySelector('#sair')
        .addEventListener('click', sair)

    document
        .querySelector('#form-produto')
        .addEventListener('submit', salvarProduto)

    document
        .querySelector('#cancelar-edicao')
        .addEventListener('click', cancelarEdicao)

    carregarProdutosAdmin()
}


// ==========================================
// UPLOAD DA IMAGEM
// ==========================================

async function enviarImagem(arquivo) {
    const extensao = arquivo.name.split('.').pop()

    const nomeArquivo = `${crypto.randomUUID()}.${extensao}`

    const caminho = `produtos/${nomeArquivo}`

    const { error } = await supabase.storage
        .from('imagens-produtos')
        .upload(caminho, arquivo)

    if (error) throw error

    const { data } = supabase.storage
        .from('imagens-produtos')
        .getPublicUrl(caminho)

    return data.publicUrl
}


// ==========================================
// SALVAR OU EDITAR PRODUTO
// ==========================================

async function salvarProduto(evento) {
    evento.preventDefault()

    const mensagem = document.querySelector('#mensagem-produto')

    const botao = document.querySelector('#salvar-produto')

    botao.disabled = true

    mensagem.textContent = 'Salvando...'

    try {
        const nome = document.querySelector('#nome').value.trim()

        const descricao = document
            .querySelector('#descricao')
            .value.trim()

        const preco = Number(
            document.querySelector('#preco').value
        )

        const categoria = document.querySelector('#categoria').value
        const cores = document.querySelector('#cores').value.split(',').map(c => c.trim()).filter(Boolean)
        const prazoProducao = Number(document.querySelector('#prazo-producao').value)

        if (!Number.isInteger(prazoProducao) || prazoProducao < 0) {
            throw new Error('Informe um prazo de produção válido em dias.')
        }

        const arquivo = document.querySelector('#imagem').files[0]

        let imagemUrl = produtoEditando?.imagem_url || null

        if (arquivo) {
            imagemUrl = await enviarImagem(arquivo)
        }

        if (produtoEditando) {
            const { error } = await supabase
                .from('produto')
                .update({
                    nome,
                    descricao,
                    preco,
                    categoria,
                    imagem_url: imagemUrl,
                    cores,
                    prazo_producao_dias: prazoProducao
                })
                .eq('id', produtoEditando.id)

            if (error) throw error

            mensagem.textContent =
                'Produto atualizado com sucesso! ❤️'

        } else {
            const { data, error } = await supabase
                .from('produto')
                .insert([{
                    nome,
                    descricao,
                    preco,
                    categoria,
                    imagem_url: imagemUrl,
                    cores,
                    prazo_producao_dias: prazoProducao
                }])
                .select()
                .single()

            if (error) throw error

            mensagem.textContent =
                'Produto cadastrado com sucesso! ❤️'
        }

        limparFormulario()

        await carregarProdutosAdmin()

    } catch (erro) {
        console.error(erro)

        mensagem.textContent = 'Erro: ' + erro.message
    }

    botao.disabled = false
}


// ==========================================
// CARREGAR PRODUTOS
// ==========================================

async function carregarProdutosAdmin() {
    const container = document.querySelector('#produtos-cadastrados')

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
            prazo_producao_dias
        `)
        .order('created_at', { ascending: false })

    if (error) {
        container.textContent =
            'Não foi possível carregar os produtos.'

        console.error(error)

        return
    }

    if (!data || data.length === 0) {
        container.textContent = 'Nenhum produto cadastrado.'
        return
    }

    container.innerHTML = data.map(produto => `
        <article class="produto-admin">

            <img
                src="${produto.imagem_url || 'https://placehold.co/100x120?text=Sem+foto'}"
                alt="Foto do produto"
            >

            <div class="produto-admin-info">

                <h3>${escaparHTML(produto.nome)}</h3>

                <p>${escaparHTML(produto.categoria || '')}</p>

                <strong>
                    R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}
                </strong>

                <p>Cores: ${escaparHTML((produto.cores || []).join(', ') || 'A combinar')}</p>
                <p>Prazo de produção: ${Number(produto.prazo_producao_dias || 0)} dia(s)</p>

                <div class="acoes">

                    <button
                        class="botao botao-editar"
                        data-editar="${produto.id}"
                    >
                        Editar
                    </button>

                    <button
                        class="botao botao-excluir"
                        data-excluir="${produto.id}"
                    >
                        Excluir
                    </button>

                </div>

            </div>

        </article>
    `).join('')

    container.querySelectorAll('[data-editar]').forEach(botao => {
        botao.addEventListener('click', () => {
            const produto = data.find(item =>
                item.id === Number(botao.dataset.editar)
            )

            editarProduto(produto)
        })
    })

    container.querySelectorAll('[data-excluir]').forEach(botao => {
        botao.addEventListener('click', () => {
            excluirProduto(Number(botao.dataset.excluir))
        })
    })
}


// ==========================================
// EDITAR PRODUTO
// ==========================================

function editarProduto(produto) {
    produtoEditando = produto

    document.querySelector('#titulo-formulario').textContent = 'Editar produto'
    document.querySelector('#nome').value = produto.nome || ''
    document.querySelector('#descricao').value = produto.descricao || ''
    document.querySelector('#preco').value = produto.preco ?? ''
    document.querySelector('#categoria').value = produto.categoria || ''
    document.querySelector('#imagem').value = ''
    document.querySelector('#aviso-imagem').textContent = 'Deixe vazio para manter a foto atual.'
    document.querySelector('#cores').value = (produto.cores || []).join(', ')
    document.querySelector('#prazo-producao').value = produto.prazo_producao_dias ?? 3

    document.querySelector('#salvar-produto').textContent = 'Salvar alterações'
    document.querySelector('#cancelar-edicao').hidden = false
    document.querySelector('#form-produto').scrollIntoView({ behavior: 'smooth' })
}


// ==========================================
// CANCELAR EDIÇÃO
// ==========================================

function cancelarEdicao() {
    limparFormulario()
}


// ==========================================
// LIMPAR FORMULÁRIO
// ==========================================

function limparFormulario() {
    produtoEditando = null

    document.querySelector('#form-produto').reset()

    document.querySelector('#titulo-formulario').textContent =
        'Cadastrar produto'

    document.querySelector('#salvar-produto').textContent =
        'Cadastrar produto'

    document.querySelector('#cancelar-edicao').hidden = true

    document.querySelector('#aviso-imagem').textContent =
        'Selecione uma foto para o produto.'

    document.querySelector('#cores').value = ''
    document.querySelector('#prazo-producao').value = 3

}


// ==========================================
// EXCLUIR PRODUTO
// ==========================================

async function excluirProduto(id) {
    const confirmar = confirm(
        'Tem certeza de que deseja excluir este produto? Essa ação não poderá ser desfeita.'
    )

    if (!confirmar) return

    const { error } = await supabase
        .from('produto')
        .delete()
        .eq('id', id)

    if (error) {
        alert(
            'Não foi possível excluir o produto: ' + error.message
        )

        console.error(error)

        return
    }

    if (produtoEditando && produtoEditando.id === id) {
        limparFormulario()
    }

    alert('Produto excluído com sucesso!')

    carregarProdutosAdmin()
}


// ==========================================
// PROTEGER TEXTOS
// ==========================================

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere])
}


// ==========================================
// SAIR DO PAINEL
// ==========================================

async function sair() {
    await supabase.auth.signOut()

    mostrarLogin()
}


// ==========================================
// INICIAR A PÁGINA
// ==========================================

async function iniciar() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
        mostrarLogin('Não foi possível verificar seu acesso.')
        return
    }

    const estaRecuperando =
        new URLSearchParams(window.location.search)
            .get('recuperar') === '1'

    if (estaRecuperando) {
        if (data.session) {
            mostrarRedefinirSenha()
        } else {
            mostrarLogin(
                'O link de recuperação expirou ou é inválido. Solicite um novo link.'
            )
        }

        return
    }

    if (data.session) {
        await verificarAdministrador(data.session.user)
    } else {
        mostrarLogin()
    }
}


// ==========================================
// DETECTAR RECUPERAÇÃO DE SENHA
// ==========================================

supabase.auth.onAuthStateChange((evento) => {
    if (evento === 'PASSWORD_RECOVERY') {
        mostrarRedefinirSenha()
    }
})


// Iniciar sistema
iniciar()
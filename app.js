// app.js

const BASE_URL = 'http://localhost:3002/api/produtos';

// MODIFICADO: Definição da variável OBRIGATÓRIA de autoria.
//            SUBSTITUA ESTA LINHA COM SEUS DADOS REAIS!
const IDENTIFICADOR_ALUNO = "Cadastrado por Nicolas Ferreira Souza - RM - 1143141726";

// --- utilidades ---
function mostrarMensagem(texto, id = 'lblMensagem') {
    const el = document.getElementById(id);
    if (el) el.textContent = texto || '';
}
function limparMensagem() { mostrarMensagem(''); mostrarMensagem('', 'lblMensagemEdicao'); }

function lerCamposDoFormulario() {
    return {
        nome_do_Produto: document.getElementById('txtNome').value.trim(),
        preco: Number(document.getElementById('txtPreco').value),
        categoria: document.getElementById('cboCategoria').value,
        estoque: Number(document.getElementById('txtEstoque').value),
        ativo: document.getElementById('chkAtivo').checked,
        // MODIFICADO: Incluindo o identificador no objeto de dados para o POST
        identificadorAluno: IDENTIFICADOR_ALUNO
    };
}

function preencherTabela(produtos) {
    const corpo = document.getElementById('corpoTabela');
    corpo.innerHTML = '';
    produtos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>R$ ${p.preco.toFixed(2)}</td>
      <td>${p.categoria}</td>
      <td>${p.estoque}</td>
      <td>${p.ativo ? 'Sim' : 'Não'}</td>
      <td>${p.identificadorAluno || 'N/A'}</td> 
      <td>
        <span class="acao">
          <button onclick="aoEditar(${p.id})">Editar</button>
          <button class="excluir" onclick="aoExcluir(${p.id})">Excluir</button>
        </span>
      </td>
    `;
        corpo.appendChild(tr);
    });
}

async function carregarProdutos() {
    const resp = await fetch(BASE_URL);
    if (!resp.ok) throw new Error('Falha ao carregar produtos.');
    const dados = await resp.json();
    preencherTabela(dados);
}

// --- onclick no HTML ---
async function aoCarregar() {
    try { limparMensagem(); await carregarProdutos(); mostrarMensagem('Lista atualizada.'); }
    catch (e) { mostrarMensagem(e.message); }
}
function aoLimpar() {
    document.getElementById('txtNome').value = '';
    document.getElementById('txtPreco').value = '';
    document.getElementById('cboCategoria').value = '';
    document.getElementById('txtEstoque').value = '';
    document.getElementById('chkAtivo').checked = true;
    limparMensagem();
}
async function aoCadastrar() {
    try {
        limparMensagem();
        // Usa a função modificada 'lerCamposDoFormulario'
        const dados = lerCamposDoFormulario();
        if (!dados.nome || !dados.categoria || isNaN(dados.preco) || isNaN(dados.estoque)) {
            mostrarMensagem('Preencha os campos corretamente.'); return;
        }
        const resp = await fetch(BASE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        const json = await resp.json();
        if (!resp.ok) { mostrarMensagem(json?.erros ? json.erros.join(' | ') : 'Erro ao cadastrar.'); return; }
        aoLimpar(); await carregarProdutos(); mostrarMensagem(`Produto #${json.id} cadastrado!`);
    } catch (e) { mostrarMensagem(e.message); }
}
async function aoExcluir(id) {
    if (!confirm(`Excluir o produto #${id}?`)) return;
    try {
        const resp = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const j = await resp.json().catch(() => null);
            throw new Error(j?.erro || 'Erro ao excluir.');
        }
        await carregarProdutos(); mostrarMensagem(`Produto #${id} excluído.`);
    } catch (e) { mostrarMensagem(e.message); }
}
async function aoEditar(id) {
    try {
        const resp = await fetch(`${BASE_URL}/${id}`);
        if (!resp.ok) throw new Error('Produto não encontrado.');
        const p = await resp.json();
        document.getElementById('secaoEdicao').style.display = 'block';
        document.getElementById('hidIdEdicao').value = p.id;
        document.getElementById('txtNomeEdicao').value = p.nome;
        document.getElementById('txtPrecoEdicao').value = p.preco;
        document.getElementById('cboCategoriaEdicao').value = p.categoria;
        document.getElementById('txtEstoqueEdicao').value = p.estoque;
        document.getElementById('chkAtivoEdicao').checked = p.ativo;
        mostrarMensagem('', 'lblMensagemEdicao');
    } catch (e) { mostrarMensagem(e.message); }
}
function aoCancelarEdicao() {
    document.getElementById('secaoEdicao').style.display = 'none';
    mostrarMensagem('', 'lblMensagemEdicao');
}
async function aoSalvarEdicao() {
    const id = Number(document.getElementById('hidIdEdicao').value);
    const dados = {
        nome: document.getElementById('txtNomeEdicao').value.trim(),
        preco: Number(document.getElementById('txtPrecoEdicao').value),
        categoria: document.getElementById('cboCategoriaEdicao').value,
        estoque: Number(document.getElementById('txtEstoqueEdicao').value),
        ativo: document.getElementById('chkAtivoEdicao').checked
    };
    try {
        const resp = await fetch(`${BASE_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        const json = await resp.json().catch(() => null);
        if (!resp.ok) { mostrarMensagem(json?.erros ? json.erros.join(' | ') : 'Erro ao salvar.', 'lblMensagemEdicao'); return; }
        await carregarProdutos(); aoCancelarEdicao(); mostrarMensagem(`Produto #${id} atualizado.`);
    } catch (e) { mostrarMensagem(e.message, 'lblMensagemEdicao'); }
}
window.addEventListener('load', aoCarregar);
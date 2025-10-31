// API Express em memória
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// "Banco" em memória
let proximoId = 6;
let produtos = [
  { id: 1, nome: 'Teclado', preco: 120.90, categoria: 'Periféricos', estoque: 15, ativo: true },
  { id: 2, nome: 'Mouse', preco: 79.50, categoria: 'Periféricos', estoque: 40, ativo: true },
  { id: 3, nome: 'Monitor 24"', preco: 899.00, categoria: 'Monitores', estoque: 10, ativo: true },
  { id: 4, nome: 'Cabo HDMI', preco: 35.00, categoria: 'Acessórios', estoque: 100, ativo: true },
  { id: 5, nome: 'Notebook', preco: 4299.90, categoria: 'Computadores', estoque: 5, ativo: false }
];


function listarProdutos() { return produtos; }
function obterProdutoPorId(id) { return produtos.find(p => p.id === id) || null; }

function validarProduto(dados) {
  const erros = [];
  if (!dados || typeof dados !== 'object') erros.push('Corpo da requisição inválido.');
  if (!dados.nome || String(dados.nome).trim().length < 2) erros.push('Nome é obrigatório e deve ter pelo menos 2 caracteres.');
  if (dados.preco == null || isNaN(Number(dados.preco)) || Number(dados.preco) < 0) erros.push('Preço é obrigatório e deve ser um número >= 0.');
  if (!dados.categoria || String(dados.categoria).trim().length < 2) erros.push('Categoria é obrigatória.');
  if (dados.estoque == null || isNaN(Number(dados.estoque)) || Number(dados.estoque) < 0) erros.push('Estoque é obrigatório e deve ser um inteiro >= 0.');
  if (typeof dados.ativo !== 'boolean') erros.push('Ativo deve ser booleano (true/false).');
  return erros;
}

function cadastrarProduto(dados) {
  const novo = {
    id: proximoId++,
    nome: String(dados.nome).trim(),
    preco: Number(dados.preco),
    categoria: String(dados.categoria).trim(),
    estoque: Number(dados.estoque),
    ativo: Boolean(dados.ativo)
  };
  produtos.push(novo);
  return novo;
}

function atualizarProduto(id, dados) {
  const idx = produtos.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const atual = produtos[idx];

  if (dados.nome !== undefined)      atual.nome = String(dados.nome).trim();
  if (dados.preco !== undefined)     atual.preco = Number(dados.preco);
  if (dados.categoria !== undefined) atual.categoria = String(dados.categoria).trim();
  if (dados.estoque !== undefined)   atual.estoque = Number(dados.estoque);
  if (dados.ativo !== undefined)     atual.ativo = Boolean(dados.ativo);

  produtos[idx] = atual;
  return atual;
}

function excluirProduto(id) {
  const idx = produtos.findIndex(p => p.id === id);
  if (idx === -1) return false;
  produtos.splice(idx, 1);
  return true;
}

// --- Rotas REST ---
app.get('/api/produtos', (req, res) => res.json(listarProdutos()));

app.get('/api/produtos/:id', (req, res) => {
  const id = Number(req.params.id);
  const prod = obterProdutoPorId(id);
  if (!prod) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(prod);
});

app.post('/api/produtos', (req, res) => {
  const erros = validarProduto(req.body);
  if (erros.length) return res.status(400).json({ erros });
  const criado = cadastrarProduto(req.body);
  res.status(201).json(criado);
});

app.put('/api/produtos/:id', (req, res) => {
  const id = Number(req.params.id);
  const existe = obterProdutoPorId(id);
  if (!existe) return res.status(404).json({ erro: 'Produto não encontrado.' });

  const parcial = { ...existe, ...req.body };
  const erros = validarProduto(parcial);
  if (erros.length) return res.status(400).json({ erros });

  const atualizado = atualizarProduto(id, req.body);
  res.json(atualizado);
});

app.delete('/api/produtos/:id', (req, res) => {
  const id = Number(req.params.id);
  const ok = excluirProduto(id);
  if (!ok) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.status(204).send();
});


app.listen(3002);

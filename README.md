# FarmaGestão — Sistema de Gestão de Farmácia

Sistema web para controle de medicamentos e movimentação de estoque de farmácia.

**Stack:** Node.js + Express + MySQL2 + React (Vite)

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- MySQL 5.7 ou superior (XAMPP, WAMP, MySQL Server, ou similar)
- npm (já vem com o Node.js)

---

## 1. Configurar o banco de dados

### 1.1 Inicie o MySQL e acesse o cliente

Se estiver usando **XAMPP**, inicie o módulo MySQL pelo painel e clique em **Shell** ou abra o terminal:

```bash
# Acesso via terminal (ajuste o caminho se necessário)
mysql -u root -p
```

Se a senha do root for vazia, pressione Enter quando solicitado.

### 1.2 Execute o script SQL

No cliente MySQL, rode:

```sql
source /caminho/completo/até/saep_20261/saep_db.sql
```

Ou pelo terminal do sistema operacional:

```bash
mysql -u root -p < saep_db.sql
```

Isso cria o banco `saep_db` com as tabelas `usuario`, `produto` e `estoque`, já populadas com dados iniciais.

### 1.3 Verifique a criação

```sql
USE saep_db;
SHOW TABLES;
SELECT * FROM usuario;
SELECT * FROM produto;
```

---

## 2. Configurar o backend

### 2.1 Ajuste as credenciais do banco (se necessário)

Abra `sistema/db.js` e verifique as configurações:

```js
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',     // ← altere se o seu usuário MySQL for diferente
  password: '',     // ← coloque a senha do MySQL aqui se houver
  database: 'saep_db',
  ...
});
```

### 2.2 Instale as dependências do backend

```bash
cd sistema
npm install
```

### 2.3 Inicie o servidor backend

```bash
npm start
```

O terminal deve exibir:

```
Backend rodando em http://localhost:3000
Desenvolvimento: cd frontend && npm run dev (porta 5173)
```

Mantenha esse terminal aberto.

---

## 3. Configurar e iniciar o frontend

Abra **um novo terminal** (mantenha o backend rodando no primeiro).

### 3.1 Instale as dependências do frontend

```bash
cd sistema/frontend
npm install
```

### 3.2 Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O terminal deve exibir:

```
VITE v5.x  ready in ...ms

➜  Local:   http://localhost:5173/
```

---

## 4. Acessar o sistema

Abra o navegador e acesse:

```
http://localhost:5173
```

Você será redirecionado automaticamente para a tela de login.

### Usuários de teste

| Login  | Senha  | Nome         |
|--------|--------|--------------|
| ana    | 123456 | Ana Costa    |
| bruno  | 123456 | Bruno Lima   |
| carla  | 123456 | Carla Souza  |

---

## 5. Testar as funcionalidades

### 5.1 Login

1. Acesse `http://localhost:5173`
2. Informe `ana` e `123456` → deve redirecionar para o menu principal exibindo **"Bem-vindo(a), Ana Costa!"**
3. Teste login inválido: informe `ana` e `senhaerrada` → deve exibir a mensagem de erro **"Login ou senha inválidos"** sem sair da tela de login
4. Teste campos vazios: clique em Entrar sem preencher → o navegador deve bloquear o envio (campos obrigatórios)

### 5.2 Menu principal

1. Após o login, verifique que o nome do usuário aparece na tela
2. Clique em **"Cadastro de Medicamentos"** → deve abrir a página de produtos
3. Volte ao menu e clique em **"Movimentação de Estoque"** → deve abrir a página de estoque
4. Clique em **"Sair do Sistema"** → deve retornar à tela de login e a sessão deve ser encerrada (tentando acessar `/` diretamente deve redirecionar ao login)

### 5.3 Cadastro de medicamentos

1. Acesse **Cadastro de Medicamentos**
2. **Listagem:** a tabela deve carregar automaticamente os 5 medicamentos do banco
3. **Busca:** digite `dipirona` e clique em Buscar → deve filtrar apenas o Dipirona 500mg; clique em Limpar para restaurar a lista completa
4. **Cadastrar:** clique em `+ Cadastrar Novo Medicamento`, preencha os campos e salve → o medicamento deve aparecer na tabela
5. **Validação:** tente salvar com o campo Nome vazio ou com letras no campo Preço → deve exibir mensagem de erro sem salvar
6. **Editar:** clique em Editar em qualquer linha, altere algum campo e salve → os dados devem ser atualizados na tabela
7. **Excluir:** clique em Excluir em algum medicamento → deve pedir confirmação e, ao confirmar, remover da tabela

### 5.4 Movimentação de estoque

1. Acesse **Movimentação de Estoque**
2. **Ordem alfabética:** verifique que a tabela de medicamentos está em ordem A→Z
3. **Entrada:** selecione qualquer medicamento, escolha **Entrada**, informe quantidade `20`, defina uma data e clique em Registrar → o estoque atual deve aumentar
4. **Saída:** selecione o **Omeprazol 20mg** (estoque atual: 8, mínimo: 15), escolha **Saída**, informe quantidade `2` → após registrar deve aparecer o **ALERTA DE ESTOQUE BAIXO** em vermelho
5. **Saída com estoque insuficiente:** tente registrar uma saída com quantidade maior do que o estoque disponível → deve exibir mensagem de erro
6. **Campo data:** o campo de data é do tipo `date` (obrigatório) → tente enviar sem preencher para confirmar a validação
7. **Histórico:** todas as movimentações registradas devem aparecer na tabela de histórico abaixo do formulário

---

## 6. Build de produção (opcional)

Para servir o frontend pelo próprio backend Express (sem o Vite):

```bash
cd sistema/frontend
npm run build
```

Depois acesse via backend:

```bash
cd sistema
npm start
# Acesse: http://localhost:3000
```

---

## Estrutura do projeto

```
saep_20261/
├── saep_db.sql              # Script do banco de dados
├── README.md                # Este arquivo
└── sistema/
    ├── package.json         # Dependências do backend
    ├── server.js            # Servidor Express (porta 3000)
    ├── db.js                # Conexão MySQL2
    ├── routes/
    │   ├── auth.js          # Login, logout, sessão
    │   ├── produtos.js      # CRUD de medicamentos
    │   └── estoque.js       # Movimentações e histórico
    └── frontend/
        ├── package.json     # Dependências do frontend
        ├── vite.config.js   # Proxy /api → localhost:3000
        └── src/
            ├── App.jsx
            ├── context/AuthContext.jsx
            ├── components/PrivateRoute.jsx
            └── pages/
                ├── Login.jsx
                ├── Dashboard.jsx
                ├── Produtos.jsx
                └── Estoque.jsx
```

---

## Solução de problemas

**Erro de conexão com o banco:** verifique se o MySQL está rodando e se as credenciais em `sistema/db.js` estão corretas.

**Porta 3000 ocupada:** edite a linha `const PORT = 3000` em `sistema/server.js` para outra porta disponível.

**Porta 5173 ocupada:** o Vite escolhe automaticamente a próxima porta disponível; observe o terminal para ver qual foi usada.

**`npm install` falha:** certifique-se de estar na pasta correta (`sistema/` para o backend, `sistema/frontend/` para o frontend).

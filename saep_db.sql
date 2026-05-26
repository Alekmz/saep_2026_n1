-- ============================================================
-- FarmaGestão - Sistema de Gestão de Farmácia
-- Banco de dados: saep_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS saep_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saep_db;

-- Tabela de usuários (funcionários da farmácia)
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos (medicamentos)
CREATE TABLE IF NOT EXISTS produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    fabricante VARCHAR(100) NOT NULL,
    principio_ativo VARCHAR(150) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque_atual INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 10,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo ENUM('entrada', 'saida') NOT NULL,
    quantidade INT NOT NULL,
    data_movimentacao DATE NOT NULL,
    observacao VARCHAR(255),
    CONSTRAINT fk_estoque_produto FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,
    CONSTRAINT fk_estoque_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Usuários iniciais
INSERT INTO usuario (nome, login, senha) VALUES
('Ana Costa', 'ana', '123456'),
('Bruno Lima', 'bruno', '123456'),
('Carla Souza', 'carla', '123456');

-- Produtos iniciais (medicamentos)
INSERT INTO produto (nome, categoria, fabricante, principio_ativo, preco, estoque_atual, estoque_minimo) VALUES
('Dipirona 500mg', 'Analgésico', 'EMS', 'Dipirona Sódica', 5.90, 50, 10),
('Amoxicilina 500mg', 'Antibiótico', 'Medley', 'Amoxicilina Tri-hidratada', 18.50, 30, 5),
('Omeprazol 20mg', 'Antiulceroso', 'Eurofarma', 'Omeprazol', 12.00, 8, 15),
('Loratadina 10mg', 'Anti-histamínico', 'Neo Química', 'Loratadina', 9.80, 25, 8),
('Ibuprofeno 600mg', 'Anti-inflamatório', 'Sanofi', 'Ibuprofeno', 14.30, 40, 12);

-- Movimentações iniciais de estoque
INSERT INTO estoque (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES
(1, 1, 'entrada', 100, '2026-05-01', 'Reposição mensal do fornecedor'),
(2, 2, 'entrada', 50, '2026-05-05', 'Compra de fornecedor ABC Farma'),
(3, 1, 'saida', 2, '2026-05-10', 'Venda no balcão');

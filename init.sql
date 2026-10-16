CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    limite INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    valor INTEGER NOT NULL,
    tipo CHAR(1) NOT NULL,
    descricao VARCHAR(10) NOT NULL,
    realizada_em TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_clientes_transacoes_id
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
    chave VARCHAR(255) PRIMARY KEY,
    resposta_json TEXT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO clientes (nome, limite) VALUES
    ('o-pai', 100000),
    ('detona', 80000),
    ('caju', 1000000),
    ('kirby', 10000000),
    ('yorha', 500000)
ON CONFLICT (id) DO NOTHING;

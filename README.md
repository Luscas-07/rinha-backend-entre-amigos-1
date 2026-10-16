# Rinha de Backend - Edição Pleno/Sênior: Motor de Transações e Consistência Estrita

Bem-vindo à Rinha de Backend. Esta edição foi estruturada para avaliar a capacidade de engenharia em lidar com **alta concorrência, consistência transacional estrita, idempotência e eficiência de recursos** sob restrições severas de hardware.

## 🎯 O Desafio

O objetivo é implementar um motor de processamento de transações financeiras (débitos e créditos) para contas de clientes, garantindo que o saldo e o limite de crédito nunca fiquem inconsistentes, mesmo sob concorrência agressiva de múltiplas instâncias da aplicação.

### Restrições de Infraestrutura
O ambiente de teste simula um container restrito:
- **CPU Total:** 1.5 vCPU compartilhado entre os serviços.
- **Memória RAM Total:** 512 MB ou 1 GB (dependendo do seu setup, recomendado otimizar para baixo uso de GC/Memória).
- **Topologia:** 
  * 1 Load Balancer (Nginx)
  * 2 Instâncias da API (`api01`, `api02`)
  * 1 Banco de Dados / Engine de Armazenamento otimizado (PostgreSQL).

---

## 🔌 Especificação da API

### 1. Transações
**`POST /clientes/{id}/transacoes`**

Realiza uma transação de débito ou crédito na conta do cliente.

- **Parâmetros de Rota:**
  * `id` (inteiro): ID do cliente (de 1 a 5).
- **Headers obrigatórios:**
  * `Idempotency-Key` (string/UUID): Chave de idempotência para evitar dupla cobrança em caso de retry de rede.
- **Payload (JSON):**
  ```json
  {
    "valor": 1000,
    "tipo": "c",
    "descricao": "descricao com até 10 caracteres"
  }
  ```
  * `valor`: Inteiro positivo em centavos (ex: `1000` = R$ 10,00).
  * `tipo`: `"c"` para crédito ou `"d"` para débito.
  * `descricao`: String de 1 a 10 caracteres.

- **Regras de Negócio:**
  * **Limite:** Clientes possuem um saldo inicial de `0` e um limite fixo (ex: Cliente 1 = R$ 1.000,00 / 100000 centavos).
  * No **débito (`d`)**, o saldo resultante (saldo atual - valor da transação) **não pode ser inferior ao negativo do limite** (`-limite`). Caso ultrapasse, retornar `422 Unprocessable Entity`.
  * Se o cliente não existir, retornar `404 Not Found`.
  * Se houver violação de regra de negócio (ex: valor negativo, tipo inválido), retornar `422`.

- **Respostas Sucesso (`200 OK`):**
  ```json
  {
    "limite": 100000,
    "saldo": -90000
  }
  ```

---

### 2. Extrato
**`GET /clientes/{id}/extrato`**

Retorna o saldo atual, a data do extrato e as últimas 10 transações realizadas.

- **Parâmetros de Rota:**
  * `id` (inteiro): ID do cliente.

- **Respostas Sucesso (`200 OK`):**
  ```json
  {
    "saldo": {
      "total": -90000,
      "data_extrato": "2026-06-06T12:00:00.000Z",
      "limite": 100000
    },
    "ultimas_transacoes": [
      {
        "valor": 1000,
        "tipo": "d",
        "descricao": "descricao",
        "realizada_em": "2026-06-06T11:59:00.000Z"
      }
    ]
  }
  ```
- Se o cliente não existir, retornar `404 Not Found`.

---

## 🏆 Critérios de Avaliação (Nível Pleno-Sênior)

1. **Correção e Consistência (Deal Breaker):** O saldo final após o teste de carga deve bater exatamente com a somatória de todas as transações bem-sucedidas. Race conditions resultam em desqualificação imediata.
2. **Idempotência:** Requisições repetidas com a mesma `Idempotency-Key` devem retornar o resultado anterior sem processar a transação novamente.
3. **Throughput & Latência:** Quantidade de requisições por segundo (RPS) suportadas com latência p99 abaixo de 50ms.
4. **Eficiência de Recursos:** Baixo consumo de CPU e memória sob carga sustentada.

---

## 🚀 Instruções de Execução Passo a Passo

### Pré-requisitos na Máquina
* **Docker** e **Docker Compose** instalados.
* **k6** instalado (para a execução dos testes de carga).

### Passo a Passo para Subir o Ambiente
1. Clone ou coloque todos os ficheiros do desafio na mesma pasta raiz do projeto.
2. Suba os contentores com os limites estritos de recursos ativados:
   ```bash
   docker compose up --build -d
   ```
3. Verifique se os serviços estão a correr corretamente:
   ```bash
   docker compose ps
   ```

### Executando os Testes de Carga com o k6
Com o ambiente a correr na porta `9999` (através do Nginx), execute o script de testes k6:
```bash
k6 run load-test/script.js
```

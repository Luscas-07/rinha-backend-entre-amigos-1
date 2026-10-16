import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Warm-up
    { duration: '3m', target: 200 },  // Carga sustentada
    { duration: '1m', target: 400 },  // Pico de estresse
    { duration: '1m', target: 0 },    // Cool-down
  ],
  thresholds: {
    http_req_duration: ['p(99)<50', 'p(95)<20'], // SLA estrito para Sênior
    http_req_failed: ['rate<0.01'],             // Menos de 1% de erro
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:9999';

export default function () {
  const clienteId = Math.floor(Math.random() * 5) + 1;
  const isTransacao = Math.random() < 0.8;

  if (isTransacao) {
    const tipos = ['c', 'd'];
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const valor = Math.floor(Math.random() * 5000) + 1;

    const payload = JSON.stringify({
      valor: valor,
      tipo: tipo,
      descricao: 'teste-k6',
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': uuidv4(),
      },
    };

    const res = http.post(`${BASE_URL}/clientes/${clienteId}/transacoes`, payload, params);

    check(res, {
      'transacao status 200 ou 422': (r) => r.status === 200 || r.status === 422,
    });
  } else {
    const res = http.get(`${BASE_URL}/clientes/${clienteId}/extrato`);

    check(res, {
      'extrato status 200': (r) => r.status === 200,
    });
  }

  sleep(0.01);
}

import axios from 'axios';

// Cria uma instância do Axios com configurações pré-definidas
const api = axios.create({
  // Define a URL base para todas as chamadas, já com o prefixo /api
  baseURL: 'http://localhost:3000/api',
});

// Isso é um "interceptor". Ele roda antes de cada requisição ser enviada.
api.interceptors.request.use(
  (config) => {
    // Verifica se o código está rodando no navegador (e não no servidor)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('plural_token');
      if (token) {
        // Se um token existir no localStorage, ele é adicionado ao cabeçalho de autorização
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config; // Retorna a configuração modificada
  },
  (error) => {
    // Trata erros que podem ocorrer na configuração da requisição
    return Promise.reject(error);
  },
);

export default api;
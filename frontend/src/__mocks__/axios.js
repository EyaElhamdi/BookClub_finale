// Création d'un mock d'objet HTTP (comme axios) pour les tests
const mock = {
  // Mock de la méthode GET : renvoie toujours une Promise résolue avec un objet { data: {} }
  get: jest.fn(() => Promise.resolve({ data: {} })),

  // Mock de la méthode POST : idem
  post: jest.fn(() => Promise.resolve({ data: {} })),

  // Mock de la méthode DELETE : idem
  delete: jest.fn(() => Promise.resolve({ data: {} })),

  // Méthode create pour simuler axios.create()
  create: function() {
    return {
      // On réutilise les mêmes mocks pour get, post, delete
      get: mock.get,
      post: mock.post,
      delete: mock.delete,

      // Mock des interceptors pour request et response
      interceptors: {
        request: { use: jest.fn() },   // permet de "brancher" des middlewares sur les requêtes
        response: { use: jest.fn() },  // permet de "brancher" des middlewares sur les réponses
      },
    };
  },

  // Mock global des interceptors au cas où on utiliserait directement axios.interceptors
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

// Export du mock pour pouvoir l'importer dans les tests
module.exports = mock;
module.exports.default = mock;

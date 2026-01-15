const mock = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: function() {
    return {
      get: mock.get,
      post: mock.post,
      delete: mock.delete,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };
  },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

module.exports = mock;
module.exports.default = mock;

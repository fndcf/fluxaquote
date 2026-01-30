import { logger } from '../utils/logger';

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock do app (index.ts) antes de importar server
const mockListen = jest.fn();
jest.mock('../index', () => {
  const express = require('express');
  const app = express();
  app.listen = mockListen;
  return { __esModule: true, default: app };
});

describe('server.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar app.listen na porta padrão 5000', () => {
    delete process.env.PORT;

    // Importar server para disparar a execução
    jest.isolateModules(() => {
      // Re-mock within isolated context
      jest.doMock('../utils/logger', () => ({
        logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
      }));

      const listenFn = jest.fn();
      jest.doMock('../index', () => {
        const express = require('express');
        const app = express();
        app.listen = listenFn;
        return { __esModule: true, default: app };
      });

      require('../server');

      expect(listenFn).toHaveBeenCalledWith(5000, expect.any(Function));
    });
  });

  it('deve usar a porta do env quando definida', () => {
    jest.isolateModules(() => {
      process.env.PORT = '3000';

      jest.doMock('../utils/logger', () => ({
        logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
      }));

      const listenFn = jest.fn();
      jest.doMock('../index', () => {
        const express = require('express');
        const app = express();
        app.listen = listenFn;
        return { __esModule: true, default: app };
      });

      require('../server');

      expect(listenFn).toHaveBeenCalledWith('3000', expect.any(Function));

      delete process.env.PORT;
    });
  });

  it('deve logar mensagens ao iniciar o servidor', () => {
    jest.isolateModules(() => {
      delete process.env.PORT;

      const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
      jest.doMock('../utils/logger', () => ({ logger: mockLogger }));

      const listenFn = jest.fn().mockImplementation((_port: number, callback: () => void) => {
        callback();
      });
      jest.doMock('../index', () => {
        const express = require('express');
        const app = express();
        app.listen = listenFn;
        return { __esModule: true, default: app };
      });

      require('../server');

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('FluxaQuote API rodando na porta')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Ambiente:')
      );
    });
  });
});

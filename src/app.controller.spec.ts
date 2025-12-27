import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let mockAppService: { getHello: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAppService = {
      getHello: vi.fn().mockReturnValue('Hello World!'),
    };
    appController = new AppController(mockAppService as AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
      expect(mockAppService.getHello).toHaveBeenCalled();
    });
  });
});

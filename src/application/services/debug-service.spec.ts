/**
 * Debug import test
 */
import * as ServiceModule from './store-user-after-login.service';
const { StoreUserAfterLoginService } = ServiceModule;

describe('Debug Service Import', () => {
  it('should import service correctly', () => {
    console.log('ServiceModule:', ServiceModule);
    console.log('ServiceModule keys:', Object.keys(ServiceModule));
    console.log('StoreUserAfterLoginService:', StoreUserAfterLoginService);
    console.log(
      'typeof StoreUserAfterLoginService:',
      typeof StoreUserAfterLoginService,
    );
    expect(StoreUserAfterLoginService).toBeDefined();
    expect(typeof StoreUserAfterLoginService).toBe('function');
  });
});

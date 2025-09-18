import { UserCacheService } from './user-cache.service';

describe('UserCacheService Debug', () => {
  it('should import correctly', () => {
    console.log('UserCacheService:', UserCacheService);
    expect(UserCacheService).toBeDefined();
    expect(typeof UserCacheService).toBe('function');

    const service = new UserCacheService();
    expect(service).toBeInstanceOf(UserCacheService);
  });
});

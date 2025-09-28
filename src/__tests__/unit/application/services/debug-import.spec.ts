/**
 * Test minimal pour debug import
 */
import { User } from '@domain/entities/user.entity';

describe('Debug Import User Entity', () => {
  it('should import User successfully', () => {
    expect(User).toBeDefined();
  });
});

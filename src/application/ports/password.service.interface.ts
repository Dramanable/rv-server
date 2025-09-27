/**
 * 🔐 Password Service Interface - Clean Architecture Port
 */

export interface IPasswordService {
  /**
   * Hash a password using secure hashing algorithm
   * @param password Plain text password to hash
   * @returns Promise<string> Hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Verify a password against its hash
   * @param password Plain text password
   * @param hash Hashed password to verify against
   * @returns Promise<boolean> True if password matches hash
   */
  verify(password: string, hash: string): Promise<boolean>;
}

import { hash } from 'bcrypt';
import { log } from '../../utils/log';

const SALT_ROUNDS = 10;

/**
 * Given a password in plain text, hash it to store it in the database
 *
 * @param plainPassword Password in plain text
 */
export function hashPassword(plainPassword: string, salt?: string): Promise<string> {
  return hash(plainPassword, SALT_ROUNDS).catch((error) => {
    log.error('hashPassword', `Error generating bcrypt salt: ${error}`);
  }) as Promise<string>;
}

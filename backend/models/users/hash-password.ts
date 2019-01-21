import { genSalt, hash } from 'bcrypt';
import { log } from '../../utils/log';

export interface HashedPassword {
  salt: string;
  hash: string;
}

const SALT_ROUNDS = 10;

/**
 * Given a password in plain text, hash it to store it in the database
 *
 * @param plainPassword Password in plain text
 * @param salt If provided, this salt will be used. If not, a new one will be generated
 */
export function hashPassword(plainPassword: string, salt?: string): Promise<HashedPassword> {
  return new Promise<HashedPassword>((resolve, reject) => {
    const saltPromise = salt ? Promise.resolve(salt)
                             : genSalt(SALT_ROUNDS);
    saltPromise.then((generatedSalt) => {
      // encode the password
      hash(plainPassword, generatedSalt).then((hashedPassword) => {
        resolve({
          salt: generatedSalt,
          hash: hashedPassword,
        });
      }).catch((error) => {
        log.error('hashPassword', `Error hashing a password: ${error}`);
        reject(error);
      });
    }).catch((error) => {
      log.error('hashPassword', `Error generating bcrypt salt: ${error}`);
      reject(error);
    });
  });
}

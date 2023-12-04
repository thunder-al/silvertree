/**
 * Collection of general characters for string randomization.
 */
export const defaultCharacterDictionary = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/**
 * Collection of special characters for string randomization.
 */
export const specialCharacterDictionary = '!@#$%*()_+-=[]{};:,<>?'

/**
 * Collection of characters for string randomization that excludes characters that are easily confused.
 * Excludes 0, 1, I, O, l, and other easily confused characters.
 */
export const passwordCharacterDictionary = 'ABCEFHJKLMNPRSTUWXabcdefgjkmopqrstuwxz34589'

/**
 * Generates a random string of the given length.
 * Cryptographically secure randomness is not used, so this should not be used for security.
 * @param length
 * @param dictionary
 */
export function unsafeRandomString(
  length = 32,
  dictionary = defaultCharacterDictionary + specialCharacterDictionary,
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += dictionary.charAt(Math.floor(Math.random() * dictionary.length))
  }
  return result
}

/**
 * Converts a string to "camel" case.
 * @param str
 */
export function camelCase(str: string): string {
  return str
    .replace(/^\w|[A-Z]|\b\w/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase())
    .replace(/[\s_-]+/g, '')
}

/**
 * Converts a string to "title" (pascal) case.
 * @param str
 */
export function titleCase(str: string): string {
  return str
    .replace(/^\w|[A-Z]|\b\w/g, w => w.toUpperCase())
    .replace(/[\s_-]+/g, '')
}

/**
 * Converts a string to "snake" (underscore) case.
 * @param str
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s_-]+/g, '_')
    .toLowerCase()
}

/**
 * Converts a string to "kebab" (dash) case.
 * @param str
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_-]+/g, '-')
    .toLowerCase()
}

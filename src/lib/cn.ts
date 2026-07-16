/** Une clases condicionales de forma segura (filtra falsy). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function isNumber(str: string): boolean {
    return str >= "0" && str <= "9"
}

export function isAlpha(str: string): boolean {
    return str?.toLocaleLowerCase() >= "a" && str?.toLocaleLowerCase() <= "z"
}

export function isWhitespace(str: string): boolean {
    return str == " " || str == "\t"
}

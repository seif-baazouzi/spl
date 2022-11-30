import { Token, TokenType } from "~/lexer/lexer-types.ts"

export function isNumber(str: string): boolean {
    return str >= "0" && str <= "9"
}

export function isAlpha(str: string): boolean {
    return str?.toLocaleLowerCase() >= "a" && str?.toLocaleLowerCase() <= "z" || str == "_"
}

export function isShippable(str: string): boolean {
    return str == " " || str == "\t"
}

export function handlerAlpha(code: string[]): { type: TokenType, alpha: string } {
    let alpha = ""
    while (isAlpha(code[0]) || isNumber(code[0])) {
        alpha += code.shift()
    }

    switch(alpha) {
        case "let": {
            return { type: TokenType.LET, alpha }
        }
        case "const": {
            return { type: TokenType.CONST, alpha }
        }
        case "true": {
            return { type: TokenType.TRUE, alpha }
        }
        case "false": {
            return { type: TokenType.FALSE, alpha }
        }
        case "dump": {
            return { type: TokenType.DUMP, alpha }
        }
        default: {
            return { type: TokenType.IDENTIFIER, alpha }
        }
    }
}

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

export function handlerAlpha(code: string[], tokens: Token[]) {
    let alpha = ""
    while (isAlpha(code[0]) || isNumber(code[0])) {
        alpha += code.shift()
    }

    switch(alpha) {
        case "let": {
            tokens.push(new Token(TokenType.LET, alpha))
            break
        }
        case "dump": {
            tokens.push(new Token(TokenType.DUMP, alpha))
            break
        }
        default: {
            tokens.push(new Token(TokenType.IDENTIFIER, alpha))
        }
    }
}

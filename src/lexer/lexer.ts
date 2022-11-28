import { TokenType, Token } from "~/lexer/lexer-types.ts"
import { handlerAlpha, isAlpha, isNumber, isShippable } from "~/lexer/lexer-helpers.ts"

export function tokenize(sourceCode: string): Token[] {
    const tokens: Token[] = []
    const code = sourceCode.split("")

    while (code.length != 0) {        
        switch (code[0]) {
            case "(": {
                tokens.push(new Token(TokenType.OPEN_PAREN, code.shift()))
                break
            }
            case ")": {
                tokens.push(new Token(TokenType.CLOSE_PAREN, code.shift()))
                break
            }
            case "=": {
                tokens.push(new Token(TokenType.EQUAL, code.shift()))
                break
            }
            case "+": {
                tokens.push(new Token(TokenType.PLUS, code.shift()))
                break
            }
            case "-": {
                tokens.push(new Token(TokenType.MINUS, code.shift()))
                break
            }
            case "*": {
                tokens.push(new Token(TokenType.MULTIPLY, code.shift()))
                break
            }
            case "/": {
                tokens.push(new Token(TokenType.DIVIDE, code.shift()))
                break
            }
            case "%": {
                tokens.push(new Token(TokenType.MODULO, code.shift()))
                break
            } default: {
                if (isNumber(code[0])) {
                    let number = ""
                    while (isNumber(code[0])) {
                        number += code.shift()
                    }

                    tokens.push(new Token(TokenType.NUMBER, number))
                    break
                }

                if (isAlpha(code[0])) {
                    handlerAlpha(code, tokens)
                    break
                }

                if (isShippable(code[0])) {
                    code.shift()
                    break
                }

                console.error(`Error: Invalid token ${code[0]}`)
                Deno.exit(1)
            }
        }
    }

    tokens.push(new Token(TokenType.EOF, "EOF"))
    return tokens;
}

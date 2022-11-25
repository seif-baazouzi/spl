enum TokenType {
    NUMBER,
    IDENTIFIER,
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    MODULO,
    EQUAL,
    OPEN_PAREN,
    CLOSE_PAREN,
    EOF,
}

class Token {
    constructor(
        public type: TokenType,
        public value: string | undefined,
    ) { }
}

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
                    let alpha = ""
                    while (isAlpha(code[0]) || isNumber(code[0])) {
                        alpha += code.shift()
                    }

                    tokens.push(new Token(TokenType.IDENTIFIER, alpha))
                    break
                }

                if (isShippable(code[0])) break

                console.error(`Error: Invalid token ${code[0]}`)
                Deno.exit(1)
            }
        }
    }

    tokens.push(new Token(TokenType.EOF, "EOF"))
    return tokens;
}

function isNumber(str: string): boolean {
    return str >= "0" && str <= "9"
}

function isAlpha(str: string): boolean {
    return str.toLocaleLowerCase() >= "a" && str.toLocaleLowerCase() <= "z" || str == "_"
}

function isShippable(str: string): boolean {
    return str == " " || str == "\t"
}

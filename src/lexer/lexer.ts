import logError from "~/utils/log-error.ts"
import { TokenType, Token } from "~/lexer/lexer-types.ts"
import { handlerAlpha, isAlpha, isNumber, isShippable } from "~/lexer/lexer-helpers.ts"

const lookupTokens: {[index: string]: TokenType} = {
    "(": TokenType.OPEN_PAREN,
    ")": TokenType.CLOSE_PAREN,
    "=": TokenType.EQUAL,
    "+": TokenType.PLUS,
    "-": TokenType.MINUS,
    "*": TokenType.MULTIPLY,
    "/": TokenType.DIVIDE,
    "%": TokenType.MODULO,
    ":": TokenType.COLON,
    ";": TokenType.END_LINE,
    "\n": TokenType.END_LINE,
}

export default class Lexer {
    private code: string[]
    private lineCounter = 1
    private columnCounter = 1

    constructor(sourceCode: string) {
        this.code = sourceCode.split("")
    }

    tokenize(): Token[] {
        const tokens: Token[] = []

        loop:
        while (this.code.length != 0) {        
            for(const token in lookupTokens) {
                if(this.code[0] == token) {
                    const tokenType = lookupTokens[token]
                    tokens.push(this.eat(tokenType))
                    continue loop
                }
            }
            
            if (isNumber(this.code[0])) {
                let number = ""
                while (isNumber(this.code[0])) {
                    number += this.code.shift()
                }

                tokens.push(new Token(TokenType.NUMBER, number, this.lineCounter, this.columnCounter))
                this.columnCounter += number.length
                continue
            }

            if (isAlpha(this.code[0])) {
                const { type, alpha } = handlerAlpha(this.code)
                
                tokens.push(new Token(type, alpha, this.lineCounter, this.columnCounter))
                this.columnCounter += alpha.length
                continue
            }

            if (isShippable(this.code[0])) {
                this.code.shift()
                this.columnCounter++
                continue
            }

            logError(this.lineCounter, this.columnCounter,  `Invalid token ${this.code[0]}`)
            Deno.exit(1)
        }

        tokens.push(new Token(TokenType.EOF, "EOF", this.lineCounter, this.columnCounter))
        return tokens
    }

    eat(type: TokenType, value?: string): Token {
        if(this.code[0] == "\n") {
            this.lineCounter++
            this.columnCounter = 0
        }

        return new Token(
            type,
            value ? value : this.code.shift() as string,
            this.lineCounter,
            this.columnCounter++,
        )
    }
}

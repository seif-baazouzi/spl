import logError from "~/utils/log-error.ts"
import { TokenType, Token } from "~/lexer/lexer-types.ts"
import { isAlpha, isNumber, isWhitespace } from "~/lexer/lexer-helpers.ts"

const lookupTokens: {[index: string]: TokenType} = {
    "==": TokenType.EQUALS_TO,
    "!=": TokenType.DEFERENT_TO,
    ">=": TokenType.GRATER_OR_EQUALS,
    ">": TokenType.GRATER_THEN,
    "<=": TokenType.LESS_OR_EQUALS,
    "<": TokenType.LESS_THEN,

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

    "and": TokenType.AND,
    "or": TokenType.OR,
    "xor": TokenType.XOR,

    "let": TokenType.LET,
    "const": TokenType.CONST,
    "print": TokenType.PRINT,
    "true": TokenType.TRUE,
    "false": TokenType.FALSE,

    "if": TokenType.IF,
    "else": TokenType.ELSE,
    "endif": TokenType.END_IF,
}

export default class Lexer {
    private code: string[]
    private tokens: Token[] = []

    private lineCounter = 1
    private columnCounter = 1

    constructor(sourceCode: string) {
        this.code = sourceCode.split("")
    }

    tokenize(): Token[] {
        this.tokens = []

        loop:
        while (this.code.length != 0) {     
            // handler predefined tokens         
            for(const token in lookupTokens) {
                if(this.copyToken(token.length) === token) {
                    const tokenType = lookupTokens[token]                    
                    this.tokens.push(new Token(tokenType, token, this.lineCounter, this.columnCounter))
                    this.shiftToken(token)

                    continue loop
                }
            }
            
            // handle number
            if (isNumber(this.code[0])) {
                this.handlerNumber()
                continue
            }

            // handle identifier
            if (isAlpha(this.code[0]) || this.code[0] === "_") {
                this.handlerIdentifier()
                continue
            }

            // handle whitespace
            if (isWhitespace(this.code[0])) {
                this.code.shift()
                this.columnCounter++
                continue
            }

            // invalid token
            logError(this.lineCounter, this.columnCounter,  `Invalid token ${this.code[0]}`)
            Deno.exit(1)
        }

        this.tokens.push(new Token(TokenType.EOF, "EOF", this.lineCounter, this.columnCounter))
        return this.tokens
    }

    handlerNumber() {
        let number = ""
        while (isNumber(this.code[0])) {
            number += this.code.shift()
        }

        this.tokens.push(new Token(TokenType.NUMBER, number, this.lineCounter, this.columnCounter))
        this.columnCounter += number.length
    }

    handlerIdentifier() {
        let identifier = ""
        while (isAlpha(this.code[0]) || isNumber(this.code[0]) || this.code[0] === "_") {
            identifier += this.code.shift()
        }

        this.tokens.push(new Token(TokenType.IDENTIFIER, identifier, this.lineCounter, this.columnCounter))
        this.columnCounter += identifier.length
    }

    copyToken(length: number): string {
        const result: string[] = []
        for(let i=0; i<length; i++) {
            if(this.code[i]) result.push(this.code[i])
        }
        
        return result.join("")
    }

    shiftToken(token: string) {
        for(let i=0; i<token.length; i++) this.code.shift()

        if(token === "\n") {
            this.lineCounter++
            this.columnCounter = 1
        } else {
            this.columnCounter += token.length
        }
    }
}

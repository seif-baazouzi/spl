import { Token, TokenType } from "~/lexer/lexer-types.ts"
import { NodeType, Statement, BinaryExpression, Numerical, Identifier, Program, Expression, DumpStatement } from "~/parser/parser-types.ts"

export class Parser {
    constructor(
        private tokens: Token[]
    ) {}

    getAST(): Program {
        const program = new Program()

        while(this.at().type != TokenType.EOF) {            
            program.body.push(this.parseStatement())
        }

        return program
    }

    parseStatement(): Statement {
        switch(this.at().type) {
            case TokenType.DUMP: {
                this.eat()
                const expression = this.parseExpression()
                return new DumpStatement(expression)
            }
            default: {
                return this.parseAddingStatement()   
            } 
        } 
    }
    
    parseExpression(): Expression {
        return this.parseAddingStatement()
    }

    parseAddingStatement(): Expression {
        let left: Statement = this.parseMultiplyingStatement()
        
        while(this.at().type === TokenType.PLUS || this.at().type === TokenType.MINUS) {
            const operation = this.eat()
            const right = this.parseMultiplyingStatement()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }

    parseMultiplyingStatement(): Expression {
        let left: Statement = this.parsePrimary()

        while(this.at().type === TokenType.MULTIPLY || this.at().type === TokenType.DIVIDE || this.at().type === TokenType.MODULO) {
            const operation = this.eat()
            const right = this.parsePrimary()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }
    
    parsePrimary(): Expression {
        const token = this.at()

        switch(token.type) {
            case TokenType.NUMBER: {
                return new Numerical(NodeType.NUMBER, parseInt(this.eat().value ?? ""))
            }
            case TokenType.IDENTIFIER: {
                return new Identifier(NodeType.IDENTIFIER, this.eat().value)
            }
            case TokenType.OPEN_PAREN: {
                this.eat()
                const value = this.parseStatement()
                this.expect(TokenType.CLOSE_PAREN, "Expected token )")

                return value
            }
            default: {
                console.error(`Error: Unexpected token ${token.value}`)
                Deno.exit(1)
            }            
        }
    }
    
    at(): Token {
        return this.tokens[0] ?? new Token(TokenType.EOF, "EOF");
    }

    eat(): Token {
        return this.tokens.shift() ?? new Token(TokenType.EOF, "EOF")
    }

    expect(type: TokenType, message: string) {
        if(this.tokens[0]?.type != type) {
            console.error(`Error: ${message}`)
            Deno.exit(1)
        }

        this.tokens.shift()
    }
}

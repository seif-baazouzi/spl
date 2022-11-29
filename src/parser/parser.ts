import { Token, TokenType } from "~/lexer/lexer-types.ts"
import { NodeType, Statement, BinaryExpression, Numerical, Identifier, Program, Expression, DumpStatement, DeclareVariable, AssignVariable } from "~/parser/parser-types.ts"

export class Parser {
    constructor(
        private tokens: Token[]
    ) {}

    getAST(): Program {
        const program = new Program()

        while(this.at().type != TokenType.EOF) {    
            program.body.push(this.parseStatement())
            if(this.at().type == TokenType.END_LINE) this.eat()        
        }

        return program
    }

    parseStatement(): Statement {
        switch(this.at().type) {
            case TokenType.LET: {
                this.eat()
                const variableName = this.expect(TokenType.IDENTIFIER, "Expected variable name after let keyword").value as string             
                if(this.at().type == TokenType.EQUAL) {
                    this.eat()
                    const expression = this.parseExpression()
                    return new DeclareVariable(variableName, expression)
                } else {
                    return new DeclareVariable(variableName)
                }
            }
            case TokenType.IDENTIFIER: {                
                if(this.next().type != TokenType.EQUAL) {
                    return this.parseExpression()
                }

                const variableName = this.eat().value as string          
                this.eat() // eat =
                
                const expression = this.parseExpression()
                return new AssignVariable(variableName, expression)
            }
            case TokenType.DUMP: {
                this.eat()
                const expression = this.parseExpression()
                return new DumpStatement(expression)
            }
            case TokenType.END_LINE: {
                this.eat()
                return this.parseStatement()
            }
            default: {
                return this.parseExpression()   
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
                return new Identifier(NodeType.IDENTIFIER, this.eat().value as string)
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
        return this.tokens[0] ?? new Token(TokenType.EOF, "EOF")
    }

    next(): Token {
        return this.tokens[1] ?? new Token(TokenType.EOF, "EOF")
    }

    eat(): Token {
        return this.tokens.shift() ?? new Token(TokenType.EOF, "EOF")
    }

    expect(type: TokenType, message: string): Token {
        if(this.tokens[0]?.type != type) {
            console.error(`Error: ${message}`)
            Deno.exit(1)
        }

        return this.tokens.shift() as Token
    }
}

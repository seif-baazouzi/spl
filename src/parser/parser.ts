import { Token, TokenType } from "~/lexer/lexer-types.ts"
import { NodeType, Statement, BinaryExpression, Numerical, Identifier, Program, Expression, PrintStatement, DeclareVariable, AssignVariable, Boolean, VariableType } from "~/parser/parser-types.ts"
import logError from "~/utils/log-error.ts"
import { getVariableType } from "~/parser/parser-helpers.ts"

export default class Parser {
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
                this.eat() // eat let keyword
                const variableName = this.expect(TokenType.IDENTIFIER, "Expected variable name after let keyword")           
                
                this.expect(TokenType.COLON, "Expected colon after variable name!")                
                const variableType = this.expect(TokenType.IDENTIFIER, "Expected variable type after variable name!")
                
                if(this.at().type == TokenType.EQUAL) {
                    this.eat() // eat =
                    const expression = this.parseExpression()
                    return new DeclareVariable(variableName, false, getVariableType(variableType), expression)
                } else {
                    return new DeclareVariable(variableName, false, getVariableType(variableType))
                }
            }
            case TokenType.CONST: {
                this.eat() // eat const keyword
                const variableName = this.expect(TokenType.IDENTIFIER, "Expected constant name after const keyword")        
                this.expect(TokenType.EQUAL, "Expected equal after constant name")
                
                const expression = this.parseExpression()
                return new DeclareVariable(variableName, true, VariableType.CONSTANT, expression)
            }
            case TokenType.IDENTIFIER: {                
                if(this.next().type != TokenType.EQUAL) {
                    return this.parseExpression()
                }

                const variableName = this.eat()        
                this.eat() // eat =
                
                const expression = this.parseExpression()
                return new AssignVariable(variableName, expression)
            }
            case TokenType.PRINT: {
                this.eat() // eat print keyword
                const expression = this.parseExpression()
                return new PrintStatement(expression)
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
        return this.parseLogicalStatement()
    }

    parseLogicalStatement(): Expression {
        let left: Statement = this.parseAddingStatement()
        
        while(this.at().type === TokenType.EQUALS_TO) {
            const operation = this.eat()
            const right = this.parseAddingStatement()

            left = new BinaryExpression(operation, left, right)
        }

        return left   
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
                return new Numerical(NodeType.NUMBER, this.eat())
            }
            case TokenType.TRUE: {
                this.eat() // eat true
                return new Boolean(true)
            }
            case TokenType.FALSE: {
                this.eat() // eat false
                return new Boolean(false)
            }
            case TokenType.IDENTIFIER: {
                return new Identifier(NodeType.IDENTIFIER, this.eat())
            }
            case TokenType.OPEN_PAREN: {
                this.eat()
                const value = this.parseStatement()
                this.expect(TokenType.CLOSE_PAREN, "Expected token )")

                return value
            }
            default: {
                logError(token.line, token.colum, `Unexpected token ${token.value}`)
                Deno.exit(1)
            }            
        }
    }
    
    at(): Token {
        return this.tokens[0] ?? new Token(TokenType.EOF, "EOF", 0, 0)
    }

    next(): Token {
        return this.tokens[1] ?? new Token(TokenType.EOF, "EOF", 0, 0)
    }

    eat(): Token {
        return this.tokens.shift() ?? new Token(TokenType.EOF, "EOF", 0, 0)
    }

    expect(type: TokenType, message: string): Token {
        const token = this.at()
        if(token.type != type) {
            logError(token.line, token.colum, message)
            Deno.exit(1)
        }

        return this.tokens.shift() as Token
    }
}

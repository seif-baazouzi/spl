import { Token, TokenType } from "./lexer.ts"

enum NodeType {
    NUMBER,
    IDENTIFIER,
    BINARY_EXPRESSION,
}

class Statement {
    constructor(
        public kind: NodeType
    ) {}
}

class Expression extends Statement {
    constructor(
        public kind: NodeType,
        public symbol: string|undefined,
    ) {
        super(kind)
    }
}

class BinaryExpression extends Statement {
    constructor(
        public operation: Token,
        public left: Statement,
        public right: Statement,
    ) {
        super(NodeType.BINARY_EXPRESSION)
    }
}

export class Parser {
    constructor(
        private tokens: Token[]
    ) {}

    getAST(): Statement[] {
        const program: Statement[] = []

        while(this.at().type != TokenType.EOF) {            
            program.push(this.parseStatement())
        }

        return program
    }

    parseStatement(): Statement {
        return this.parseAddingStatement()   
    }
    
    parseAddingStatement(): Statement {
        let left: Statement = this.parseMultiplyingStatement()
        
        while(this.at().type === TokenType.PLUS || this.at().type === TokenType.MINUS) {
            const operation = this.eat()
            const right = this.parseMultiplyingStatement()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }

    parseMultiplyingStatement(): Statement {
        let left: Statement = this.parsePrimary()

        while(this.at().type === TokenType.MULTIPLY || this.at().type === TokenType.DIVIDE || this.at().type === TokenType.MODULO) {
            const operation = this.eat()
            const right = this.parsePrimary()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }
    
    parsePrimary(): Statement {
        const token = this.at()

        switch(token.type) {
            case TokenType.NUMBER: {
                return new Expression(NodeType.NUMBER, this.eat().value)
            }
            case TokenType.IDENTIFIER: {
                return new Expression(NodeType.IDENTIFIER, this.eat().value)
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

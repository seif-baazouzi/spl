import { Token, TokenType } from "~/lexer/lexer-types.ts"
import { NodeType, Statement, BinaryExpression, Numerical, Identifier, Program, Expression, PrintStatement, DeclareVariable, AssignVariable, Boolean, VariableType, IfStatement, IfStatementBlock, WhileLoop } from "~/parser/parser-types.ts"
import logError from "~/utils/log-error.ts"
import { getVariableType } from "~/parser/parser-helpers.ts"

export default class Parser {
    constructor(
        private tokens: Token[]
    ) { }

    getAST(): Program {
        const program = new Program()

        while (this.at().type != TokenType.EOF) {
            const statement = this.parseStatement()
            if(statement) program.body.push(statement)
            if (this.at().type == TokenType.END_LINE) this.eat()
        }

        return program
    }

    private parseStatement(): Statement|undefined {
        switch (this.at().type) {
            case TokenType.LET: {
                this.eat() // eat let keyword
                const variableName = this.expect(TokenType.IDENTIFIER, "Expected variable name after let keyword")

                this.expect(TokenType.COLON, "Expected colon after variable name!")
                const variableType = this.expect(TokenType.IDENTIFIER, "Expected variable type after variable name!")

                if (this.at().type == TokenType.EQUAL) {
                    this.eat() // eat =
                    const expression = this.parseExpression()
                    this.expectNewLine()
                    return new DeclareVariable(variableName, false, getVariableType(variableType), expression)
                } else {
                    this.expectNewLine()
                    return new DeclareVariable(variableName, false, getVariableType(variableType))
                }
            }
            case TokenType.CONST: {
                this.eat() // eat const keyword
                const variableName = this.expect(TokenType.IDENTIFIER, "Expected constant name after const keyword")
                this.expect(TokenType.EQUAL, "Expected equal after constant name")

                const expression = this.parseExpression()
                this.expectNewLine()

                return new DeclareVariable(variableName, true, VariableType.CONSTANT, expression)
            }
            case TokenType.IDENTIFIER: {
                if (this.next().type != TokenType.EQUAL) {
                    return this.parseExpression()
                }

                const variableName = this.eat()
                this.eat() // eat =

                const expression = this.parseExpression()
                this.expectNewLine()

                return new AssignVariable(variableName, expression)
            }
            case TokenType.PRINT: {
                this.eat() // eat print keyword
                const expression = this.parseExpression()
                this.expectNewLine()
                
                return new PrintStatement(expression)
            }
            case TokenType.IF: {
                const blocks: IfStatementBlock[] = []
                
                // parse if
                const ifToken = this.eat()
                const ifCondition = this.parseExpression()
                this.expect(TokenType.COLON, "Expected colon and if statement condition")

                const ifBlock: Statement[] = []
                while(
                    this.at().type != TokenType.ELSE &&
                    this.at().type != TokenType.ELIF &&
                    this.at().type != TokenType.END_IF &&
                    this.at().type != TokenType.EOF
                ) {
                    const statement = this.parseStatement()
                    if(statement) ifBlock.push(statement)
                }

                blocks.push({token: ifToken, block: ifBlock, condition: ifCondition})
                
                // parse elif
                while(this.at().type == TokenType.ELIF) {
                    const elifToken = this.eat() // eat elif keyword
                    const elifCondition = this.parseExpression()
                    this.expect(TokenType.COLON, "Expected colon and elif statement condition")
                    
                    const elifBlock: Statement[] = []
                    while(
                        this.at().type != TokenType.ELSE &&
                        this.at().type != TokenType.ELIF &&
                        this.at().type != TokenType.END_IF &&
                        this.at().type != TokenType.EOF
                    ) {
                        const statement = this.parseStatement()
                        if(statement) elifBlock.push(statement)
                    }

                    blocks.push({token: elifToken, block: elifBlock, condition: elifCondition})
                }

                // parse else
                if(this.at().type == TokenType.ELSE) {
                    const elseToken = this.eat() // eat else keyword
                    this.expect(TokenType.COLON, "Expected colon and else statement")

                    const elseBlock: Statement[] = []
                    while(this.at().type != TokenType.END_IF && this.at().type != TokenType.EOF) {
                        const statement = this.parseStatement()
                        if(statement) elseBlock.push(statement)
                    }

                    blocks.push({ token: elseToken, block: elseBlock })
                }
                
                this.expect(TokenType.END_IF, "Expected endif after else statement block")
                return new IfStatement(blocks)
            }
            case TokenType.WHILE: {                
                const whileToken = this.eat()
                const condition = this.parseExpression()
                this.expect(TokenType.COLON, "Expected colon and while loop condition")

                const block: Statement[] = []
                while(this.at().type != TokenType.END_WHILE && this.at().type != TokenType.EOF) {
                    const statement = this.parseStatement()
                    if(statement) block.push(statement)
                }
                
                this.expect(TokenType.END_WHILE, "Expected endwhile after while loop block")
                return new WhileLoop(whileToken, condition, block)
            }
            case TokenType.END_LINE: {
                this.eat()
                return
            }
            default: {
                return this.parseExpression()
            }
        }
    }

    private parseExpression(): Expression {
        return this.parseLogicalStatement()
    }

    private parseLogicalStatement(): Expression {
        let left: Statement = this.parseLogicalPrimary()

        while (
            this.at().type === TokenType.AND ||
            this.at().type === TokenType.OR ||
            this.at().type === TokenType.XOR
        ) {
            const operation = this.eat()
            const right = this.parseLogicalPrimary()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }

    private parseLogicalPrimary(): Expression {
        let left: Statement = this.parseAddingStatement()

        while (
            this.at().type === TokenType.EQUALS_TO ||
            this.at().type === TokenType.DEFERENT_TO ||
            this.at().type === TokenType.GRATER_OR_EQUALS ||
            this.at().type === TokenType.GRATER_THEN ||
            this.at().type === TokenType.LESS_OR_EQUALS ||
            this.at().type === TokenType.LESS_THEN
        ) {
            const operation = this.eat()
            const right = this.parseAddingStatement()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }

    private parseAddingStatement(): Expression {
        let left: Statement = this.parseMultiplyingStatement()

        while (this.at().type === TokenType.PLUS || this.at().type === TokenType.MINUS) {
            const operation = this.eat()
            const right = this.parseMultiplyingStatement()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }

    private parseMultiplyingStatement(): Expression {
        let left: Statement = this.parsePrimary()

        while (this.at().type === TokenType.MULTIPLY || this.at().type === TokenType.DIVIDE || this.at().type === TokenType.MODULO) {
            const operation = this.eat()
            const right = this.parsePrimary()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }

    private parsePrimary(): Expression {
        const token = this.at()

        switch (token.type) {
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
                const value = this.parseExpression()
                this.expect(TokenType.CLOSE_PAREN, "Expected token )")

                return value
            }
            default: {
                logError(token.line, token.colum, `Unexpected token ${token.value}`)
                Deno.exit(1)
            }
        }
    }

    private at(): Token {
        return this.tokens[0] ?? new Token(TokenType.EOF, "EOF", 0, 0)
    }

    private next(): Token {
        return this.tokens[1] ?? new Token(TokenType.EOF, "EOF", 0, 0)
    }

    private eat(): Token {
        return this.tokens.shift() ?? new Token(TokenType.EOF, "EOF", 0, 0)
    }

    private expect(type: TokenType, message: string): Token {
        const token = this.at()
        if (token.type != type) {
            logError(token.line, token.colum, message)
            Deno.exit(1)
        }

        return this.tokens.shift() as Token
    }

    private expectNewLine() {
        const token = this.at()

        if(token.type != TokenType.END_LINE && token.type != TokenType.EOF) {
            logError(token.line, token.colum, `Expected token ';' or new line but got ${token.value}!`)
        }
    }
}

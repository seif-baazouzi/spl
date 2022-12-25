import { Token, TokenType } from "~/lexer/lexer-types.ts"
import {
    AssignVariable,
    BinaryExpression,
    Boolean,
    BreakKeyword,
    ContinueKeyword,
    DeclareFunction,
    DeclareVariable,
    ExitStatement,
    Expression,
    ForLoop,
    Identifier,
    IfStatement,
    IfStatementBlock,
    NodeType,
    Numerical,
    PrintStatement,
    Program,
    ReturnStatement,
    Statement,
    SyscallExpression,
    VariableType,
    WhileLoop,
} from "~/parser/parser-types.ts"
import logError from "~/utils/log-error.ts"
import { getVariableType } from "~/parser/parser-helpers.ts"
import typeToString from "../utils/type-to-string.ts"

export default class Parser {
    private isInLoop = false;
    private functionReturnType?: VariableType

    constructor(private tokens: Token[]) { }

    produceAST(): Program {
        const program = new Program()

        while (this.at().type != TokenType.EOF) {
            const statement = this.parseStatement()
            if (statement) program.body.push(statement)
            if (this.at().type == TokenType.END_LINE) this.eat()
        }

        return program
    }

    private parseStatement(notEndOfLine = false): Statement | undefined {
        switch (this.at().type) {
            case TokenType.LET:
                return this.parseLet(notEndOfLine)
            case TokenType.CONST:
                return this.parseConst(notEndOfLine)
            case TokenType.IDENTIFIER:
                return this.parseIdentifier(notEndOfLine)
            case TokenType.PRINT:
                return this.parsePrint(notEndOfLine)
            case TokenType.EXIT:
                return this.parseExit(notEndOfLine)
            case TokenType.IF:
                return this.parseIf()
            case TokenType.WHILE:
                return this.parseWhile()
            case TokenType.FOR:
                return this.parseFor()
            case TokenType.BREAK:
                return this.parseBreak()
            case TokenType.CONTINUE:
                return this.parseContinue()
            case TokenType.FUNC:
                return this.parseFunction()
            case TokenType.RETURN:
                return this.parseReturn()
            case TokenType.END_LINE: {
                this.eat()
                return
            }
            default: {
                return this.parseExpression()
            }
        }
    }

    private parseLet(notEndOfLine: boolean): DeclareVariable {
        this.expect(
            TokenType.LET,
            `Expected token let but got ${this.at().value}!`,
        )
        const variableName = this.expect(
            TokenType.IDENTIFIER,
            "Expected variable name after let keyword",
        )

        this.expect(TokenType.COLON, "Expected colon after variable name!")
        const variableType = this.expect(
            TokenType.IDENTIFIER,
            "Expected variable type after variable name!",
        )

        if (this.at().type == TokenType.EQUAL) {
            this.eat() // eat =
            const expression = this.parseExpression()
            if (notEndOfLine) this.expectNewLine()
            return new DeclareVariable(
                variableName,
                false,
                getVariableType(variableType),
                expression,
            )
        } else {
            if (notEndOfLine) this.expectNewLine()
            return new DeclareVariable(
                variableName,
                false,
                getVariableType(variableType),
            )
        }
    }

    private parseConst(notEndOfLine: boolean): DeclareVariable {
        this.expect(
            TokenType.CONST,
            `Expected token const but got ${this.at().value}!`,
        )
        const variableName = this.expect(
            TokenType.IDENTIFIER,
            "Expected constant name after const keyword",
        )
        this.expect(TokenType.EQUAL, "Expected equal after constant name")

        const expression = this.parseExpression()
        if (notEndOfLine) this.expectNewLine()

        return new DeclareVariable(
            variableName,
            true,
            VariableType.CONSTANT,
            expression,
        )
    }

    private parseIdentifier(notEndOfLine: boolean): Statement {
        if (
            this.next().type != TokenType.EQUAL &&
            this.next().type != TokenType.PLUS_EQUAL &&
            this.next().type != TokenType.MINUS_EQUAL &&
            this.next().type != TokenType.MULTIPLY_EQUAL &&
            this.next().type != TokenType.DIVIDE_EQUAL &&
            this.next().type != TokenType.MODULO_EQUAL
        ) {
            return this.parseExpression()
        }

        const variableName = this.expect(
            TokenType.IDENTIFIER,
            `Expected identifier but got ${this.at().value}!`,
        )

        const operation = this.eat()

        const expression = this.parseExpression()
        if (notEndOfLine) this.expectNewLine()

        return new AssignVariable(variableName, operation, expression)
    }

    private parsePrint(notEndOfLine: boolean): PrintStatement {
        this.expect(
            TokenType.PRINT,
            `Expected token print but got ${this.at().value}!`,
        )
        const expression = this.parseExpression()
        if (notEndOfLine) this.expectNewLine()

        return new PrintStatement(expression)
    }

    private parseExit(notEndOfLine: boolean): ExitStatement {
        const token = this.expect(
            TokenType.EXIT,
            `Expected token exit but got ${this.at().value}!`,
        )
        const expression = this.parseExpression()
        if (notEndOfLine) this.expectNewLine()

        return new ExitStatement(token, expression)
    }

    private parseFunction(): DeclareFunction {
        if (this.functionReturnType !== undefined) {
            logError(
                this.at().line,
                this.at().colum,
                `Can not declare function inside a function`,
            )
            Deno.exit(1)
        }

        // parse function name
        this.expect(
            TokenType.FUNC,
            `Expected token func but got ${this.at().value}!`,
        )
        const name = this.expect(
            TokenType.IDENTIFIER,
            "Expected function name after func keyword",
        )

        // parse function arguments
        this.expect(TokenType.OPEN_PAREN, "Expected ( after function name!")

        const argumentsList: DeclareVariable[] = []
        if (this.at().type === TokenType.IDENTIFIER) {
            do {
                if (this.at().type === TokenType.COMMA) this.eat()

                const argumentName = this.eat()
                this.expect(TokenType.COLON, "Expected colon after argument name!")
                const argumentType = getVariableType(
                    this.expect(
                        TokenType.IDENTIFIER,
                        "Expected argument type after argument name!",
                    )
                )

                argumentsList.push(new DeclareVariable(argumentName, false, argumentType))
            } while (this.at().type === TokenType.COMMA)
        }

        this.expect(TokenType.CLOSE_PAREN, "Expected ) after function arguments!")

        // parse function return type
        this.expect(TokenType.COLON, "Expected colon after function arguments!")
        const returnType = getVariableType(
            this.expect(
                TokenType.IDENTIFIER,
                "Expected function return type after function arguments!",
            )
        )

        this.expect(TokenType.END_LINE, "Expected new line or ; after function return type")

        // parse function block
        const block: Statement[] = []
        let hasReturn = false

        const isInLoopOldValue = this.isInLoop
        const functionReturnTypeOldValue = this.functionReturnType

        this.isInLoop = false
        this.functionReturnType = returnType

        while (
            this.at().type != TokenType.END_FUNC &&
            this.at().type != TokenType.EOF
        ) {
            if (this.at().type === TokenType.RETURN) hasReturn = true

            const statement = this.parseStatement()
            if (statement) block.push(statement)
        }

        this.isInLoop = isInLoopOldValue
        this.functionReturnType = functionReturnTypeOldValue

        // parse end of function
        this.expect(
            TokenType.END_FUNC,
            "Expected endfunc after function block",
        )

        if (returnType != VariableType.VOID && !hasReturn) {
            logError(
                name.line,
                name.colum,
                `Function ${name.value} does not contain return statement`,
            )
        }

        return new DeclareFunction(name, argumentsList, returnType, block)
    }

    private parseReturn(): ReturnStatement {
        if (this.functionReturnType === undefined) {
            logError(
                this.at().line,
                this.at().colum,
                `Unexpected token return outside of function`,
            )
            Deno.exit(1)
        }

        const token = this.expect(
            TokenType.RETURN,
            `Expected token return but got ${this.at().value}!`,
        )

        // void return type
        if (this.at().type === TokenType.END_LINE) {
            if (this.functionReturnType !== VariableType.VOID) {
                logError(
                    this.at().line,
                    this.at().colum,
                    `This function has ${typeToString(this.functionReturnType)} return type!`,
                )
                Deno.exit(1)
            }
            return new ReturnStatement(token, this.functionReturnType)
        }

        // other return type
        const expression = this.parseExpression()
        return new ReturnStatement(token, this.functionReturnType, expression)
    }

    private parseIf(): IfStatement {
        const blocks: IfStatementBlock[] = []

        // parse if
        const ifToken = this.expect(TokenType.IF, `Expected token if but got ${this.at().value}`)
        const ifCondition = this.parseExpression()
        this.expect(
            TokenType.COLON,
            "Expected colon and if statement condition",
        )

        const ifBlock: Statement[] = []
        while (
            this.at().type != TokenType.ELSE &&
            this.at().type != TokenType.ELIF &&
            this.at().type != TokenType.END_IF &&
            this.at().type != TokenType.EOF
        ) {
            const statement = this.parseStatement()
            if (statement) ifBlock.push(statement)
        }

        blocks.push({ token: ifToken, block: ifBlock, condition: ifCondition })

        // parse elif
        while (this.at().type == TokenType.ELIF) {
            const elifToken = this.eat() // eat elif keyword
            const elifCondition = this.parseExpression()
            this.expect(
                TokenType.COLON,
                "Expected colon and elif statement condition",
            )

            const elifBlock: Statement[] = []
            while (
                this.at().type != TokenType.ELSE &&
                this.at().type != TokenType.ELIF &&
                this.at().type != TokenType.END_IF &&
                this.at().type != TokenType.EOF
            ) {
                const statement = this.parseStatement()
                if (statement) elifBlock.push(statement)
            }

            blocks.push({
                token: elifToken,
                block: elifBlock,
                condition: elifCondition,
            })
        }

        // parse else
        if (this.at().type == TokenType.ELSE) {
            const elseToken = this.eat() // eat else keyword
            this.expect(TokenType.COLON, "Expected colon and else statement")

            const elseBlock: Statement[] = []
            while (
                this.at().type != TokenType.END_IF &&
                this.at().type != TokenType.EOF
            ) {
                const statement = this.parseStatement()
                if (statement) elseBlock.push(statement)
            }

            blocks.push({ token: elseToken, block: elseBlock })
        }

        this.expect(
            TokenType.END_IF,
            "Expected endif after else statement block",
        )
        return new IfStatement(blocks)
    }

    private parseWhile(): WhileLoop {
        const whileToken = this.eat()
        const condition = this.parseExpression()
        this.expect(TokenType.COLON, "Expected colon and while loop condition")

        const block: Statement[] = []
        const isInLoopOldValue = this.isInLoop
        this.isInLoop = true

        while (
            this.at().type != TokenType.END_WHILE &&
            this.at().type != TokenType.EOF
        ) {
            const statement = this.parseStatement()
            if (statement) block.push(statement)
        }

        this.isInLoop = isInLoopOldValue

        this.expect(
            TokenType.END_WHILE,
            "Expected endwhile after while loop block",
        )
        return new WhileLoop(whileToken, condition, block)
    }

    private parseFor(): ForLoop {
        const forToken = this.eat()

        const initialization = this.parseStatement()
        if (!initialization) {
            logError(
                forToken.line,
                forToken.colum,
                "Expected initialization statement after for keyword",
            )
            Deno.exit(1)
        }
        this.expect(
            TokenType.END_LINE,
            "Expected new line or ; after for loop initialization",
        )

        const condition = this.parseExpression()
        this.expect(
            TokenType.END_LINE,
            "Expected new line or ; after for loop condition",
        )

        const update = this.parseStatement()
        if (!update) {
            logError(
                forToken.line,
                forToken.colum,
                "Expected update statement after for loop condition",
            )
            Deno.exit(1)
        }
        this.expect(TokenType.COLON, "Expected colon after for loop condition")

        const block: Statement[] = []
        const isInLoopOldValue = this.isInLoop
        this.isInLoop = true

        while (
            this.at().type != TokenType.END_FOR && this.at().type != TokenType.EOF
        ) {
            const statement = this.parseStatement()
            if (statement) block.push(statement)
        }

        this.isInLoop = isInLoopOldValue

        this.expect(TokenType.END_FOR, "Expected endfor after for loop block")
        return new ForLoop(forToken, initialization, condition, update, block)
    }

    private parseBreak(): BreakKeyword {
        if (!this.isInLoop) {
            logError(
                this.at().line,
                this.at().colum,
                `Unexpected token break outside of loop`,
            )
            Deno.exit(1)
        }

        return new BreakKeyword(this.eat())
    }

    private parseContinue(): ContinueKeyword {
        if (!this.isInLoop) {
            logError(
                this.at().line,
                this.at().colum,
                `Unexpected token continue outside of loop`,
            )
            Deno.exit(1)
        }

        return new ContinueKeyword(this.eat())
    }

    private parseExpression(): Expression {
        switch (this.at().type) {
            case TokenType.SYSCALL:
                return this.parseSyscall()
            default:
                return this.parseLogicalStatement()
        }
    }

    private parseSyscall(): SyscallExpression {
        const token = this.expect(
            TokenType.SYSCALL,
            `Expected token syscall but got ${this.at().value}!`,
        )

        this.expect(TokenType.OPEN_PAREN, `Expected token ( but got ${this.at().value}!`)

        const rax = this.parseExpression()
        this.expect(TokenType.COMMA, `Expected token , but got ${this.at().value}!`)
        const rdi = this.parseExpression()
        this.expect(TokenType.COMMA, `Expected token , but got ${this.at().value}!`)
        const rsi = this.parseExpression()
        this.expect(TokenType.COMMA, `Expected token , but got ${this.at().value}!`)
        const rdx = this.parseExpression()

        this.expect(TokenType.CLOSE_PAREN, `Expected token ) but got ${this.at().value}!`)

        return new SyscallExpression(token, rax, rdi, rsi, rdx)
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

        while (
            this.at().type === TokenType.PLUS || this.at().type === TokenType.MINUS
        ) {
            const operation = this.eat()
            const right = this.parseMultiplyingStatement()

            left = new BinaryExpression(operation, left, right)
        }

        return left
    }

    private parseMultiplyingStatement(): Expression {
        let left: Statement = this.parsePrimary()

        while (
            this.at().type === TokenType.MULTIPLY ||
            this.at().type === TokenType.DIVIDE || this.at().type === TokenType.MODULO
        ) {
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

        if (token.type != TokenType.END_LINE && token.type != TokenType.EOF) {
            logError(
                token.line,
                token.colum,
                `Expected token ';' or new line but got ${token.value}!`,
            )
        }
    }
}

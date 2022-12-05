import { Token } from "~/lexer/lexer-types.ts"

export enum NodeType {
    PROGRAM,
    PRINT,
    NUMBER,
    BOOLEAN,
    IDENTIFIER,
    BINARY_EXPRESSION,
    DECLARE_VARIABLE,
    ASSIGN_VARIABLE,
    VARIABLE_TYPE,
    IF_STATEMENT,
    WHILE_LOOP,
    BREAK,
    CONTINUE,
}

export enum VariableType {
    NUMBER,
    BOOLEAN,
    CONSTANT,
}

export class Statement {
    constructor(
        public kind: NodeType
    ) {}
}

export class Program extends Statement {
    public body: Statement[]
    
    constructor() {
        super(NodeType.PROGRAM)
        this.body = []
    }
}

export class Expression extends Statement {
    constructor(
        public kind: NodeType,
    ) {
        super(kind)
    }
}

export class PrintStatement extends Statement {    
    constructor(public expression: Expression) {
        super(NodeType.PRINT)
    }
}

export class DeclareVariable extends Statement {    
    constructor(
        public name: Token,
        public isConstant: boolean,
        public type: VariableType,
        public expression?: Expression
    ) {
        super(NodeType.DECLARE_VARIABLE)
    }
}

export class AssignVariable extends Statement {    
    constructor(public name: Token, public expression: Expression) {
        super(NodeType.ASSIGN_VARIABLE)
    }
}

export class BinaryExpression extends Statement {
    constructor(
        public operation: Token,
        public left: Expression,
        public right: Expression,
    ) {
        super(NodeType.BINARY_EXPRESSION)
    }
}

export class Identifier extends Expression {
    constructor(public kind: NodeType, public symbol: Token) {
        super(kind)
    }
}

export class Numerical extends Expression {
    constructor(public kind: NodeType, public number: Token) {
        super(kind)
    }
}

export class Boolean extends Expression {
    constructor(public value: boolean) {
        super(NodeType.BOOLEAN)
    }
}

export interface IfStatementBlock {
    token: Token,
    condition?: Expression,
    block: Statement[],
}

export class IfStatement extends Expression {
    constructor(public blocks: IfStatementBlock[]) {
        super(NodeType.IF_STATEMENT)
    }
}

export class WhileLoop extends Expression {
    constructor(public whileToken: Token, public condition: Expression, public block: Statement[]) {
        super(NodeType.WHILE_LOOP)
    }
}

export class BreakKeyword extends Statement {
    constructor(public breakToken: Token) {
        super(NodeType.BREAK)
    }
}

export class ContinueKeyword extends Statement {
    constructor(public breakToken: Token) {
        super(NodeType.CONTINUE)
    }
}

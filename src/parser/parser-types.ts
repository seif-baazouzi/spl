import { Token } from "~/lexer/lexer-types.ts"

export enum NodeType {
    PROGRAM,
    DUMP,
    NUMBER,
    IDENTIFIER,
    BINARY_EXPRESSION,
    DECLARE_VARIABLE,
    ASSIGN_VARIABLE,
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

export class DumpStatement extends Statement {    
    constructor(public expression: Expression) {
        super(NodeType.DUMP)
    }
}

export class DeclareVariable extends Statement {    
    constructor(public name: string, public expression?: Expression) {
        super(NodeType.DECLARE_VARIABLE)
    }
}

export class AssignVariable extends Statement {    
    constructor(public name: string, public expression: Expression) {
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
    constructor(
        public kind: NodeType,
        public symbol: string,
    ) {
        super(kind)
    }
}

export class Numerical extends Expression {
    constructor(
        public kind: NodeType,
        public value: number,
    ) {
        super(kind)
    }
}

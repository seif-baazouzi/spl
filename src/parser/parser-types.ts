import { Token } from "~/lexer/lexer-types.ts"

export enum NodeType {
    PROGRAM,
    NUMBER,
    IDENTIFIER,
    BINARY_EXPRESSION,
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
        public symbol: string|undefined,
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


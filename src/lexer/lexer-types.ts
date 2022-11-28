export enum TokenType {
    NUMBER,
    IDENTIFIER,
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    MODULO,
    EQUAL,
    OPEN_PAREN,
    CLOSE_PAREN,
    EOF,

    DUMP,
}

export class Token {
    constructor(
        public type: TokenType,
        public value: string | undefined,
    ) { }
}

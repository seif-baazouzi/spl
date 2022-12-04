export enum TokenType {
    NUMBER,
    IDENTIFIER,

    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    MODULO,

    EQUAL,

    EQUALS_TO,
    DEFERENT_TO,
    GRATER_THEN,
    GRATER_OR_EQUALS,
    LESS_THEN,
    LESS_OR_EQUALS,
    
    AND,
    OR,
    XOR,

    OPEN_PAREN,
    CLOSE_PAREN,

    END_LINE,
    EOF,

    COLON,

    TRUE,
    FALSE,

    LET,
    CONST,
    PRINT,

    IF,
    END_IF,
}

export class Token {
    constructor(
        public type: TokenType,
        public value: string,
        public line: number,
        public colum: number,
    ) { }
}

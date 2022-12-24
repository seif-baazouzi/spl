export enum TokenType {
    NUMBER,
    IDENTIFIER,

    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    MODULO,

    EQUAL,
    PLUS_EQUAL,
    MINUS_EQUAL,
    MULTIPLY_EQUAL,
    DIVIDE_EQUAL,
    MODULO_EQUAL,

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
    COMMA,

    TRUE,
    FALSE,

    LET,
    CONST,
    PRINT,

    IF,
    ELIF,
    ELSE,
    END_IF,

    WHILE,
    END_WHILE,

    FOR,
    END_FOR,

    BREAK,
    CONTINUE,

    EXIT,
    SYSCALL,
}

export class Token {
    constructor(
        public type: TokenType,
        public value: string,
        public line: number,
        public colum: number,
    ) { }
}

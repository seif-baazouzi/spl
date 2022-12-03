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
}

export class Token {
    constructor(
        public type: TokenType,
        public value: string,
        public line: number,
        public colum: number,
    ) { }
}

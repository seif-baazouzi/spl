import { tokenize } from "./lexer.ts";
import { Parser } from "./parser.ts";
import compile from "./compiler.ts";

const tokens = tokenize("(1+2)*3")
const ast = new Parser(tokens).getAST()
compile(ast)

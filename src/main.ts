import { tokenize } from "./lexer.ts";
import { Parser } from "./parser.ts";

const tokens = tokenize("(1+2)/(x+2)")
const ast = new Parser(tokens).getAST()

console.log(ast);

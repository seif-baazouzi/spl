import readSourceCode from "./utils/read-source-code.ts";
import { tokenize } from "~/lexer/lexer.ts";
import { Parser } from "~/parser/parser.ts";
import compile from "~/compiler/compiler.ts";

const tokens = tokenize(readSourceCode())
const ast = new Parser(tokens).getAST()
compile(ast)

import readSourceCode from "~/utils/read-source-code.ts"
import Lexer from "~/lexer/lexer.ts"
import Parser from "~/parser/parser.ts"
import compile from "~/compiler/compiler.ts"

const tokens = new Lexer(readSourceCode()).tokenize()
const ast = new Parser(tokens).produceAST()
compile(ast)

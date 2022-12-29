import { VariableType } from "~/parser/parser-types.ts"
import { Token } from "~/lexer/lexer-types.ts"
import logError from "~/utils/log-error.ts"

export function getVariableType(type: Token): VariableType {
    switch (type.value) {
        case "int":
            return VariableType.INT
        case "uint":
            return VariableType.UINT
        case "bool":
            return VariableType.BOOLEAN
        case "char":
            return VariableType.CHAR
        case "string":
            return VariableType.STRING
        case "void":
            return VariableType.VOID
        default: {
            logError(type.line, type.colum, `Invalid variable type ${type.value}`)
            Deno.exit(1)
        }
    }
}
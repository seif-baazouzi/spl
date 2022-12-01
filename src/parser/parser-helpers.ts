import { VariableType } from "~/parser/parser-types.ts";
import { Token } from "~/lexer/lexer-types.ts";
import logError from "~/utils/log-error.ts";

export function getVariableType(type: Token): VariableType {
    switch(type.value) {
        case "number":
            return VariableType.NUMBER
        case "bool":
            return VariableType.BOOLEAN
        default: {
            logError(type.line, type.colum, `Invalid variable type ${type.value}`)
            Deno.exit(1)
        }
    }
}
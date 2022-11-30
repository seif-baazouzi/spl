import { VariableType } from "~/parser/parser-types.ts";
import { Token } from "~/lexer/lexer-types.ts";
import logError from "~/utils/log-error.ts";

export function checkBinaryExpression(operation: Token, leftType: VariableType, rightType: VariableType) {
    if(leftType != VariableType.NUMBER || rightType != VariableType.NUMBER) {
        logError(
            operation.line,
            operation.colum,
            "Cannot do binary operation on non number types"
        )
        Deno.exit(1)
    }
}

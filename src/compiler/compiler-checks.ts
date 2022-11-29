import { VariableType } from "~/parser/parser-types.ts";

export function checkBinaryExpression(leftType: VariableType, rightType: VariableType) {
    if(leftType != VariableType.NUMBER || rightType != VariableType.NUMBER) {
        console.log("Cannot do binary operation on non number types")
        Deno.exit(1)
    }
}

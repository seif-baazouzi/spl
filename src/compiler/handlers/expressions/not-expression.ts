import { NotExpression, VariableType } from "~/parser/parser-types.ts"
import { Environment, ExpressionValue } from "~/compiler/compiler-types.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "~/utils/type-to-string.ts"
import { getTokenPosition } from "../../compiler-helpers.ts"

export default function handleNotExpression(not: NotExpression, env: Environment): ExpressionValue {
    const expression = handleExpression(not.expression, env)

    if (expression.type != VariableType.BOOLEAN) {
        logError(
            not.token.line,
            not.token.colum,
            `Expected expression of type boolean after not keyword but got expression of type ${typeToString(expression.type)}`,
        )
        Deno.exit(1)
    }

    return {
        type: VariableType.BOOLEAN,
        assembly: [
            expression.assembly,
            `cmp rax, 0`,
            `je .not_${getTokenPosition(not.token)}`,
            `xor rax, rax`,
            `jmp .not_end_${getTokenPosition(not.token)}`,
            `.not_${getTokenPosition(not.token)}:`,
            `mov rax, 1`,
            `.not_end_${getTokenPosition(not.token)}:`,
        ].join("\n"),
    }
}

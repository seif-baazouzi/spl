import { AsExpression, NodeType, VariableType } from "~/parser/parser-types.ts"
import { Environment, ExpressionValue } from "~/compiler/compiler-types.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "~/utils/type-to-string.ts"
import { isNumberType } from "../../compiler-checks.ts"
import { changeNumberType } from "../../compiler-helpers.ts"

export default function handleAsExpression(asExp: AsExpression, env: Environment): ExpressionValue {
    const expression = handleExpression(asExp.expression, env)

    if (!castingLookUpMap.has(expression.type)) {
        logError(
            asExp.token.line,
            asExp.token.colum,
            `Can not cast expression of type ${typeToString(expression.type)}`,
        )
        Deno.exit(1)
    }

    if (!castingLookUpMap.get(expression.type)?.includes(asExp.type)) {
        logError(
            asExp.token.line,
            asExp.token.colum,
            `Can not cast expression of type ${typeToString(expression.type)} to ${typeToString(asExp.type)}`,
        )
        Deno.exit(1)
    }

    let castOperation = ""

    if (isNumberType(expression.type) && isNumberType(asExp.type)) {
        castOperation = changeNumberType(asExp.type, expression.type)
    } else if (expression.type === VariableType.CHAR && asExp.type === VariableType.INT) {
        castOperation = changeNumberType(VariableType.INT, VariableType.UINT)
    }

    return {
        type: asExp.type,
        assembly: [
            expression.assembly,
            castOperation,
        ].join("\n"),
    }
}

const castingLookUpMap = new Map<VariableType, VariableType[]>([
    [
        VariableType.UINT, [
            VariableType.INT
        ]
    ],
    [
        VariableType.INT, [
            VariableType.UINT
        ]
    ],
    [
        VariableType.CHAR, [
            VariableType.INT,
            VariableType.UINT
        ]
    ],
])

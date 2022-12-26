import { DeclareVariable, Expression, VariableType } from "~/parser/parser-types.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "~/utils/type-to-string.ts"
import { isNumberType } from "~/compiler/compiler-checks.ts"
import { changeNumberType } from "~/compiler/compiler-helpers.ts"

export default function handleDeclareVariable(statement: DeclareVariable, env: Environment): string {
    const result: string[] = []

    let address: number
    let assembly = ""

    // handle constant
    if (statement.isConstant) {
        const expression = handleExpression(statement.expression as Expression, env)
        statement.type = expression.type
        assembly = expression.assembly
        address = env.declareVariable(statement)
    }

    // handle variable
    else {
        address = env.declareVariable(statement)

        // handle variable expression
        if (statement.expression) {
            const expression = handleExpression(statement.expression as Expression, env)
            assembly = expression.assembly

            if (isNumberType(expression.type) && isNumberType(statement.type)) {
                assembly += "\n" + changeNumberType(statement.type, expression.type)
            } else {
                if (expression.type != statement.type) {
                    logError(
                        statement.name.line,
                        statement.name.colum,
                        `Can not assign ${typeToString(expression.type)} to ${typeToString(statement.type)}`
                    )
                    Deno.exit(1)
                }
            }
        }
    }

    result.push(assembly)

    switch (statement.type) {
        case VariableType.BOOLEAN:
            result.push(`mov [rbp-${address}], al`)
            break
        default:
            result.push(`mov [rbp-${address}], rax`)
    }

    return result.join("\n")
}

import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import { AssignVariable } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "~/utils/type-to-string.ts"
import { isNumberType } from "~/compiler/compiler-checks.ts"
import { changeNumberType } from "~/compiler/compiler-helpers.ts"

export default function handleAssignVariable(statement: AssignVariable, env: Environment) {
    // variable is not declared
    if (!env.hasVariable(statement.name.value)) {
        logError(
            statement.name.line,
            statement.name.colum,
            `Variable ${statement.name.value} is not defined!`
        )
        Deno.exit()
    }

    // variable is a constant
    if (env.isConstant(statement.name.value)) {
        logError(
            statement.name.line,
            statement.name.colum,
            `Can not reassign constant ${statement.name.value}!`
        )
        Deno.exit()
    }


    const variable = env.getVariable(statement.name)
    const expression = handleExpression(statement.expression, env)

    // expression type is different than variable type
    if (isNumberType(expression.type) && isNumberType(variable.type)) {
        expression.assembly += "\n" + changeNumberType(variable.type, expression.type)
    } else {
        if (expression.type != variable.type) {
            logError(
                statement.name.line,
                statement.name.colum,
                `Can not assign ${typeToString(expression.type)} to ${typeToString(variable.type)}`
            )
            Deno.exit(1)
        }
    }

    return [
        expression.assembly,
        `mov [rbp+${variable.address}], rax`
    ].join("\n")
}

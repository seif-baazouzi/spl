import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import { AssignVariable } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "~/utils/type-to-string.ts"

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
    if (variable.type != expression.type) {
        logError(
            statement.name.line,
            statement.name.colum,
            `Can not assign ${typeToString(expression.type)} to variable ${statement.name} of type ${typeToString(variable.type)}!`
        )
        Deno.exit()
    }

    return [
        expression.assembly,
        `mov [rbp+${variable.address}], rax`
    ].join("\n")
}

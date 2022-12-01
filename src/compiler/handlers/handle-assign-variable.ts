import { handleExpression } from "~/compiler/handlers/handle-expression.ts";
import { AssignVariable } from "~/parser/parser-types.ts";
import { Environment } from "~/compiler/compiler-types.ts";
import logError from "~/utils/log-error.ts";
import typeToString from "~/utils/type-to-string.ts";

export default function handleAssignVariable(statement: AssignVariable, env: Environment) {
    if(!env.hasVariable(statement.name.value)) {
        logError(
            statement.name.line,
            statement.name.colum,
            `Variable ${statement.name.value} is not defined!`    
        )
        Deno.exit()
    }
    
    if(env.isConstant(statement.name.value)) {
        logError(
            statement.name.line,
            statement.name.colum,
            `Can not reassign constant ${statement.name.value}!`    
        )
        Deno.exit()
    }

    const variable = env.getVariable(statement.name)
    const expression = handleExpression(statement.expression, env)

    if(variable.type != expression.type) {
        logError(
            statement.name.line,
            statement.name.colum,
            `Can not assign ${typeToString(expression.type)} to variable ${statement.name} of type ${typeToString(variable.type)}!`    
        )
        Deno.exit()
    }

    return [
        expression.assembly,
        `mov [ebp+${variable.index*4}], eax`
    ].join("\n")
}
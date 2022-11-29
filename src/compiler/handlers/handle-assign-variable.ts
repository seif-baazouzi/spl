import { handleExpression } from "~/compiler/handlers/handle-expression.ts";
import { AssignVariable } from "~/parser/parser-types.ts";
import { Environment } from "~/compiler/compiler-types.ts";

export default function handleAssignVariable(statement: AssignVariable, env: Environment) {
    if(!env.hasVariable(statement.name)) {
        console.log(`Error: Variable ${statement.name} is not defined!`)
        Deno.exit()
    }
    
    if(env.isConstant(statement.name)) {
        console.log(`Error: Can not reassign constant ${statement.name}!`)
        Deno.exit()
    }

    const variable = env.getVariable(statement.name)
    const expression = handleExpression(statement.expression, env)

    if(variable.type != expression.type) {
        console.log(`Error: Can not reassign variable ${statement.name} to a different type expression!`)
        Deno.exit()
    }

    return [
        expression.assembly,
        `mov [ebp+${variable.index*4}], eax`
    ].join("\n")
}
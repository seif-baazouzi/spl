import { handleExpression } from "~/compiler/handlers/handle-expression.ts";
import { AssignVariable } from "~/parser/parser-types.ts";
import { Environment } from "~/compiler/compiler-types.ts";

export default function handleAssignVariable(statement: AssignVariable, env: Environment) {
    if(!env.hasVariable(statement.name)) {
        console.log(`Error: Variable ${statement.name} is not defined`)
        Deno.exit()
    }
    
    const variable = env.getVariable(statement.name)

    return [
        handleExpression(statement.expression, env),
        `mov [ebp+${variable.index*4}], eax`
    ].join("\n")
}
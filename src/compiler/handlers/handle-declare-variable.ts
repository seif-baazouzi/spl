import { DeclareVariable, Expression } from "~/parser/parser-types.ts"
import { handleExpression } from "~/compiler/handlers/handle-expression.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import logError from "~/utils/log-error.ts"

export default function handleDeclareVariable(statement: DeclareVariable, env: Environment): string {
    const result: string[] = []
    
    let index: number
    let assembly = ""

    if(statement.isConstant) {
        const expression = handleExpression(statement.expression as Expression, env)
        statement.type = expression.type
        assembly = expression.assembly
        index = env.declareVariable(statement)
    } else {
        index = env.declareVariable(statement)

        if(statement.expression) {
            const expression = handleExpression(statement.expression as Expression, env)
            assembly = expression.assembly

            if(expression.type != statement.type) {
                logError(
                    statement.name.line,
                    statement.name.colum,
                    `The assigned expression has different type of the variable type`    
                )
                Deno.exit(1)
            }
        }
    }
        
    result.push(assembly)
    result.push(`mov [ebp+${index*4}], eax`)

    return result.join("\n")
}

import { DeclareVariable } from "~/parser/parser-types.ts"
import { handleExpression } from "~/compiler/handlers/handle-expression.ts"
import { Environment } from "~/compiler/compiler-types.ts"

export default function handleDeclareVariable(statement: DeclareVariable, env: Environment): string {
    const result: string[] = []

    const index = env.declareVariable(statement.name)
    
    if (statement.expression) {
        result.push(handleExpression(statement.expression, env))
        result.push(`mov [ebp+${index*4}], eax`)
    }

    return result.join("\n")
}

import { VariableType, WhileLoop } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import { getTokenPosition } from "~/compiler/compiler-helpers.ts"
import { handleExpression } from "./handle-expression.ts";
import logError from "../../utils/log-error.ts";
import { handleStatement } from "./handle-statement.ts";

export default function handleWhileLoop(statement: WhileLoop, env: Environment): string {
    const assembly: string[] = []
    assembly.push(`.while_condition_${getTokenPosition(statement.whileToken)}:`)
        
    // condition type must be of boolean type
    const condition = handleExpression(statement.condition, env)
    if(condition.type != VariableType.BOOLEAN) {
        logError(
            statement.whileToken.line,
            statement.whileToken.colum,
            "Non boolean condition in while loop!"
        )
        Deno.exit(1)
    }
    
    // condition
    assembly.push(condition.assembly)
    assembly.push(`cmp eax, 0`)
    assembly.push(`jz .endwhile_${getTokenPosition(statement.whileToken)}`)

    // block
    const blockEnv = new Environment(env)
    const blockAssembly: string[] = []
    for(const st of statement.block) {
        blockAssembly.push(handleStatement(st, blockEnv))
    }
    
    assembly.push(`add esp, ${blockEnv.getVariablesCount()*4}`)
    assembly.push(blockAssembly.join("\n"))
    assembly.push(`sub esp, ${blockEnv.getVariablesCount()*4}`)
    assembly.push(`jmp .while_condition_${getTokenPosition(statement.whileToken)}`)
    assembly.push(`.endwhile_${getTokenPosition(statement.whileToken)}:`)
    
    return assembly.join("\n")
}
import { IfStatement, VariableType } from "~/parser/parser-types.ts";
import { Environment } from "~/compiler/compiler-types.ts";
import { handleExpression } from "~/compiler/handlers/handle-expression.ts";
import logError from "~/utils/log-error.ts";
import { handleStatement } from "~/compiler/handlers/handle-statement.ts";
import { getTokenPosition } from "~/compiler/compiler-helpers.ts";

export default function handleIfStatement(statement: IfStatement, env: Environment): string {
    const assembly: string[] = []
    const ifToken = statement.blocks[0].token

    statement.blocks.forEach((block, index) => {
        assembly.push(`.if_block_${index}_${getTokenPosition(ifToken)}:`)
        
        if(block.condition) {
            // condition type must be of boolean type
            const condition = handleExpression(block.condition, env)
            if(condition.type != VariableType.BOOLEAN) {
                logError(
                    block.token.line,
                    block.token.colum,
                    `Non boolean condition in ${index === 0 ? "if" : "elif"} statement!`
                )
                Deno.exit(1)
            }
    
            // condition
            assembly.push(condition.assembly)
            assembly.push(`cmp eax, 0`)
            assembly.push(`jz .if_block_${index+1}_${getTokenPosition(ifToken)}`)
        }

        // block
        const blockEnv = new Environment(env)
        for(const st of block.block) {
            assembly.push(handleStatement(st, blockEnv))
        }
        assembly.push(`jmp .endif_${getTokenPosition(ifToken)}`)
    })

    assembly.push(`.endif_${getTokenPosition(ifToken)}:`)

    return assembly.join("\n")
}

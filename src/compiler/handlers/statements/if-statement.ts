import { IfStatement, VariableType } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import logError from "~/utils/log-error.ts"
import { handleStatement } from "~/compiler/handlers/statements/handle-statement.ts"
import { getTokenPosition } from "~/compiler/compiler-helpers.ts"

export default function handleIfStatement(statement: IfStatement, env: Environment, conditionLoopLabel?: string, endLoopLabel?: string): string {
    const assembly: string[] = []
    const ifToken = statement.blocks[0].token

    statement.blocks.forEach((block, index) => {
        assembly.push(`.if_block_${index}_${getTokenPosition(ifToken)}:`)

        if (block.condition) {
            // condition type must be of boolean type
            const condition = handleExpression(block.condition, env)
            if (condition.type != VariableType.BOOLEAN) {
                logError(
                    block.token.line,
                    block.token.colum,
                    `Non boolean condition in ${index === 0 ? "if" : "elif"} statement!`
                )
                Deno.exit(1)
            }

            // condition
            assembly.push(condition.assembly)
            assembly.push(`cmp rax, 0`)

            if (index === statement.blocks.length - 1) {
                assembly.push(`jz .endif_${getTokenPosition(ifToken)}`)
            } else {
                assembly.push(`jz .if_block_${index + 1}_${getTokenPosition(ifToken)}`)
            }
        }

        // block
        const blockEnv = new Environment(env)
        const blockAssembly: string[] = []
        for (const st of block.block) {
            blockAssembly.push(handleStatement(st, blockEnv, conditionLoopLabel, endLoopLabel))
        }

        assembly.push(`add rsp, ${blockEnv.getVariablesSize()}`) // allocate variables memory
        assembly.push(blockAssembly.join("\n"))
        assembly.push(`sub rsp, ${blockEnv.getVariablesSize()}`) // free variables memory
        assembly.push(`jmp .endif_${getTokenPosition(ifToken)}`)
    })

    assembly.push(`.endif_${getTokenPosition(ifToken)}:`)

    return assembly.join("\n")
}

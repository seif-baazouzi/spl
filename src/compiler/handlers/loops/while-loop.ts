import { NodeType, VariableType, WhileLoop } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import { getTokenPosition } from "~/compiler/compiler-helpers.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import logError from "~/utils/log-error.ts"
import { handleStatement } from "~/compiler/handlers/statements/handle-statement.ts"

export default function handleWhileLoop(statement: WhileLoop, env: Environment): string {
    const assembly: string[] = []
    assembly.push(`.while_condition_${getTokenPosition(statement.whileToken)}:`)

    // condition type must be of boolean type
    const condition = handleExpression(statement.condition, env)
    if (condition.type != VariableType.BOOLEAN) {
        logError(
            statement.whileToken.line,
            statement.whileToken.colum,
            "Non boolean condition in while loop!"
        )
        Deno.exit(1)
    }

    // condition
    assembly.push(condition.assembly)
    assembly.push(`cmp rax, 0`)
    assembly.push(`jz .endwhile_${getTokenPosition(statement.whileToken)}`)

    // block
    const blockEnv = new Environment(env)
    const blockAssembly: string[] = []
    for (const st of statement.block) {
        switch (st.kind) {
            case NodeType.BREAK:
                blockAssembly.push(`jmp .endwhile_${getTokenPosition(statement.whileToken)}`)
                break
            default:
                blockAssembly.push(
                    handleStatement(
                        st,
                        blockEnv,
                        `.while_condition_${getTokenPosition(statement.whileToken)}`,
                        `.endwhile_${getTokenPosition(statement.whileToken)}`
                    )
                )
        }
    }

    assembly.push(`add rsp, ${blockEnv.getVariablesSize()}`) // allocate variables memory
    assembly.push(blockAssembly.join("\n"))
    assembly.push(`sub rsp, ${blockEnv.getVariablesSize()}`) // free variables memory

    assembly.push(`jmp .while_condition_${getTokenPosition(statement.whileToken)}`)
    assembly.push(`.endwhile_${getTokenPosition(statement.whileToken)}:`)

    return assembly.join("\n")
}
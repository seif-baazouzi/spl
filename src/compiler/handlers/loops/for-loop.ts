import { ForLoop, VariableType } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import { getTokenPosition } from "~/compiler/compiler-helpers.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import logError from "~/utils/log-error.ts"
import { handleStatement } from "~/compiler/handlers/statements/handle-statement.ts"

export default function handleForLoop(statement: ForLoop, env: Environment): string {
    const assembly: string[] = []
    const blockEnv = new Environment(env)

    // initialization
    assembly.push(
        handleStatement(
            statement.initialization,
            blockEnv,
        )
    )

    // condition type must be of boolean type
    const condition = handleExpression(statement.condition, blockEnv)
    if (condition.type != VariableType.BOOLEAN) {
        logError(
            statement.forToken.line,
            statement.forToken.colum,
            "Non boolean condition in for loop!"
        )
        Deno.exit(1)
    }

    // condition
    assembly.push(`.for_condition_${getTokenPosition(statement.forToken)}:`)
    assembly.push(condition.assembly)
    assembly.push(`cmp rax, 0`)
    assembly.push(`jz .endfor_${getTokenPosition(statement.forToken)}`)

    // block
    const blockAssembly: string[] = []
    for (const st of statement.block) {
        blockAssembly.push(
            handleStatement(
                st,
                blockEnv,
                `.for_update_${getTokenPosition(statement.forToken)}`,
                `.endfor_${getTokenPosition(statement.forToken)}`
            )
        )
    }

    // update
    const update = handleStatement(statement.update, blockEnv)

    assembly.push(`add rsp, ${blockEnv.getVariablesSize()}`) // allocate variables memory
    assembly.push(blockAssembly.join("\n"))
    assembly.push(`sub rsp, ${blockEnv.getVariablesSize()}`) // free variables memory

    assembly.push(`.for_update_${getTokenPosition(statement.forToken)}:`)
    assembly.push(update)

    assembly.push(`jmp .for_condition_${getTokenPosition(statement.forToken)}`)
    assembly.push(`.endfor_${getTokenPosition(statement.forToken)}:`)

    return assembly.join("\n")
}

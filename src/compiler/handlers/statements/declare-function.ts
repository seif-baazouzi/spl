import { DeclareFunction, VariableType } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import { handleStatement } from "~/compiler/handlers/statements/handle-statement.ts"
import { getTokenPosition } from "~/compiler/compiler-helpers.ts"

export default function handleDeclareFunction(statement: DeclareFunction, env: Environment): string {
    const result: string[] = []

    env.declareFunction(statement)

    const functionENV = new Environment(env)

    statement.argumentsList.forEach((arg, index) => {
        const address = functionENV.declareVariable(arg)
        result.push(`mov rax, [rbp+${8 * index + 16}]`) // 16 bytes for old rbp value and the return address in the stack 
        switch (arg.type) {
            case VariableType.BOOLEAN:
                result.push(`mov [rbp-${address}], al`)
                break
            default:
                result.push(`mov [rbp-${address}], rax`)
        }
    })

    statement.block.forEach(st => {
        const statementAssembly = handleStatement(st, functionENV)
        result.push(statementAssembly)
    })

    result.unshift(`sub rsp, ${functionENV.getVariablesSize()}`)
    result.unshift(`mov rbp, rsp`)
    result.unshift(`push rbp`)
    result.unshift(`_${statement.name.value}_${getTokenPosition(statement.name)}:`)

    result.push(".return:")
    result.push(`add rsp, ${functionENV.getVariablesSize()}`)
    result.push(`pop rbp`)
    result.push("ret")
    return result.join("\n")
}

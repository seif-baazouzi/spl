import { DeclareFunction } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import { handleStatement } from "~/compiler/handlers/statements/handle-statement.ts"
import { getTokenPosition } from "../../compiler-helpers.ts"

export default function handleDeclareFunction(statement: DeclareFunction, env: Environment): string {
    const result: string[] = []

    env.declareFunction(statement)

    const functionENV = new Environment(env)
    statement.argumentsList.forEach(arg => functionENV.declareVariable(arg))

    statement.block.forEach(st => {
        const statementAssembly = handleStatement(st, functionENV)
        result.push(statementAssembly)
    })

    result.unshift(`add rsp, ${functionENV.getVariablesSize()}`)
    result.unshift("mov rbp, rsp")
    result.unshift("push rbp")
    result.unshift(`_${statement.name.value}_${getTokenPosition(statement.name)}:`)

    result.push(".return:")
    result.push(`sub rsp, ${functionENV.getVariablesSize()}`)
    result.push(`pop rbp`)
    result.push("ret")
    return result.join("\n")
}

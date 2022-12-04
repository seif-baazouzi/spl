import { IfStatement, VariableType } from "~/parser/parser-types.ts";
import { Environment } from "~/compiler/compiler-types.ts";
import { handleExpression } from "./handle-expression.ts";
import logError from "~/utils/log-error.ts";
import { handleStatement } from "~/compiler/handlers/handle-statement.ts";
import { getTokenPosition } from "../compiler-helpers.ts";

export default function handleIfStatement(statement: IfStatement, env: Environment): string {
    const assembly: string[] = []
    
    // condition type must be of boolean type
    const condition = handleExpression(statement.condition, env)
    if(condition.type != VariableType.BOOLEAN) {
        logError(
            statement.ifToken.line,
            statement.ifToken.colum,
            "Non boolean condition in if statement!"
        )
        Deno.exit(1)
    }

    // condition
    assembly.push(condition.assembly)
    assembly.push(`cmp eax, 0`)
    if(statement.elseToken) {
        assembly.push(`jz .else_${getTokenPosition(statement.ifToken)}`)
    } else {
        assembly.push(`jz .endif_${getTokenPosition(statement.ifToken)}`)
    }
    
    // if block
    const ifStatementEnv = new Environment(env)
    for(const st of statement.ifBlock) {
        assembly.push(handleStatement(st, ifStatementEnv))
    }
    if(statement.elseBlock) assembly.push(`jmp .endif_${getTokenPosition(statement.ifToken)}`)
    
    // else block
    if(statement.elseBlock) {
        assembly.push(`.else_${getTokenPosition(statement.ifToken)}:`)
        for(const st of statement.elseBlock) {
            assembly.push(handleStatement(st, ifStatementEnv))
        }
    }

    assembly.push(`.endif_${getTokenPosition(statement.ifToken)}:`)

    return assembly.join("\n")
}

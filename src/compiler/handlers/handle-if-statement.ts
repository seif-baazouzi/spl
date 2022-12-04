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
            statement.token.line,
            statement.token.colum,
            "Non boolean condition in if statement!"
        )
        Deno.exit(1)
    }

    assembly.push(condition.assembly)
    assembly.push(`cmp eax, 0`)
    assembly.push(`jz .endif_${getTokenPosition(statement.token)}`)
    
    // get block assembly
    const ifStatementEnv = new Environment(env)
    for(const st of statement.block) {
        assembly.push(handleStatement(st, ifStatementEnv))
    }
    assembly.push(`.endif_${getTokenPosition(statement.token)}:`)

    return assembly.join("\n")
}

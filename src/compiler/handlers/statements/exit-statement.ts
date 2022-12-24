import { ExitStatement, VariableType } from "~/parser/parser-types.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "../../../utils/type-to-string.ts"

export default function handleExit(st: ExitStatement, env: Environment) {
    const expression = handleExpression(st.expression, env)
    if (expression.type != VariableType.UINT) {
        logError(
            st.token.line,
            st.token.colum,
            `Expected expression of type uint after exit statement but got expression of type ${typeToString(expression.type)}`,
        )
        Deno.exit()
    }

    return [
        "mov rdi, rax",
        "mov rax, 60",
        "syscall",
    ].join("\n")
}

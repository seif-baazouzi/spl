import { Expression, SyscallExpression, VariableType } from "~/parser/parser-types.ts"
import { Environment, ExpressionValue } from "~/compiler/compiler-types.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "../../../utils/type-to-string.ts"

export function handleSyscallExpression(st: SyscallExpression, env: Environment): ExpressionValue {
    const rax = handleArgument(st, st.rax, "first", env)
    const rdi = handleArgument(st, st.rdi, "second", env)
    const rsi = handleArgument(st, st.rsi, "third", env)
    const rdx = handleArgument(st, st.rdx, "forth", env)

    return {
        type: VariableType.UINT,
        assembly: [
            rdi.assembly,
            "mov rdi, rax",

            rsi.assembly,
            "mov rsi, rax",

            rdx.assembly,
            "mov rdx, rax",

            rax.assembly,
            "syscall",
        ].join("\n")
    }
}

function handleArgument(st: SyscallExpression, expression: Expression, argumentPosition: string, env: Environment): ExpressionValue {
    const result = handleExpression(expression, env)
    if (result.type != VariableType.UINT) {
        logError(
            st.token.line,
            st.token.colum,
            `Expected expression of type uint in ${argumentPosition} argument of syscall but got expression of type ${typeToString(result.type)}`,
        )
        Deno.exit()
    }

    return result
}

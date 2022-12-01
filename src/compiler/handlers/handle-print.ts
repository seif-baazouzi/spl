import { PrintStatement, VariableType } from "~/parser/parser-types.ts"
import { handleExpression } from "~/compiler/handlers/handle-expression.ts"
import { Environment } from "~/compiler/compiler-types.ts"

export default function handlePrint(st: PrintStatement, env: Environment) {
    const expression = handleExpression(st.expression, env)
    return [
        expression.assembly,
        "push eax",
        `call ${expression.type === VariableType.NUMBER ? "_print_number" : "_print_boolean"}`,
    ].join("\n")
}

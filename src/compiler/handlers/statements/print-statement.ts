import { PrintStatement, VariableType } from "~/parser/parser-types.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import { Environment } from "~/compiler/compiler-types.ts"

export default function handlePrint(st: PrintStatement, env: Environment) {
    const expression = handleExpression(st.expression, env)
    return [
        expression.assembly,
        "push rax",
        `call ${getPrintFunction(expression.type)}`,
        `add rsp, 8`,
    ].join("\n")
}

function getPrintFunction(type: VariableType): string {
    return type === VariableType.BOOLEAN ? "_print_boolean" : "_print_number"
}

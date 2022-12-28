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
    switch (type) {
        case VariableType.BOOLEAN:
            return "_print_boolean"
        case VariableType.CHAR:
            return "_print_char"
        case VariableType.INT:
            return "_print_int"
        default:
            return "_print_uint"

    }
}

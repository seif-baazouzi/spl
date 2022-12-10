import { BinaryExpression, Boolean, Expression, Identifier, NodeType, Numerical } from "~/parser/parser-types.ts"
import { VariableType } from "~/parser/parser-types.ts"
import { ExpressionValue, Environment } from "~/compiler/compiler-types.ts"
import { handleBinaryExpression } from "~/compiler/handlers/expressions/binary-expression.ts"

export function handleExpression(expression: Expression, env: Environment): ExpressionValue {
    switch (expression.kind) {
        case NodeType.NUMBER: {
            const st = expression as Numerical
            return {
                type: VariableType.NUMBER,
                assembly: [
                    `push rax`,
                    `mov rax, ${st.number.value}`,
                ].join("\n")
            }
        }
        case NodeType.BOOLEAN: {
            const st = expression as Boolean
            return {
                type: VariableType.BOOLEAN,
                assembly: [
                    `push rax`,
                    `mov rax, ${st.value ? 1 : 0}`,
                ].join("\n")
            }
        }
        case NodeType.IDENTIFIER: {
            const st = expression as Identifier
            const variable = env.getVariable(st.symbol)

            let movInstruction = ""

            switch (variable.type) {
                case VariableType.BOOLEAN:
                    movInstruction = `movzx rax, byte [rbp+${variable.address}]`
                    break
                default:
                    movInstruction = `mov rax, [rbp+${variable.address}]`
            }

            return {
                type: variable.type,
                assembly: [
                    `push rax`,
                    movInstruction,
                ].join("\n")
            }
        }
        case NodeType.BINARY_EXPRESSION: {
            const st = expression as BinaryExpression
            return handleBinaryExpression(st, env)
        }
        default: {
            console.log(`DEBUG: Unexpected NodeType `, expression)
            Deno.exit(1)
        }
    }
}

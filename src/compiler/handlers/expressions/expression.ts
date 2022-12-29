import { AsExpression, BinaryExpression, Boolean, Char, Expression, FunctionCall, Identifier, NodeType, NotExpression, Numerical, String, SyscallExpression } from "~/parser/parser-types.ts"
import { VariableType } from "~/parser/parser-types.ts"
import { ExpressionValue, Environment } from "~/compiler/compiler-types.ts"
import { handleBinaryExpression } from "~/compiler/handlers/expressions/binary-expression.ts"
import { handleSyscallExpression } from "~/compiler/handlers/expressions/syscall-expression.ts"
import handleFunctionCall from "~/compiler/handlers/expressions/function-call.ts"
import handleNotExpression from "~/compiler/handlers/expressions/not-expression.ts"
import handleAsExpression from "./handle-as-expression.ts"

export function handleExpression(expression: Expression, env: Environment): ExpressionValue {
    switch (expression.kind) {
        case NodeType.NUMBER: {
            const st = expression as Numerical
            return {
                type: VariableType.UINT,
                assembly: `mov rax, ${st.number.value}`,
            }
        }
        case NodeType.CHAR: {
            const st = expression as Char
            return {
                type: VariableType.CHAR,
                assembly: `mov rax, ${st.char.value.charCodeAt(0)}`,
            }
        }
        case NodeType.STRING: {
            const st = expression as String
            return {
                type: VariableType.STRING,
                assembly: [
                    `push ${st.str.value.length + 8}`,
                    `call _allocate`,
                    `add rsp, 8`,
                    `mov rbx, ${st.str.value.length}`,
                    `mov [pointer+rax], rbx`,
                    ...st.str.value.split("").map((char, index) => {
                        return `mov [pointer+rax+${8 + index}], byte ${char.charCodeAt(0)}`
                    })
                ].join("\n")
            }
        }
        case NodeType.BOOLEAN: {
            const st = expression as Boolean
            return {
                type: VariableType.BOOLEAN,
                assembly: `mov rax, ${st.value ? 1 : 0}`,
            }
        }
        case NodeType.IDENTIFIER: {
            const st = expression as Identifier
            const variable = env.getVariable(st.symbol)

            let movInstruction = ""

            switch (variable.type) {
                case VariableType.BOOLEAN:
                    movInstruction = `movzx rax, byte [rbp-${variable.address}]`
                    break
                default:
                    movInstruction = `mov rax, [rbp-${variable.address}]`
            }

            return {
                type: variable.type,
                assembly: movInstruction,
            }
        }
        case NodeType.BINARY_EXPRESSION: {
            const st = expression as BinaryExpression
            return handleBinaryExpression(st, env)
        }
        case NodeType.NOT_EXPRESSION: {
            const st = expression as NotExpression
            return handleNotExpression(st, env)
        }
        case NodeType.AS_EXPRESSION: {
            const st = expression as AsExpression
            return handleAsExpression(st, env)
        }
        case NodeType.FUNCTION_CALL: {
            const st = expression as FunctionCall
            return handleFunctionCall(st, env)
        }
        case NodeType.SYSCALL: {
            const st = expression as SyscallExpression
            return handleSyscallExpression(st, env)
        }
        default: {
            console.log(expression)
            throw new Error(`DEBUG: Unexpected NodeType`)
        }
    }
}

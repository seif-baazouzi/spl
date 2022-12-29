import { TokenType } from "~/lexer/lexer-types.ts"
import { BinaryExpression, VariableType } from "~/parser/parser-types.ts"
import { getTokenPosition } from "~/compiler/compiler-helpers.ts"
import { Environment, ExpressionValue } from "~/compiler/compiler-types.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import { checkBinaryExpression } from "~/compiler/compiler-checks.ts"

export function handleBinaryExpression(expression: BinaryExpression, env: Environment): ExpressionValue {
    const result = []

    const rightExpression = handleExpression(expression.right, env)
    const leftExpression = handleExpression(expression.left, env)

    const returnType = checkBinaryExpression(expression.operation, leftExpression.type, rightExpression.type)

    result.push(rightExpression.assembly)
    result.push(`push rax`)
    result.push(leftExpression.assembly)
    result.push("pop rbx")

    switch (expression.operation.type) {
        case TokenType.PLUS: {
            result.push("add rax, rbx")
            break
        }
        case TokenType.MINUS: {
            result.push("sub rax, rbx")
            break
        }
        case TokenType.MULTIPLY: {
            result.push("mul rbx")
            break
        }
        case TokenType.DIVIDE: {
            result.push("div rbx")
            break
        }
        case TokenType.MODULO: {
            result.push("div rbx")
            result.push("mov rax, rdx")
            break
        }
        case TokenType.EQUALS_TO: {
            if (leftExpression.type === VariableType.STRING) {
                result.push("push rax")
                result.push("push rbx")
                result.push("call _compare_string")
                result.push("add rsp, 16")
            } else {
                result.push("cmp rax, rbx")
                result.push(`jz .true_${getTokenPosition(expression.operation)}`)
                result.push("mov rax, 0")
                result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
                result.push(`.true_${getTokenPosition(expression.operation)}:`)
                result.push("mov rax, 1")
                result.push(`.end_${getTokenPosition(expression.operation)}:`)
            }

            break
        }
        case TokenType.DEFERENT_TO: {
            if (leftExpression.type === VariableType.STRING) {
                result.push("push rax")
                result.push("push rbx")
                result.push("call _compare_string")
                result.push("add rsp, 16")
                result.push(`cmp rax, 0`)
                result.push(`je .not_${getTokenPosition(expression.operation)}`)
                result.push(`xor rax, rax`)
                result.push(`jmp .not_end_${getTokenPosition(expression.operation)}`)
                result.push(`.not_${getTokenPosition(expression.operation)}:`)
                result.push(`mov rax, 1`)
                result.push(`.not_end_${getTokenPosition(expression.operation)}:`)
            } else {
                result.push("cmp rax, rbx")
                result.push(`jz .false_${getTokenPosition(expression.operation)}`)
                result.push("mov rax, 1")
                result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
                result.push(`.false_${getTokenPosition(expression.operation)}:`)
                result.push("mov rax, 0")
                result.push(`.end_${getTokenPosition(expression.operation)}:`)
            }
            break
        }
        case TokenType.GRATER_THEN: {
            result.push("cmp rax, rbx")
            result.push(`jg .true_${getTokenPosition(expression.operation)}`)
            result.push("mov rax, 0")
            result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
            result.push(`.true_${getTokenPosition(expression.operation)}:`)
            result.push("mov rax, 1")
            result.push(`.end_${getTokenPosition(expression.operation)}:`)
            break
        }
        case TokenType.GRATER_OR_EQUALS: {
            result.push("cmp rax, rbx")
            result.push(`jge .true_${getTokenPosition(expression.operation)}`)
            result.push("mov rax, 0")
            result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
            result.push(`.true_${getTokenPosition(expression.operation)}:`)
            result.push("mov rax, 1")
            result.push(`.end_${getTokenPosition(expression.operation)}:`)
            break
        }
        case TokenType.LESS_THEN: {
            result.push("cmp rax, rbx")
            result.push(`jl .true_${getTokenPosition(expression.operation)}`)
            result.push("mov rax, 0")
            result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
            result.push(`.true_${getTokenPosition(expression.operation)}:`)
            result.push("mov rax, 1")
            result.push(`.end_${getTokenPosition(expression.operation)}:`)
            break
        }
        case TokenType.LESS_OR_EQUALS: {
            result.push("cmp rax, rbx")
            result.push(`jle .true_${getTokenPosition(expression.operation)}`)
            result.push("mov rax, 0")
            result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
            result.push(`.true_${getTokenPosition(expression.operation)}:`)
            result.push("mov rax, 1")
            result.push(`.end_${getTokenPosition(expression.operation)}:`)
            break
        }
        case TokenType.AND: {
            result.push("and rax, rbx")
            break
        }
        case TokenType.OR: {
            result.push("or rax, rbx")
            break
        }
        case TokenType.XOR: {
            result.push("xor rax, rbx")
            break
        }
    }

    return {
        type: returnType,
        assembly: result.join("\n")
    }
}

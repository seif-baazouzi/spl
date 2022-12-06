import { TokenType } from "~/lexer/lexer-types.ts"
import { BinaryExpression, Boolean, Expression, Identifier, NodeType, Numerical } from "~/parser/parser-types.ts"
import { VariableType } from "~/parser/parser-types.ts"
import { checkBinaryExpression } from "~/compiler/compiler-checks.ts"
import { ExpressionValue, Environment } from "~/compiler/compiler-types.ts"
import { getTokenPosition } from "~/compiler/compiler-helpers.ts"

export function handleExpression(expression: Expression, env: Environment): ExpressionValue {
    switch(expression.kind) {
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
            return {
                type: variable.type,
                assembly: [
                    `push rax`,
                    `mov rax, [rbp+${variable.index*8}]`,
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

export function handleBinaryExpression(expression: BinaryExpression, env: Environment): ExpressionValue {
    const result = []

    const rightExpression = handleExpression(expression.right, env)
    const leftExpression = handleExpression(expression.left, env)

    const returnType = checkBinaryExpression(expression.operation, leftExpression.type, rightExpression.type)
    
    result.push(rightExpression.assembly)
    result.push(leftExpression.assembly)
    result.push("pop rbx")
    
    switch(expression.operation.type) {
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
            result.push("cmp rax, rbx")
            result.push(`jz .true_${getTokenPosition(expression.operation)}`)
            result.push("mov rax, 0")
            result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
            result.push(`.true_${getTokenPosition(expression.operation)}:`)
            result.push("mov rax, 1")
            result.push(`.end_${getTokenPosition(expression.operation)}:`)
            break
        }
        case TokenType.DEFERENT_TO: {
            result.push("cmp rax, rbx")
            result.push(`jz .false_${getTokenPosition(expression.operation)}`)
            result.push("mov rax, 1")
            result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
            result.push(`.false_${getTokenPosition(expression.operation)}:`)
            result.push("mov rax, 0")
            result.push(`.end_${getTokenPosition(expression.operation)}:`)
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

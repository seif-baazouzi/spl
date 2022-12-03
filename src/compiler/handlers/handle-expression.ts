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
                    `push eax`,
                    `mov eax, ${st.number.value}`,
                ].join("\n")
            }
        }
        case NodeType.BOOLEAN: {
            const st = expression as Boolean
            return {
                type: VariableType.BOOLEAN,
                assembly: [
                    `push eax`,
                    `mov eax, ${st.value ? 1 : 0}`,
                ].join("\n")
            }
        }
        case NodeType.IDENTIFIER: {
            const st = expression as Identifier
            const variable = env.getVariable(st.symbol)
            return {
                type: variable.type,
                assembly: [
                    `push eax`,
                    `mov eax, [ebp+${variable.index*4}]`,
                ].join("\n")
            }   
        }
        case NodeType.BINARY_EXPRESSION: {
            const st = expression as BinaryExpression
            return handleBinaryExpression(st, env)
        }
        default: {
            console.log(`DEBUG: Unexpected NodeType ${expression}`)
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
    result.push("pop ebx")
    
    switch(expression.operation.type) {
        case TokenType.PLUS: {
            result.push("add eax, ebx")
            break
        }
        case TokenType.MINUS: {
            result.push("sub eax, ebx")
            break
        }
        case TokenType.MULTIPLY: {
            result.push("mul ebx")
            break
        }
        case TokenType.DIVIDE: {
            result.push("div ebx")
            break
        }
        case TokenType.MODULO: {
            result.push("div ebx")
            result.push("mov eax, edx")
            break
        }
        case TokenType.EQUALS_TO: {
            result.push("cmp eax, ebx")
            result.push(`jz .true_${getTokenPosition(expression.operation)}`)
            result.push("mov eax, 0")
            result.push(`jmp .end_${getTokenPosition(expression.operation)}`)
            result.push(`.true_${getTokenPosition(expression.operation)}:`)
            result.push("mov eax, 1")
            result.push(`.end_${getTokenPosition(expression.operation)}:`)
            break
        }
    }

    return {
        type: returnType,
        assembly: result.join("\n")
    } 
}

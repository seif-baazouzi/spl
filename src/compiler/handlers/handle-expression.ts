import { TokenType } from "~/lexer/lexer-types.ts"
import { BinaryExpression, Expression, Identifier, NodeType, Numerical } from "~/parser/parser-types.ts"
import { Environment } from "../compiler-types.ts"

export function handleExpression(expression: Expression, env: Environment): string {
    switch(expression.kind) {
        case NodeType.NUMBER: {
            const st = expression as Numerical
            return [
                `push eax`,
                `mov eax, ${st.value}`,
            ].join("\n")
        }
        case NodeType.IDENTIFIER: {
            const st = expression as Identifier
            const variable = env.getVariable(st.symbol)
            console.log(variable);
                        
            return [
                `push eax`,
                `mov eax, [ebp+${variable.index*4}]`,
            ].join("\n")
        }
        case NodeType.BINARY_EXPRESSION: {
            const st = expression as BinaryExpression
            return handleBinaryExpression(st, env)
        }
        default: {
            console.log("Unexpected NodeType")
            Deno.exit(1)
        }
    }
}

export function handleBinaryExpression(expression: BinaryExpression, env: Environment): string {
    const result = []

    result.push(handleExpression(expression.right, env))
    result.push(handleExpression(expression.left, env))
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
    }

    return result.join("\n")
}

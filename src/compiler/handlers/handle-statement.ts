import { TokenType } from "~/lexer/lexer-types.ts"
import { BinaryExpression, NodeType, Numerical, Statement } from "~/parser/parser-types.ts"

export function handleStatement(statement: Statement): string {
    switch(statement.kind) {
        case NodeType.NUMBER: {
            const st = statement as Numerical
            return [
                `push eax`,
                `mov eax, ${st.value}`,
            ].join("\n")
        }
        case NodeType.IDENTIFIER: {
            console.log("Compiling NodeType.IDENTIFIER Not Implemented yet!");
            Deno.exit(1)
            break
        }
        case NodeType.BINARY_EXPRESSION: {
            const st = statement as BinaryExpression
            return handleBinaryExpression(st)
        }
        default: {
            console.log("Unexpected NodeType");
            Deno.exit(1)
        }
    }
}

export function handleBinaryExpression(statement: BinaryExpression): string {
    const result = []

    result.push(handleStatement(statement.right))
    result.push(handleStatement(statement.left))
    result.push("pop ebx")
    
    switch(statement.operation.type) {
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

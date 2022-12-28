import { VariableType } from "~/parser/parser-types.ts"
import { Token, TokenType } from "~/lexer/lexer-types.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "~/utils/type-to-string.ts"

export function checkBinaryExpression(operation: Token, leftType: VariableType, rightType: VariableType): VariableType {
    switch (operation.type) {
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.MULTIPLY:
        case TokenType.DIVIDE:
        case TokenType.MODULO: {
            if (!isNumberType(leftType) || !isNumberType(rightType)) {
                logError(
                    operation.line,
                    operation.colum,
                    "Cannot do math operations on non number types"
                )
                Deno.exit(1)
            }

            return VariableType.UINT
        }
        case TokenType.EQUALS_TO:
        case TokenType.DEFERENT_TO: {
            if (leftType != rightType) {
                logError(
                    operation.line,
                    operation.colum,
                    `Cannot compare ${typeToString(leftType)} and ${typeToString(rightType)}`
                )
                Deno.exit(1)
            }

            return VariableType.BOOLEAN
        }
        case TokenType.GRATER_THEN:
        case TokenType.GRATER_OR_EQUALS:
        case TokenType.LESS_THEN:
        case TokenType.LESS_OR_EQUALS: {
            if (!isNumberType(leftType) || !isNumberType(rightType)) {
                logError(
                    operation.line,
                    operation.colum,
                    `Cannot compare ${typeToString(leftType)} and ${typeToString(rightType)}`
                )
                Deno.exit(1)
            }

            if (leftType != rightType) {
                logError(
                    operation.line,
                    operation.colum,
                    `Cannot compare ${typeToString(leftType)} and ${typeToString(rightType)}`
                )
                Deno.exit(1)
            }

            return VariableType.BOOLEAN
        }
        case TokenType.AND:
        case TokenType.OR:
        case TokenType.XOR: {
            if (leftType != VariableType.BOOLEAN || rightType != VariableType.BOOLEAN) {
                logError(
                    operation.line,
                    operation.colum,
                    `Cannot compare ${typeToString(leftType)} and ${typeToString(rightType)}`
                )
                Deno.exit(1)
            }

            return VariableType.BOOLEAN
        }
        default: {
            console.log(`DEBUG: Invalid operation ${operation}`)
            Deno.exit(1)
        }
    }
}

export function isNumberType(type: VariableType): boolean {
    return type === VariableType.UINT || type === VariableType.INT
}

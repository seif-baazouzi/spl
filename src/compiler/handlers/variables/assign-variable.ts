import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import { AssignVariable } from "~/parser/parser-types.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import logError from "~/utils/log-error.ts"
import typeToString from "~/utils/type-to-string.ts"
import { isNumberType } from "~/compiler/compiler-checks.ts"
import { changeNumberType } from "~/compiler/compiler-helpers.ts"
import { Token, TokenType } from "~/lexer/lexer-types.ts"

export default function handleAssignVariable(statement: AssignVariable, env: Environment) {
    // variable is not declared
    if (!env.hasVariable(statement.name.value)) {
        logError(
            statement.name.line,
            statement.name.colum,
            `Variable ${statement.name.value} is not defined!`
        )
        Deno.exit()
    }

    // variable is a constant
    if (env.isConstant(statement.name.value)) {
        logError(
            statement.name.line,
            statement.name.colum,
            `Can not reassign constant ${statement.name.value}!`
        )
        Deno.exit()
    }


    const variable = env.getVariable(statement.name)
    const expression = handleExpression(statement.expression, env)

    // expression type is different than variable type
    if (isNumberType(expression.type) && isNumberType(variable.type)) {
        expression.assembly += "\n" + changeNumberType(variable.type, expression.type)
    } else {
        if (expression.type != variable.type) {
            logError(
                statement.name.line,
                statement.name.colum,
                `Can not assign ${typeToString(expression.type)} to ${typeToString(variable.type)}`
            )
            Deno.exit(1)
        }
    }

    return [
        expression.assembly,
        getOperationAssembly(statement.operation, variable.address),
    ].join("\n")
}

function getOperationAssembly(operation: Token, variableAddress: number): string {
    switch (operation.type) {
        case TokenType.EQUAL:
            return `mov [rbp+${variableAddress}], rax`
        case TokenType.PLUS_EQUAL:
            return `add [rbp+${variableAddress}], rax`
        case TokenType.MINUS_EQUAL:
            return `sub [rbp+${variableAddress}], rax`
        case TokenType.MULTIPLY_EQUAL:
            return [
                `mov rbx, [rbp+${variableAddress}]`,
                `mul rbx`,
                `mov [rbp+${variableAddress}], rax`,
            ].join("\n")
        case TokenType.DIVIDE_EQUAL:
            return [
                `mov rbx, rax`,
                `mov rax, [rbp+${variableAddress}]`,
                `div rbx`,
                `mov [rbp+${variableAddress}], rax`,
            ].join("\n")
        case TokenType.MODULO_EQUAL:
            return [
                `mov rbx, rax`,
                `mov rax, [rbp+${variableAddress}]`,
                `div rbx`,
                `mov [rbp+${variableAddress}], rdx`,
            ].join("\n")
        default: {
            logError(
                operation.line,
                operation.colum,
                `DEBUG: unexpected token ${operation.value}`
            )
            Deno.exit(1)
        }
    }
}

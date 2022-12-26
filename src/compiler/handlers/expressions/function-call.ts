import { Environment, ExpressionValue } from "~/compiler/compiler-types.ts"
import { FunctionCall } from "~/parser/parser-types.ts"
import logError from "../../../utils/log-error.ts"
import typeToString from "../../../utils/type-to-string.ts"
import { handleExpression } from "./expression.ts"

export default function handleFunctionCall(expression: FunctionCall, env: Environment): ExpressionValue {
    const func = env.getFunction(expression.functionName)

    // check parameters
    if (expression.parameters.length !== func.argumentsList.length) {
        logError(
            expression.functionName.line,
            expression.functionName.colum,
            `Function ${expression.functionName.value} has ${func.argumentsList.length} arguments but it got ${expression.parameters.length} parameters!`,
        )
        Deno.exit(1)
    }

    const parameters = expression.parameters.map(p => handleExpression(p, env))
    for (let i = 0; i < parameters.length; i++) {
        if (parameters[i].type != func.argumentsList[i]) {
            logError(
                expression.functionName.line,
                expression.functionName.colum,
                `In the parameter number ${i + 1} in function ${expression.functionName.value} it's of type ${typeToString(func.argumentsList[i])} but it got expression of type ${typeToString(parameters[i].type)}`,
            )
            Deno.exit(1)
        }
    }

    // function call
    const result: string[] = []

    parameters.reverse().forEach(p => {
        result.push(p.assembly)
        result.push("push rax")
    })

    result.push(`call ${func.name}`)
    result.push(`sub rsp, ${parameters.length * 8}`)

    return {
        type: func.returnType,
        assembly: result.join("\n")
    }
}

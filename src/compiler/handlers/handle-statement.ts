import { AssignVariable, DeclareVariable, DumpStatement, Expression, NodeType, Statement } from "~/parser/parser-types.ts"
import handleDeclareVariable from "~/compiler/handlers/handle-declare-variable.ts"
import { handleExpression } from "~/compiler/handlers/handle-expression.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import handleAssignVariable from "~/compiler/handlers/handle-assign-variable.ts"

export function handleStatement(statement: Statement, env: Environment): string {
    switch(statement.kind) {
        case NodeType.DECLARE_VARIABLE: {            
            const st = statement as DeclareVariable
            return handleDeclareVariable(st, env)
        }
        case NodeType.ASSIGN_VARIABLE: {            
            const st = statement as AssignVariable
            return handleAssignVariable(st, env)
        }
        case NodeType.DUMP: {
            const st = statement as DumpStatement
            const expression = handleExpression(st.expression, env)
            return [
                expression,
                "push eax",
                "call dump",
            ].join("\n")
        }
        default: {
            const st = statement as Expression
            return handleExpression(st, env)
        }
    }
}
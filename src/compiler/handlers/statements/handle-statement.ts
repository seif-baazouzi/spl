import { AssignVariable, DeclareVariable, PrintStatement, Expression, NodeType, Statement, IfStatement, WhileLoop, ForLoop, ExitStatement } from "~/parser/parser-types.ts"
import handleDeclareVariable from "~/compiler/handlers/variables/declare-variable.ts"
import { handleExpression } from "~/compiler/handlers/expressions/expression.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import handleAssignVariable from "~/compiler/handlers/variables/assign-variable.ts"
import handlePrint from "~/compiler/handlers/statements/print-statement.ts"
import handleIfStatement from "~/compiler/handlers/statements/if-statement.ts"
import handleWhileLoop from "~/compiler/handlers/loops/while-loop.ts"
import handleForLoop from "~/compiler/handlers/loops/for-loop.ts"
import handleExit from "~/compiler/handlers/statements/exit-statement.ts"

export function handleStatement(statement: Statement, env: Environment, conditionLoopLabel?: string, endLoopLabel?: string): string {
    switch (statement.kind) {
        case NodeType.DECLARE_VARIABLE: {
            const st = statement as DeclareVariable
            return handleDeclareVariable(st, env)
        }
        case NodeType.ASSIGN_VARIABLE: {
            const st = statement as AssignVariable
            return handleAssignVariable(st, env)
        }
        case NodeType.PRINT: {
            const st = statement as PrintStatement
            return handlePrint(st, env)
        }
        case NodeType.EXIT: {
            const st = statement as ExitStatement
            return handleExit(st, env)
        }
        case NodeType.IF_STATEMENT: {
            const st = statement as IfStatement
            return handleIfStatement(st, env, conditionLoopLabel, endLoopLabel)
        }
        case NodeType.WHILE_LOOP: {
            const st = statement as WhileLoop
            return handleWhileLoop(st, env)
        }
        case NodeType.FOR_LOOP: {
            const st = statement as ForLoop
            return handleForLoop(st, env)
        }
        case NodeType.BREAK: {
            return `jmp ${endLoopLabel}`
        }
        case NodeType.CONTINUE: {
            return `jmp ${conditionLoopLabel}`
        }
        default: {
            const st = statement as Expression
            return handleExpression(st, env).assembly
        }
    }
}

import { DumpStatement, Expression, NodeType, Statement } from "~/parser/parser-types.ts";
import { handleExpression } from "./handle-expression.ts";

export function handleStatement(statement: Statement): string {
    switch(statement.kind) {
        case NodeType.DUMP: {
            const st = statement as DumpStatement
            const expression = handleExpression(st.expression)
            return [
                expression,
                "push eax",
                "call dump",
            ].join("\n")
        }
        default: {
            const st = statement as Expression
            return handleExpression(st)
        }
    }
}
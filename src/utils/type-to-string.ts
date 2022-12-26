import { VariableType } from "~/parser/parser-types.ts"

export default function typeToString(type: VariableType): string {
    switch (type) {
        case VariableType.INT:
            return "int"
        case VariableType.UINT:
            return "uint"
        case VariableType.VOID:
            return "void"
        case VariableType.BOOLEAN:
            return "boolean"
        default: {
            throw new Error("DEBUG: Invalid Variable Type")
        }
    }
}

import { VariableType } from "~/parser/parser-types.ts";

export default function typeToString(type: VariableType): string {
    switch(type) {
        case VariableType.NUMBER: 
            return "number"
        case VariableType.BOOLEAN: 
            return "boolean"
        default: {
            throw new Error("DEBUG: Invalid Variable Type");
        }
    }
}

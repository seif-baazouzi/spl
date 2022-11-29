import { VariableType } from "~/parser/parser-types.ts";

export function getVariableType(type: string): VariableType {
    switch(type) {
        case "number":
            return VariableType.NUMBER
        case "bool":
            return VariableType.BOOLEAN
        default: {
            console.log(`Error: Unexpected type ${type}`)
            Deno.exit(1)
        }
    }
}
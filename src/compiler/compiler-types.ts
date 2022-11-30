import { Token } from "~/lexer/lexer-types.ts";
import { DeclareVariable, VariableType } from "~/parser/parser-types.ts";
import logError from "~/utils/log-error.ts";

export class Variable {
    constructor(
        public index: number,
        public type: VariableType,
    ) {}
}

export interface ExpressionValue {
    type: VariableType,
    assembly: string,
}

export class Environment {
    private index = 0;
    private variables: Map<string, Variable> = new Map()
    private constants: Set<string> = new Set()

    constructor(private parent?: Environment) {}
    
    declareVariable(st: DeclareVariable): number {
        if(this.hasVariable(st.name.value)) {
            logError(
                st.name.line,
                st.name.colum,
                `Variable ${st.name} is already declared!`    
            )
            Deno.exit(1)
        }

        if(st.isConstant) this.constants.add(st.name.value)

        this.variables.set(st.name.value, new Variable(this.index, st.type))
        return this.index++
    }

    getVariable(variableName: Token): Variable {
        if(!this.hasVariable(variableName.value)) {
            logError(variableName.line, variableName.colum, `Error: Variable ${variableName.value} is not declared!`)
            Deno.exit(1)
        }

        return this.variables.get(variableName.value) as Variable
    }

    hasVariable(varName: string): boolean {
        if(this.variables.has(varName)) {
            return true
        }

        if(this.parent?.hasVariable(varName)) {
            return true
        }

        return false
    }

    isConstant(constantName: string): boolean {
        return this.constants.has(constantName)
    }

    getVariablesCount(): number {
        return this.variables.size
    }
}

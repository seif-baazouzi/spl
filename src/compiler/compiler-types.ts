import { DeclareVariable } from "../parser/parser-types.ts";

export enum VariablesTypes {
    NUMBER,
}

export class Variable {
    constructor(
        public index: number,
        public type: VariablesTypes,
    ) {}
}

export class Environment {
    private index = 0;
    private variables: Map<string, Variable> = new Map()
    private constants: Set<string> = new Set()

    constructor(private parent?: Environment) {}
    
    declareVariable(st: DeclareVariable): number {
        if(this.hasVariable(st.name)) {
            console.log(`Error: Variable ${st.name} is already declared!`)
            Deno.exit(1)
        }

        if(st.isConstant) this.constants.add(st.name)

        this.variables.set(st.name, new Variable(this.index, VariablesTypes.NUMBER))
        return this.index++
    }

    getVariable(variableName: string): Variable {
        if(!this.hasVariable(variableName)) {
            console.log(`Error: Variable ${variableName} is not declared!`)
            Deno.exit(1)
        }

        return this.variables.get(variableName) as Variable
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

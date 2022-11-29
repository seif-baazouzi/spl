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

    constructor(private parent?: Environment) {}
    
    declareVariable(variableName: string): number {
        if(this.hasVariable(variableName)) {
            console.log(`Error: Variable ${variableName} is already declared!`)
            Deno.exit(1)
        }

        this.variables.set(variableName, new Variable(this.index, VariablesTypes.NUMBER))
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

    getVariablesCount(): number {
        return this.variables.size
    }
}

import { Token } from "~/lexer/lexer-types.ts"
import { DeclareVariable, VariableType } from "~/parser/parser-types.ts"
import logError from "~/utils/log-error.ts"

export class Variable {
    constructor(
        public address: number,
        public type: VariableType,
    ) { }
}

export interface ExpressionValue {
    type: VariableType,
    assembly: string,
}

export class Environment {
    private address = 0
    private variables: Map<string, Variable> = new Map()
    private constants: Set<string> = new Set()

    constructor(private parent?: Environment) {
        if (parent) {
            this.address = parent.address
        }
    }

    declareVariable(st: DeclareVariable): number {
        if (this.hasVariable(st.name.value)) {
            logError(
                st.name.line,
                st.name.colum,
                `Identifier ${st.name.value} is already declared!`
            )
            Deno.exit(1)
        }

        if (st.isConstant) this.constants.add(st.name.value)

        this.variables.set(st.name.value, new Variable(this.address, st.type))

        const currentAddress = this.address

        switch (st.type) {
            case VariableType.BOOLEAN:
                this.address += 1
                break
            default:
                this.address += 8
        }

        return currentAddress
    }

    getVariable(variableName: Token): Variable {
        if (this.variables.has(variableName.value)) {
            return this.variables.get(variableName.value) as Variable
        }

        if (this.parent?.hasVariable(variableName.value)) {
            return this.parent.getVariable(variableName) as Variable
        }

        logError(variableName.line, variableName.colum, `Error: Variable ${variableName.value} is not declared!`)
        Deno.exit(1)
    }

    hasVariable(varName: string): boolean {
        if (this.variables.has(varName)) {
            return true
        }

        if (this.parent?.hasVariable(varName)) {
            return true
        }

        return false
    }

    isConstant(constantName: string): boolean {
        return this.constants.has(constantName)
    }

    getVariablesSize(): number {
        let memory = this.parent ? this.address - this.parent.address : this.address
        while (memory % 8 != 0) memory++

        return memory
    }
}

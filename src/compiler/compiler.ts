import { DeclareFunction, NodeType, Program } from "~/parser/parser-types.ts"

import template from "~/compiler/template.ts"
import { run } from "~/compiler/compiler-helpers.ts"
import { handleStatement } from "~/compiler/handlers/statements/handle-statement.ts"
import { Environment } from "~/compiler/compiler-types.ts"
import handleDeclareFunction from "~/compiler/handlers/statements/declare-function.ts"

export default async function compile(program: Program) {
    await run("rm", "-rf", "dist")
    await run("mkdir", "dist")

    const encoder = new TextEncoder()
    Deno.writeFile("dist/res.asm", encoder.encode(generateAssembly(program)))

    await run("nasm", "-f", "elf64", "-o", "dist/res.o", "dist/res.asm")
    await run("ld", "-o", "dist/res", "dist/res.o")
}

function generateAssembly(program: Program): string {
    const code: string[] = []
    const functions: string[] = []

    const env = new Environment()
    env.addToAddress(8) // base address in bsp register

    // declare functions
    program.body.forEach(st => {
        if (st.kind === NodeType.DECLARE_FUNCTION) {
            const result = handleDeclareFunction(st as DeclareFunction, env)
            functions.push(result)
        }
    })

    // rest of the code
    program.body.forEach(st => {
        if (st.kind !== NodeType.DECLARE_FUNCTION) {
            const result = handleStatement(st, env)
            code.push(result)
        }

    })
    code.unshift(`sub rsp, ${env.getVariablesSize()}`)

    return template
        .replace("%CODE%", code.join("\n"))
        .replace("%FUNCTIONS%", functions.join("\n"))
}

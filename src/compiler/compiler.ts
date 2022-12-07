import { Program } from "~/parser/parser-types.ts"

import template from "~/compiler/template.ts"
import { run } from "~/compiler/compiler-helpers.ts"
import { handleStatement } from "~/compiler/handlers/statements/handle-statement.ts"
import { Environment } from "~/compiler/compiler-types.ts"

export default async function compile(program: Program) {
    await run("rm", "-rf", "dist")
    await run("mkdir", "dist")

    const assemblyCode = template.replace("%CODE%", generateAssemblyCode(program))
    const encoder = new TextEncoder()
    Deno.writeFile("dist/res.asm", encoder.encode(assemblyCode))

    await run("nasm", "-f", "elf64", "-o", "dist/res.o", "dist/res.asm")
    await run("ld", "-o", "dist/res", "dist/res.o")
}

function generateAssemblyCode(program: Program): string {
    const env = new Environment()

    const result = program.body.map((s) => handleStatement(s, env))
    result.unshift(`add rsp, ${env.getVariablesSize()}`)

    return result.join("\n")
}

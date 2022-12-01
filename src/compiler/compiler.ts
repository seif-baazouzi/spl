import { Program } from "~/parser/parser-types.ts"

import template from "~/compiler/template.ts"
import { run } from "~/compiler/compiler-helpers.ts"
import { handleStatement } from "~/compiler/handlers/handle-statement.ts"
import { Environment } from "~/compiler/compiler-types.ts"

export default async function compile(program: Program) {
    await run("rm", "-rf", "dist")
    await run("mkdir", "dist")
    
    const assemblyCode = template.replace("%CODE%", generateAssemblyCode(program))
    const encoder = new TextEncoder()
    Deno.writeFile("dist/res.asm", encoder.encode(assemblyCode))

    await run("nasm", "-f", "elf32", "-o", "dist/res.o", "dist/res.asm")
    await run("ld", "-m", "elf_i386", "-o", "dist/res", "dist/res.o")
}

function generateAssemblyCode(program: Program): string {
    const env = new Environment()
    
    const result = program.body.map((s) => handleStatement(s, env))
    result.unshift(`add esp, ${env.getVariablesCount()*4}`)

    return result.join("\n")
}

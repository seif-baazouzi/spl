import { Token } from "~/lexer/lexer-types.ts"
import { VariableType } from "~/parser/parser-types.ts"

export async function run(...cmd: string[]) {
    console.log(`[CMD] ${cmd.join(" ")}`)
    const process = Deno.run({ cmd, stdout: "piped", stderr: "piped" })

    await process.status()

    const decoder = new TextDecoder()

    const stdout = await process.output()
    const stdoutStr = decoder.decode(stdout)
    if (stdoutStr) console.log(stdoutStr)

    const stderr = await process.stderrOutput()
    const stderrStr = decoder.decode(stderr)
    if (stderrStr) console.log(stderrStr)

    process.close()
}

export function getTokenPosition(token: Token): string {
    return `${token.line}_${token.colum}`
}

export function changeNumberType(statementType: VariableType, expressionType: VariableType): string {
    if (statementType === expressionType)
        return ""

    if (statementType === VariableType.INT)
        return "add rax, 2147483647"

    if (statementType === VariableType.UINT)
        return "sub rax, 2147483647"

    return ""
}

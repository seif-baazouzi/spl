import { Token } from "~/lexer/lexer-types.ts"

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

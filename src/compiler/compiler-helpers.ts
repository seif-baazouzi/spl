export async function run(...cmd: string[]) {
    console.log(`[CMD] ${cmd.join(" ")}`)
    const process = Deno.run({cmd, stdout: "piped", stderr: "piped"})

    const output = await process.output()
    const outputStr = new TextDecoder().decode(output)
    if(outputStr) console.log(outputStr)
    
    process.close()
}

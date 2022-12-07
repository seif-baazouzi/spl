export default function readSourceCode(): string {
    if (Deno.args.length === 0) {
        console.log("Usage: splc [file.spl]")
        Deno.exit(1)
    }

    const decoder = new TextDecoder()
    return decoder.decode(Deno.readFileSync(Deno.args[0]))
}

export default function logError(line: number, colum: number, message: string) {
    console.error(`Error(${line}:${colum}): ${message}`)
    Deno.exit(1)
}

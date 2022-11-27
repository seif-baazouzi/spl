import { TokenType } from "./lexer.ts"
import { BinaryExpression, Expression, NodeType, Statement } from "./parser.ts"

const template = `
global _start

section .text:

dump:
  push eax
  push ebx
  push ecx
  push edx
  push esi
  push edi

  mov eax, [esp+28]
  mov esi, esp
  mov edi, 2

  push byte 0x0
  push byte 0xa

  _push:
    mov edx, 0
    mov ebx, 10
    div ebx
    
    add edx, 0x30
    push edx
    add edi, 4

    cmp eax, 0
    jne _push

  mov eax, 0x4
  mov ebx, 0x1
  mov ecx, esp
  mov edx, edi
  int 0x80

  mov esp, esi

  pop edi
  pop esi
  pop edx
  pop ecx
  pop ebx
  pop eax

  ret

_start:
  xor eax, eax  

  %CODE%
  
  push eax
  call dump
  
  mov eax, 0x1
  mov ebx, 0x0
  int 0x80
`

export default async function compile(program: Statement[]) {
    await run("rm", "-rf", "dist")
    await run("mkdir", "dist")
    
    const assemblyCode = template.replace("%CODE%", generateAssemblyCode(program))
    const encoder = new TextEncoder()
    Deno.writeFile("dist/res.asm", encoder.encode(assemblyCode))

    await run("nasm", "-f", "elf32", "-o", "dist/res.o", "dist/res.asm")
    await run("ld", "-m", "elf_i386", "-o", "dist/res", "dist/res.o")
    await run("./dist/res")
}

function generateAssemblyCode(program: Statement[]): string {
    return program.map(generateStatementAssembly).join("\n")
}

function generateStatementAssembly(statement: Statement): string {
    switch(statement.kind) {
        case NodeType.NUMBER: {
            const st = statement as Expression
            return [
                `push eax`,
                `mov eax, ${st.symbol}`,
            ].join("\n")
        }
        case NodeType.IDENTIFIER: {
            console.log("Compiling NodeType.IDENTIFIER Not Implemented yet!");
            Deno.exit(1)
            break
        }
        case NodeType.BINARY_EXPRESSION: {
            const st = statement as BinaryExpression
            return handleBinaryExpression(st)
        }
        default: {
            console.log("Unexpected NodeType");
            Deno.exit(1)
        }
    }
}

function handleBinaryExpression(statement: BinaryExpression): string {
    const result = []

    result.push(generateStatementAssembly(statement.right))
    result.push(generateStatementAssembly(statement.left))
    result.push("pop ebx")
    
    switch(statement.operation.type) {
        case TokenType.PLUS: {
            result.push("add eax, ebx")
            break
        }
        case TokenType.MINUS: {
            result.push("sub eax, ebx")
            break
        }
        case TokenType.MULTIPLY: {
            result.push("mul ebx")
            break
        }
        case TokenType.DIVIDE: {
            result.push("div ebx")
            break
        }
        case TokenType.MODULO: {
            result.push("div ebx")
            result.push("mov eax, edx")
            break
        }
    }

    return result.join("\n")
}

async function run(...cmd: string[]) {
    console.log(`[CMD] ${cmd.join(" ")}`)
    const process = Deno.run({cmd, stdout: "piped", stderr: "piped"})

    const output = await process.output()
    const outputStr = new TextDecoder().decode(output)
    if(outputStr) console.log(outputStr)
    
    process.close()
}

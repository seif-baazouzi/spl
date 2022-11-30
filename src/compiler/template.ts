export default `
global _start

section .text:

_print_number:
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

_print_boolean:
  push eax

  mov eax, [esp+8]

  cmp eax, 0
  jne .print_true
  jmp .print_false

  .print_true:
    mov eax, 0x4
    mov ebx, 0x1
    mov ecx, true
    mov edx, trueLength
    int 0x80
    jmp .end
  
  .print_false:
    mov eax, 0x4
    mov ebx, 0x1
    mov ecx, false
    mov edx, falseLength
    int 0x80

  .end:
  mov esp, ebp
  pop eax

  ret

_start:
  mov ebp, esp
  xor eax, eax

  %CODE%

  mov eax, 0x1
  mov ebx, 0x0
  int 0x80

section .data:
  true: db "true", 0xa
  trueLength equ $-true
  false: db "false", 0xa
  falseLength equ $-false
`

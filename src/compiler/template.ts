export default `
BITS 64

global _start

section .text

_print_number:
    push rax
    push rdi
    push rsi
    push rdx
    push rbp

    mov rax, [rsp+48]
    mov rbp, rsp
    mov rcx, 2

    push byte 0x0
    push byte 0xa

    _push:
        mov rdx, 0
        mov rbx, 10
        div rbx
        
        add rdx, 0x30
        push rdx
        add rcx, 8

        cmp rax, 0
        jne _push

    mov rax, 1
    mov rdi, 1
    mov rsi, rsp
    mov rdx, rcx
    syscall

    mov rsp, rbp

    pop rbp
    pop rdx
    pop rsi
    pop rdi
    pop rax

    ret

_print_boolean:
    push rax
    push rdi
    push rsi
    push rdx

    mov rax, [rsp+40]

    cmp rax, 0
    jne .print_true
    jmp .print_false

    .print_true:
        mov rax, 1
        mov rdi, 1
        mov rsi, true
        mov rdx, trueLength
        syscall
        jmp .end
    
    .print_false:
        mov rax, 1
        mov rdi, 1
        mov rsi, false
        mov rdx, falseLength
        syscall

    .end:

    pop rdx
    pop rsi
    pop rdi
    pop rax

    ret

_start:
    mov rbp, rsp
    xor rax, rax

    %CODE%

    mov rax, 60
    mov rdi, 0
    syscall

section .data
    true: db "true", 0xa
    trueLength equ $-true
    false: db "false", 0xa
    falseLength equ $-false
`

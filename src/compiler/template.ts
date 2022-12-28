export default `
BITS 64

global _start

section .text

_start:
    mov rbp, rsp
    xor rax, rax

    %CODE%

    mov rax, 60
    mov rdi, 0
    syscall

    ret

%FUNCTIONS%

_print_int:
    push rax
    push rdi
    push rsi
    push rdx
    push rcx
    push rbp

    mov rax, [rsp+56]
    mov rbp, rsp
    mov rcx, 2

    cmp rax, 2147483647
    jge .positive_number

    .negative_number:
        mov rdi, 1
        mov rsi, rax
        mov rax, 2147483647
        sub rax, rsi
        jmp .work

    .positive_number:
        mov rdi, 0
        sub rax, 2147483647

    .work:

    push byte 0x0
    push byte 0xa

    .push:
        mov rdx, 0
        mov rbx, 10
        div rbx
        
        add rdx, 0x30
        push rdx
        add rcx, 8

        cmp rax, 0
        jne .push

    cmp rdi, 1
    jz .push_minus
    jmp .print

    .push_minus:
        push '-'
        add rcx, 8

    .print:
    mov rax, 1
    mov rdi, 1
    mov rsi, rsp
    mov rdx, rcx
    syscall

    mov rsp, rbp

    pop rbp
    pop rcx
    pop rdx
    pop rsi
    pop rdi
    pop rax

    ret

_print_uint:
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

    .push:
        mov rdx, 0
        mov rbx, 10
        div rbx
        
        add rdx, 0x30
        push rdx
        add rcx, 8

        cmp rax, 0
        jne .push

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

_print_char:
    push rax
    push rdi
    push rsi
    push rdx

    mov rax, [rsp+40]

    push 0xa
    push rax

    mov rax, 1
    mov rdi, 1
    mov rsi, rsp
    mov rdx, 9
    syscall

    add rsp, 16

    pop rdx
    pop rsi
    pop rdi
    pop rax

    ret

section .data
    true: db "true", 0xa
    trueLength equ $-true
    false: db "false", 0xa
    falseLength equ $-false
`

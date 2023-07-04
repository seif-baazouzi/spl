package expressions

import (
	"fmt"
	"spl/lexer"
	"spl/node"
)

type Number struct {
	Value lexer.Token
}

func (n *Number) Evaluate() node.NodeResult {
	return node.NodeResult{
		Assembly: fmt.Sprintf("    mov rax, %s", n.Value.Symbol),
	}
}

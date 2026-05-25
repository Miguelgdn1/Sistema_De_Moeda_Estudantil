package com.puc.moedaestudantil.exception;

public class AlunoNaoEncontradoException extends BusinessException {
    public AlunoNaoEncontradoException(Long id) {
        super("Aluno nao encontrado: id=" + id);
    }
}

package com.puc.moedaestudantil.exception;

public class ProfessorNaoEncontradoException extends BusinessException {
    public ProfessorNaoEncontradoException(Long id) {
        super("Professor nao encontrado: id=" + id);
    }
}

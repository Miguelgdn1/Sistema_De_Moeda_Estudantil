package com.puc.moedaestudantil.exception;

public class InstituicaoNaoEncontradaException extends BusinessException {
    public InstituicaoNaoEncontradaException(Long id) {
        super("Instituicao nao encontrada: id=" + id);
    }
}

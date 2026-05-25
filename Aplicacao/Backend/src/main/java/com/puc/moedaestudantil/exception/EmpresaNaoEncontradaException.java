package com.puc.moedaestudantil.exception;

public class EmpresaNaoEncontradaException extends BusinessException {
    public EmpresaNaoEncontradaException(Long id) {
        super("Empresa parceira nao encontrada: id=" + id);
    }
}

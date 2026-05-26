package com.puc.moedaestudantil.exception;

public class CupomNaoEncontradoException extends BusinessException {
    public CupomNaoEncontradoException(String codigo) {
        super("Cupom nao encontrado: " + codigo);
    }
}

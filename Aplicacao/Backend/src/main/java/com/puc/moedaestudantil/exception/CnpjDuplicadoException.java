package com.puc.moedaestudantil.exception;

public class CnpjDuplicadoException extends BusinessException {
    public CnpjDuplicadoException() {
        super("CNPJ ja cadastrado.");
    }
}

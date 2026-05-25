package com.puc.moedaestudantil.exception;

public class CpfDuplicadoException extends BusinessException {
    public CpfDuplicadoException() {
        super("CPF ja cadastrado.");
    }
}

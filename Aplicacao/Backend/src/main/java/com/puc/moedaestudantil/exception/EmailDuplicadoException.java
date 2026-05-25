package com.puc.moedaestudantil.exception;

public class EmailDuplicadoException extends BusinessException {
    public EmailDuplicadoException() {
        super("Email ja cadastrado.");
    }
}

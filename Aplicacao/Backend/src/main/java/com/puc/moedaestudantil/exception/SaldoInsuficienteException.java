package com.puc.moedaestudantil.exception;

public class SaldoInsuficienteException extends BusinessException {
    public SaldoInsuficienteException(int saldoAtual, int tentativa) {
        super("Saldo insuficiente: voce tem " + saldoAtual
            + " moedas e tentou enviar " + tentativa + ".");
    }
}

package com.puc.moedaestudantil.exception.handler;

import com.puc.moedaestudantil.dto.response.ErroResponse;
import com.puc.moedaestudantil.exception.CnpjDuplicadoException;
import com.puc.moedaestudantil.exception.CpfDuplicadoException;
import com.puc.moedaestudantil.exception.EmailDuplicadoException;
import com.puc.moedaestudantil.exception.SaldoInsuficienteException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

public final class ConflictExceptionHandler {

    private ConflictExceptionHandler() {}

    private static HttpResponse<ErroResponse> conflict(HttpRequest<?> request, String message) {
        return HttpResponse
            .<ErroResponse>status(HttpStatus.CONFLICT)
            .body(ErroResponse.of(409, "Conflict", message, request.getPath()));
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {CpfDuplicadoException.class, ExceptionHandler.class})
    public static class CpfHandler implements ExceptionHandler<CpfDuplicadoException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, CpfDuplicadoException ex) {
            return conflict(request, ex.getMessage());
        }
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {CnpjDuplicadoException.class, ExceptionHandler.class})
    public static class CnpjHandler implements ExceptionHandler<CnpjDuplicadoException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, CnpjDuplicadoException ex) {
            return conflict(request, ex.getMessage());
        }
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {EmailDuplicadoException.class, ExceptionHandler.class})
    public static class EmailHandler implements ExceptionHandler<EmailDuplicadoException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, EmailDuplicadoException ex) {
            return conflict(request, ex.getMessage());
        }
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {SaldoInsuficienteException.class, ExceptionHandler.class})
    public static class SaldoHandler implements ExceptionHandler<SaldoInsuficienteException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, SaldoInsuficienteException ex) {
            return conflict(request, ex.getMessage());
        }
    }
}

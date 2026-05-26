package com.puc.moedaestudantil.exception.handler;

import com.puc.moedaestudantil.dto.response.ErroResponse;
import com.puc.moedaestudantil.exception.AlunoNaoEncontradoException;
import com.puc.moedaestudantil.exception.CupomNaoEncontradoException;
import com.puc.moedaestudantil.exception.EmpresaNaoEncontradaException;
import com.puc.moedaestudantil.exception.InstituicaoNaoEncontradaException;
import com.puc.moedaestudantil.exception.ProfessorNaoEncontradoException;
import com.puc.moedaestudantil.exception.VantagemNaoEncontradaException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

public final class NotFoundExceptionHandler {

    private NotFoundExceptionHandler() {}

    private static HttpResponse<ErroResponse> notFound(HttpRequest<?> request, String message) {
        return HttpResponse
            .<ErroResponse>status(HttpStatus.NOT_FOUND)
            .body(ErroResponse.of(404, "Not Found", message, request.getPath()));
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {AlunoNaoEncontradoException.class, ExceptionHandler.class})
    public static class AlunoHandler implements ExceptionHandler<AlunoNaoEncontradoException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, AlunoNaoEncontradoException ex) {
            return notFound(request, ex.getMessage());
        }
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {ProfessorNaoEncontradoException.class, ExceptionHandler.class})
    public static class ProfessorHandler implements ExceptionHandler<ProfessorNaoEncontradoException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, ProfessorNaoEncontradoException ex) {
            return notFound(request, ex.getMessage());
        }
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {EmpresaNaoEncontradaException.class, ExceptionHandler.class})
    public static class EmpresaHandler implements ExceptionHandler<EmpresaNaoEncontradaException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, EmpresaNaoEncontradaException ex) {
            return notFound(request, ex.getMessage());
        }
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {InstituicaoNaoEncontradaException.class, ExceptionHandler.class})
    public static class InstituicaoHandler implements ExceptionHandler<InstituicaoNaoEncontradaException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, InstituicaoNaoEncontradaException ex) {
            return notFound(request, ex.getMessage());
        }
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {VantagemNaoEncontradaException.class, ExceptionHandler.class})
    public static class VantagemHandler implements ExceptionHandler<VantagemNaoEncontradaException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, VantagemNaoEncontradaException ex) {
            return notFound(request, ex.getMessage());
        }
    }

    @Produces(MediaType.APPLICATION_JSON)
    @Singleton
    @Requires(classes = {CupomNaoEncontradoException.class, ExceptionHandler.class})
    public static class CupomHandler implements ExceptionHandler<CupomNaoEncontradoException, HttpResponse<ErroResponse>> {
        @Override
        public HttpResponse<ErroResponse> handle(HttpRequest request, CupomNaoEncontradoException ex) {
            return notFound(request, ex.getMessage());
        }
    }
}

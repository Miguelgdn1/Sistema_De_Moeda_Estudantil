package com.puc.moedaestudantil.exception;

import com.puc.moedaestudantil.dto.response.ErroResponse;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Produces(MediaType.APPLICATION_JSON)
@Singleton
@Requires(classes = {Throwable.class, ExceptionHandler.class})
public class GlobalExceptionHandler implements ExceptionHandler<Throwable, HttpResponse<ErroResponse>> {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Override
    public HttpResponse<ErroResponse> handle(HttpRequest request, Throwable ex) {
        LOG.error("Erro inesperado em {} {}", request.getMethod(), request.getPath(), ex);
        return HttpResponse.serverError(
            ErroResponse.of(500, "Internal Server Error",
                "Ocorreu um erro inesperado. Verifique os logs do servidor.",
                request.getPath()));
    }
}

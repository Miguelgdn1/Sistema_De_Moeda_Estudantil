package com.puc.moedaestudantil.exception.handler;

import com.puc.moedaestudantil.dto.response.ErroResponse;
import com.puc.moedaestudantil.exception.AcessoNegadoException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces(MediaType.APPLICATION_JSON)
@Singleton
@Requires(classes = {AcessoNegadoException.class, ExceptionHandler.class})
public class AcessoNegadoExceptionHandler
    implements ExceptionHandler<AcessoNegadoException, HttpResponse<ErroResponse>> {

    @Override
    public HttpResponse<ErroResponse> handle(HttpRequest request, AcessoNegadoException ex) {
        return HttpResponse
            .<ErroResponse>status(HttpStatus.FORBIDDEN)
            .body(ErroResponse.of(403, "Forbidden", ex.getMessage(), request.getPath()));
    }
}

package com.puc.moedaestudantil.exception.handler;

import com.puc.moedaestudantil.dto.response.ErroResponse;
import com.puc.moedaestudantil.exception.CredenciaisInvalidasException;
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
@Requires(classes = {CredenciaisInvalidasException.class, ExceptionHandler.class})
public class CredenciaisInvalidasExceptionHandler
    implements ExceptionHandler<CredenciaisInvalidasException, HttpResponse<ErroResponse>> {

    @Override
    public HttpResponse<ErroResponse> handle(HttpRequest request, CredenciaisInvalidasException ex) {
        return HttpResponse
            .<ErroResponse>status(HttpStatus.UNAUTHORIZED)
            .body(ErroResponse.of(401, "Unauthorized", ex.getMessage(), request.getPath()));
    }
}

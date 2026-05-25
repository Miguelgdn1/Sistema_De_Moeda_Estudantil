package com.puc.moedaestudantil.exception.handler;

import com.puc.moedaestudantil.dto.response.ErroResponse;
import io.micronaut.context.annotation.Replaces;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import io.micronaut.validation.exceptions.ConstraintExceptionHandler;
import jakarta.inject.Singleton;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import java.util.stream.Collectors;

@Produces(MediaType.APPLICATION_JSON)
@Singleton
@Replaces(ConstraintExceptionHandler.class)
@Requires(classes = {ConstraintViolationException.class, ExceptionHandler.class})
public class ConstraintViolationExceptionHandler
    implements ExceptionHandler<ConstraintViolationException, HttpResponse<ErroResponse>> {

    @Override
    public HttpResponse<ErroResponse> handle(HttpRequest request, ConstraintViolationException ex) {
        Map<String, String> camposInvalidos = ex.getConstraintViolations().stream()
            .collect(Collectors.toMap(
                cv -> {
                    String path = cv.getPropertyPath().toString();
                    int lastDot = path.lastIndexOf('.');
                    return lastDot >= 0 ? path.substring(lastDot + 1) : path;
                },
                ConstraintViolation::getMessage,
                (a, b) -> a));
        return HttpResponse.badRequest(
            ErroResponse.ofValidation(400, "Bad Request",
                "Erro de validacao nos campos enviados.",
                request.getPath(), camposInvalidos));
    }
}

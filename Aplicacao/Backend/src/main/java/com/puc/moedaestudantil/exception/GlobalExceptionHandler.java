package com.puc.moedaestudantil.exception;

import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class GlobalExceptionHandler {

    @Produces
    @Singleton
    @Requires(classes = {IllegalArgumentException.class, ExceptionHandler.class})
    public static class IllegalArgumentHandler implements ExceptionHandler<IllegalArgumentException, HttpResponse<?>> {
        @Override
        public HttpResponse<?> handle(HttpRequest request, IllegalArgumentException exception) {
            Map<String, Object> body = new HashMap<>();
            body.put("erro", "Requisição inválida");
            body.put("mensagem", exception.getMessage());
            return HttpResponse.badRequest(body);
        }
    }

    @Produces
    @Singleton
    @Requires(classes = {EntityNotFoundException.class, ExceptionHandler.class})
    public static class EntityNotFoundHandler implements ExceptionHandler<EntityNotFoundException, HttpResponse<?>> {
        @Override
        public HttpResponse<?> handle(HttpRequest request, EntityNotFoundException exception) {
            Map<String, Object> body = new HashMap<>();
            body.put("erro", "Recurso não encontrado");
            body.put("mensagem", exception.getMessage());
            return HttpResponse.notFound(body);
        }
    }

    @Produces
    @Singleton
    @Requires(classes = {ConstraintViolationException.class, ExceptionHandler.class})
    public static class ConstraintViolationHandler implements ExceptionHandler<ConstraintViolationException, HttpResponse<?>> {
        @Override
        public HttpResponse<?> handle(HttpRequest request, ConstraintViolationException exception) {
            Map<String, Object> body = new HashMap<>();
            body.put("erro", "Erro de validação");
            body.put("camposInvalidos", exception.getConstraintViolations().stream()
                    .collect(Collectors.toMap(
                            cv -> {
                                String path = cv.getPropertyPath().toString();
                                int lastDot = path.lastIndexOf('.');
                                return lastDot >= 0 ? path.substring(lastDot + 1) : path;
                            },
                            ConstraintViolation::getMessage,
                            (a, b) -> a)));
            return HttpResponse.badRequest(body);
        }
    }
}

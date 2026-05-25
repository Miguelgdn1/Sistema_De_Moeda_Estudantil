package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;
import java.time.LocalDateTime;
import java.util.Map;

@Serdeable
public record ErroResponse(
    LocalDateTime timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> camposInvalidos
) {
    public static ErroResponse of(int status, String error, String message, String path) {
        return new ErroResponse(LocalDateTime.now(), status, error, message, path, null);
    }

    public static ErroResponse ofValidation(int status, String error, String message, String path,
                                            Map<String, String> camposInvalidos) {
        return new ErroResponse(LocalDateTime.now(), status, error, message, path, camposInvalidos);
    }
}

package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LoginResponse(
    String token,
    String tipoUsuario,
    Long usuarioId,
    String nome
) {}

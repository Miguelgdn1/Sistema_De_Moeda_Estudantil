package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

import java.time.LocalDateTime;

@Serdeable
public record CupomValidacaoResponse(
    String codigoCupom,
    String status,
    String alunoNome,
    String vantagemNome,
    String empresaNome,
    LocalDateTime dataResgate,
    LocalDateTime dataExpiracao,
    LocalDateTime cupomUsadoEm
) {}

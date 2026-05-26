package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

import java.time.LocalDateTime;

@Serdeable
public record ResgateResponse(
    Long transacaoId,
    String codigoCupom,
    String qrCodeBase64,
    LocalDateTime dataResgate,
    LocalDateTime dataExpiracao,
    Integer saldoRestante,
    Long vantagemId,
    String vantagemNome,
    Integer custoMoedas,
    String empresaNome
) {}

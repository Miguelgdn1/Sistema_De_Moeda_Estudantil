package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record InstituicaoResponse(
    Long id,
    String nome,
    String cnpj,
    String endereco
) {}

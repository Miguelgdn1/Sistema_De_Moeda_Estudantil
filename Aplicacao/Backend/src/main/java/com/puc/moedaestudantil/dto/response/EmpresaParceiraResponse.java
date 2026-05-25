package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record EmpresaParceiraResponse(
    Long id,
    String email,
    String cnpj,
    String nomeFantasia,
    String descricao
) {}

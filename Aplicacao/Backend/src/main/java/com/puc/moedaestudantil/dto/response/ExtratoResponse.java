package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;
import java.util.List;

@Serdeable
public record ExtratoResponse(
    Integer saldoAtual,
    List<TransacaoResponse> transacoes
) {}

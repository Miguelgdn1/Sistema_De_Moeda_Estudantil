package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;
import java.time.LocalDateTime;

@Serdeable
public record TransacaoResponse(
    Long id,
    String tipo,
    Integer valor,
    LocalDateTime dataHora,
    String descricao,
    Long alunoId,
    String alunoNome
) {}

package com.puc.moedaestudantil.dto.request;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Serdeable
public record DistribuirMoedasRequest(
    @NotNull Long alunoId,
    @NotNull @Min(value = 1, message = "Quantidade deve ser pelo menos 1") Integer quantidade,
    @NotBlank(message = "Mensagem de reconhecimento e obrigatoria")
    @Size(min = 10, max = 500, message = "Mensagem deve ter entre 10 e 500 caracteres")
    String mensagem
) {}

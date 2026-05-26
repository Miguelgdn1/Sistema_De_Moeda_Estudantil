package com.puc.moedaestudantil.dto.request;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;

@Serdeable
public record ResgateRequest(
    @NotNull Long vantagemId
) {}

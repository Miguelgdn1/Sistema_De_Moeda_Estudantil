package com.puc.moedaestudantil.dto.request;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Serdeable
public record AlunoUpdateRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 3, max = 150) String nome,
    @Nullable @Pattern(regexp = "^\\+[1-9]\\d{1,14}$", message = "Telefone deve estar no formato E.164 (ex.: +5531999999999)") String telefone,
    @Nullable @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 digitos") String cep,
    @Nullable String logradouro,
    @Nullable String numero,
    @Nullable String complemento,
    @Nullable String bairro,
    @Nullable String cidade,
    @Nullable @Size(min = 2, max = 2) String uf,
    @Nullable @Size(min = 6, max = 100) String senha
) {}

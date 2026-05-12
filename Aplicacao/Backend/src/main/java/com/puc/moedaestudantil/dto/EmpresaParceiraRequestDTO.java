package com.puc.moedaestudantil.dto;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Serdeable
public class EmpresaParceiraRequestDTO {

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6, max = 100)
    private String senha;

    @NotBlank @Size(min = 14, max = 14)
    private String cnpj;

    @NotBlank
    private String nomeFantasia;

    @Nullable
    private String descricao;

    public EmpresaParceiraRequestDTO() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}

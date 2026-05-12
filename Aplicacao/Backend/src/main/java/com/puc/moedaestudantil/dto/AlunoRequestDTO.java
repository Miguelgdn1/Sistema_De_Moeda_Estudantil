package com.puc.moedaestudantil.dto;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Serdeable
public class AlunoRequestDTO {

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6, max = 100)
    private String senha;

    @NotBlank @Size(min = 11, max = 11)
    private String cpf;

    @NotBlank
    private String rg;

    @NotBlank
    private String nome;

    @Nullable
    private String endereco;

    @NotBlank
    private String curso;

    @NotNull
    private Long instituicaoId;

    public AlunoRequestDTO() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }

    public Long getInstituicaoId() { return instituicaoId; }
    public void setInstituicaoId(Long instituicaoId) { this.instituicaoId = instituicaoId; }
}

package com.puc.moedaestudantil.dto;

import com.puc.moedaestudantil.model.Aluno;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class AlunoResponseDTO {

    private Long id;
    private String email;
    private String cpf;
    private String rg;
    private String nome;
    private String endereco;
    private String curso;
    private Integer saldoMoedas;
    private Long instituicaoId;
    private String instituicaoNome;

    public AlunoResponseDTO() {}

    public static AlunoResponseDTO fromEntity(Aluno aluno) {
        AlunoResponseDTO dto = new AlunoResponseDTO();
        dto.id = aluno.getId();
        dto.email = aluno.getEmail();
        dto.cpf = aluno.getCpf();
        dto.rg = aluno.getRg();
        dto.nome = aluno.getNome();
        dto.endereco = aluno.getEndereco();
        dto.curso = aluno.getCurso();
        dto.saldoMoedas = aluno.getSaldoMoedas();
        if (aluno.getInstituicao() != null) {
            dto.instituicaoId = aluno.getInstituicao().getId();
            dto.instituicaoNome = aluno.getInstituicao().getNome();
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

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

    public Integer getSaldoMoedas() { return saldoMoedas; }
    public void setSaldoMoedas(Integer saldoMoedas) { this.saldoMoedas = saldoMoedas; }

    public Long getInstituicaoId() { return instituicaoId; }
    public void setInstituicaoId(Long instituicaoId) { this.instituicaoId = instituicaoId; }

    public String getInstituicaoNome() { return instituicaoNome; }
    public void setInstituicaoNome(String instituicaoNome) { this.instituicaoNome = instituicaoNome; }
}

package com.puc.moedaestudantil.dto;

import com.puc.moedaestudantil.model.EmpresaParceira;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class EmpresaParceiraResponseDTO {

    private Long id;
    private String email;
    private String cnpj;
    private String nomeFantasia;
    private String descricao;

    public EmpresaParceiraResponseDTO() {}

    public static EmpresaParceiraResponseDTO fromEntity(EmpresaParceira e) {
        EmpresaParceiraResponseDTO dto = new EmpresaParceiraResponseDTO();
        dto.id = e.getId();
        dto.email = e.getEmail();
        dto.cnpj = e.getCnpj();
        dto.nomeFantasia = e.getNomeFantasia();
        dto.descricao = e.getDescricao();
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}

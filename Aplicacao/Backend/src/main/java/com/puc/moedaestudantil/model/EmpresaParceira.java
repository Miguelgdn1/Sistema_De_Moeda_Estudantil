package com.puc.moedaestudantil.model;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;

@Entity
@Table(name = "empresa_parceira")
@Serdeable
public class EmpresaParceira extends Usuario {

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(nullable = false, name = "nome_fantasia")
    private String nomeFantasia;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    public EmpresaParceira() {}

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}

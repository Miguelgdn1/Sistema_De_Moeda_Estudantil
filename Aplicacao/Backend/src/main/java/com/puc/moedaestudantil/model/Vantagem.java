package com.puc.moedaestudantil.model;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;

@Entity
@Table(name = "vantagem")
@Serdeable
public class Vantagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false)
    private Integer custoMoedas;

    @Column(length = 500)
    private String fotoUrl;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private EmpresaParceira empresa;

    public Vantagem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Integer getCustoMoedas() { return custoMoedas; }
    public void setCustoMoedas(Integer custoMoedas) { this.custoMoedas = custoMoedas; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public EmpresaParceira getEmpresa() { return empresa; }
    public void setEmpresa(EmpresaParceira empresa) { this.empresa = empresa; }
}

package com.puc.moedaestudantil.dto;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class LoginResponseDTO {

    private String token;
    private String tipoUsuario;
    private Long usuarioId;
    private String nome;

    public LoginResponseDTO() {}

    public LoginResponseDTO(String token, String tipoUsuario, Long usuarioId, String nome) {
        this.token = token;
        this.tipoUsuario = tipoUsuario;
        this.usuarioId = usuarioId;
        this.nome = nome;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(String tipoUsuario) { this.tipoUsuario = tipoUsuario; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}

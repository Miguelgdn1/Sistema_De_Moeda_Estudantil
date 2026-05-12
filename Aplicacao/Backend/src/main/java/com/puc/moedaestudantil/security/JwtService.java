package com.puc.moedaestudantil.security;

import io.micronaut.security.token.generator.TokenGenerator;
import jakarta.inject.Singleton;
import java.util.HashMap;
import java.util.Map;

@Singleton
public class JwtService {

    private final TokenGenerator tokenGenerator;

    public JwtService(TokenGenerator tokenGenerator) {
        this.tokenGenerator = tokenGenerator;
    }

    public String gerarToken(Long usuarioId, String email, String tipoUsuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", email);
        claims.put("usuarioId", usuarioId);
        claims.put("tipoUsuario", tipoUsuario);
        // 4 horas
        return tokenGenerator.generateToken(claims).orElseThrow(
                () -> new IllegalStateException("Falha ao gerar token JWT"));
    }
}

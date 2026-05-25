package com.puc.moedaestudantil.security;

import com.puc.moedaestudantil.exception.AcessoNegadoException;
import io.micronaut.security.authentication.Authentication;

public final class AuthenticatedUser {

    public static final String ROLE_ALUNO = "ROLE_ALUNO";
    public static final String ROLE_PROFESSOR = "ROLE_PROFESSOR";
    public static final String ROLE_EMPRESA = "ROLE_EMPRESA";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";

    private AuthenticatedUser() {}

    public static Long getUserId(Authentication authentication) {
        Object raw = authentication.getAttributes().get("usuarioId");
        if (raw instanceof Number n) {
            return n.longValue();
        }
        if (raw instanceof String s) {
            return Long.parseLong(s);
        }
        throw new IllegalStateException("Token JWT sem claim 'usuarioId'.");
    }

    public static String getTipoUsuario(Authentication authentication) {
        Object raw = authentication.getAttributes().get("tipoUsuario");
        return raw != null ? raw.toString() : null;
    }

    public static boolean hasRole(Authentication authentication, String role) {
        return authentication.getRoles().contains(role);
    }

    public static boolean isAdmin(Authentication authentication) {
        return hasRole(authentication, ROLE_ADMIN);
    }

    public static boolean isOwner(Authentication authentication, Long resourceId) {
        return resourceId != null && resourceId.equals(getUserId(authentication));
    }

    public static void requireOwnerOrAdmin(Authentication authentication, Long resourceId) {
        if (!isAdmin(authentication) && !isOwner(authentication, resourceId)) {
            throw new AcessoNegadoException("Voce nao tem permissao para acessar este recurso.");
        }
    }
}

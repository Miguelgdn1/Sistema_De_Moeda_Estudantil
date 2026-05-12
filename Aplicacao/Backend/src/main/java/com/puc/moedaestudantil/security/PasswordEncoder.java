package com.puc.moedaestudantil.security;

import at.favre.lib.crypto.bcrypt.BCrypt;
import jakarta.inject.Singleton;

@Singleton
public class PasswordEncoder {

    private static final int COST = 12;

    public String hash(String senhaPlain) {
        return BCrypt.withDefaults().hashToString(COST, senhaPlain.toCharArray());
    }

    public boolean matches(String senhaPlain, String senhaHash) {
        return BCrypt.verifyer().verify(senhaPlain.toCharArray(), senhaHash).verified;
    }
}

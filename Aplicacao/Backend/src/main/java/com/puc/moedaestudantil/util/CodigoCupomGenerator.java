package com.puc.moedaestudantil.util;

import java.security.SecureRandom;

public final class CodigoCupomGenerator {

    // Base32 Crockford sem caracteres ambiguos (sem I, L, O, U).
    private static final char[] ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".toCharArray();
    private static final SecureRandom RNG = new SecureRandom();
    private static final int TAMANHO = 10;

    private CodigoCupomGenerator() {}

    public static String gerar() {
        char[] chars = new char[TAMANHO];
        for (int i = 0; i < TAMANHO; i++) {
            chars[i] = ALPHABET[RNG.nextInt(ALPHABET.length)];
        }
        return new String(chars);
    }
}

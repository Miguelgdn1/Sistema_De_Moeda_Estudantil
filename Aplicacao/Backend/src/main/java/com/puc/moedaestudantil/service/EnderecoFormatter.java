package com.puc.moedaestudantil.service;

public final class EnderecoFormatter {

    private EnderecoFormatter() {}

    public static String format(String logradouro, String numero, String complemento,
                                String bairro, String cidade, String uf, String cep) {
        StringBuilder principal = new StringBuilder();
        if (notBlank(logradouro)) principal.append(logradouro);
        if (notBlank(numero)) {
            if (principal.length() > 0) principal.append(", ");
            principal.append(numero);
        }
        if (notBlank(complemento)) {
            if (principal.length() > 0) principal.append(" - ");
            principal.append(complemento);
        }
        if (notBlank(bairro)) {
            if (principal.length() > 0) principal.append(" - ");
            principal.append(bairro);
        }

        StringBuilder localidade = new StringBuilder();
        if (notBlank(cidade)) localidade.append(cidade);
        if (notBlank(uf)) {
            if (localidade.length() > 0) localidade.append("/");
            localidade.append(uf);
        }

        StringBuilder out = new StringBuilder();
        if (principal.length() > 0) out.append(principal);
        if (localidade.length() > 0) {
            if (out.length() > 0) out.append(", ");
            out.append(localidade);
        }
        if (notBlank(cep)) {
            if (out.length() > 0) out.append(" - CEP ");
            else out.append("CEP ");
            out.append(cep);
        }
        return out.length() > 0 ? out.toString() : null;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}

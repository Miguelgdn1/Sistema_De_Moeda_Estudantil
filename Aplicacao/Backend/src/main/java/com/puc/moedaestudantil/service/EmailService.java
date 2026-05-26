package com.puc.moedaestudantil.service;

import java.util.Map;

public interface EmailService {

    void enviar(String para, String assunto, String corpoHtml);

    void enviarTemplate(String para, String assunto, String template, Map<String, String> variaveis);

    void enviarComAnexo(String para, String assunto, String corpoHtml, byte[] anexo, String nomeAnexo, String contentId);
}

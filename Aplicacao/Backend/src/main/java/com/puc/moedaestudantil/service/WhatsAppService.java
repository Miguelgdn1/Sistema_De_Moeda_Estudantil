package com.puc.moedaestudantil.service;

import io.micronaut.context.annotation.Value;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Singleton
public class WhatsAppService {

    private static final Logger LOG = LoggerFactory.getLogger(WhatsAppService.class);

    private final boolean enabled;
    private final String baseUrl;
    private final String phoneNumberId;
    private final String accessToken;
    private final String templateName;
    private final String templateLanguage;
    private final HttpClient http;

    public WhatsAppService(@Value("${whatsapp.enabled:false}") boolean enabled,
                           @Value("${whatsapp.base-url:https://graph.facebook.com/v22.0}") String baseUrl,
                           @Value("${whatsapp.phone-number-id:}") String phoneNumberId,
                           @Value("${whatsapp.access-token:}") String accessToken,
                           @Value("${whatsapp.template-name:coupon_redemption}") String templateName,
                           @Value("${whatsapp.template-language:pt_BR}") String templateLanguage) {
        this.enabled = enabled;
        this.baseUrl = baseUrl;
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.templateName = templateName;
        this.templateLanguage = templateLanguage;
        this.http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    public void enviarCupom(String telefoneE164, Map<String, String> variaveis) {
        if (!enabled) {
            LOG.info("[whatsapp.enabled=false] simulando envio de cupom para {} (vars={})",
                telefoneE164, variaveis);
            return;
        }
        if (phoneNumberId == null || phoneNumberId.isBlank()
            || accessToken == null || accessToken.isBlank()) {
            LOG.warn("WhatsApp habilitado mas credenciais Meta nao configuradas. Pulando envio.");
            return;
        }

        String url = baseUrl + "/" + phoneNumberId + "/messages";
        String to = normalizarTelefone(telefoneE164);
        String payload = montarPayloadTemplate(to,
            variaveis.getOrDefault("nomeAluno", ""),
            variaveis.getOrDefault("nomeVantagem", ""),
            variaveis.getOrDefault("codigoCupom", ""));

        try {
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                LOG.info("WhatsApp enviado para {} (HTTP {})", to, resp.statusCode());
            } else {
                LOG.error("Falha WhatsApp para {}: HTTP {} body={}", to, resp.statusCode(), resp.body());
                throw new RuntimeException("WhatsApp Cloud API retornou HTTP " + resp.statusCode());
            }
        } catch (Exception e) {
            LOG.error("Erro ao enviar WhatsApp para {}: {}", to, e.getMessage());
            throw new RuntimeException("Falha no envio de WhatsApp", e);
        }
    }

    private String normalizarTelefone(String e164) {
        if (e164 == null) return "";
        return e164.startsWith("+") ? e164.substring(1) : e164;
    }

    // Monta payload de template com 3 parametros no body: nome_aluno, nome_vantagem, codigo_cupom.
    private String montarPayloadTemplate(String to, String nomeAluno, String nomeVantagem, String codigoCupom) {
        String escAluno = escape(nomeAluno);
        String escVantagem = escape(nomeVantagem);
        String escCodigo = escape(codigoCupom);

        return "{"
            + "\"messaging_product\":\"whatsapp\","
            + "\"to\":\"" + escape(to) + "\","
            + "\"type\":\"template\","
            + "\"template\":{"
            +   "\"name\":\"" + escape(templateName) + "\","
            +   "\"language\":{\"code\":\"" + escape(templateLanguage) + "\"},"
            +   "\"components\":[{"
            +     "\"type\":\"body\","
            +     "\"parameters\":["
            +       "{\"type\":\"text\",\"text\":\"" + escAluno + "\"},"
            +       "{\"type\":\"text\",\"text\":\"" + escVantagem + "\"},"
            +       "{\"type\":\"text\",\"text\":\"" + escCodigo + "\"}"
            +     "]"
            +   "}]"
            + "}}";
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}

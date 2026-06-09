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

/**
 * Integracao com WhatsApp via API NAO OFICIAL (Evolution API).
 *
 * Diferente da Meta Cloud API (oficial), a Evolution API e um gateway self-hosted
 * (roda em Docker) que conversa com o WhatsApp Web pareando um numero real atraves
 * de um QR Code. Nao exige conta Meta Business, numero verificado nem aprovacao de
 * templates: o backend apenas faz POST HTTP para o gateway, que entrega a mensagem.
 *
 * Endpoints usados (Evolution API v2):
 *   POST {baseUrl}/message/sendText/{instance}    header: apikey   body: {number, text}
 *   POST {baseUrl}/message/sendMedia/{instance}   header: apikey   body: {number, mediatype, media, fileName, caption}
 *
 * Quando ha QR Code do cupom, enviamos uma unica mensagem de imagem (o proprio QR)
 * com legenda contendo os dados do cupom. Sem QR, cai no envio de texto simples.
 */
@Singleton
public class WhatsAppService {

    private static final Logger LOG = LoggerFactory.getLogger(WhatsAppService.class);

    private final boolean enabled;
    private final String baseUrl;
    private final String instance;
    private final String apiKey;
    private final String countryCode;
    private final boolean sendQrImage;
    private final HttpClient http;

    public WhatsAppService(@Value("${whatsapp.enabled:false}") boolean enabled,
                           @Value("${whatsapp.base-url:`http://localhost:8081`}") String baseUrl,
                           @Value("${whatsapp.instance:moedaestudantil}") String instance,
                           @Value("${whatsapp.api-key:}") String apiKey,
                           @Value("${whatsapp.country-code:55}") String countryCode,
                           @Value("${whatsapp.send-qr-image:true}") boolean sendQrImage) {
        this.enabled = enabled;
        this.baseUrl = stripTrailingSlash(baseUrl);
        this.instance = instance;
        this.apiKey = apiKey;
        this.countryCode = countryCode == null ? "" : countryCode.replaceAll("\\D", "");
        this.sendQrImage = sendQrImage;
        this.http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    /**
     * Envia o cupom de resgate por WhatsApp. Falhas sao propagadas para que a mensagem
     * caia na DLQ do RabbitMQ (o consumer re-lanca a excecao).
     */
    public void enviarCupom(String telefone, Map<String, String> variaveis, String qrCodeBase64) {
        if (!enabled) {
            LOG.info("[whatsapp.enabled=false] simulando envio de cupom para {} (vars={})",
                telefone, variaveis);
            return;
        }
        if (baseUrl == null || baseUrl.isBlank()
            || instance == null || instance.isBlank()
            || apiKey == null || apiKey.isBlank()) {
            LOG.warn("WhatsApp habilitado mas Evolution API nao configurada (base-url/instance/api-key). Pulando envio.");
            return;
        }

        String numero = normalizarTelefone(telefone);
        if (numero.isBlank()) {
            LOG.warn("Telefone invalido para WhatsApp ('{}'). Pulando envio.", telefone);
            return;
        }

        String texto = montarTexto(variaveis);

        if (sendQrImage && qrCodeBase64 != null && !qrCodeBase64.isBlank()) {
            String fileName = "cupom-" + variaveis.getOrDefault("codigoCupom", "qr") + ".png";
            enviarMedia(numero, qrCodeBase64, fileName, texto);
        } else {
            enviarTexto(numero, texto);
        }
    }

    private void enviarTexto(String numero, String texto) {
        String url = baseUrl + "/message/sendText/" + instance;
        String payload = "{"
            + "\"number\":\"" + escape(numero) + "\","
            + "\"text\":\"" + escape(texto) + "\""
            + "}";
        post(url, payload, numero, "texto");
    }

    private void enviarMedia(String numero, String qrCodeBase64, String fileName, String legenda) {
        String url = baseUrl + "/message/sendMedia/" + instance;
        String payload = "{"
            + "\"number\":\"" + escape(numero) + "\","
            + "\"mediatype\":\"image\","
            + "\"mimetype\":\"image/png\","
            + "\"fileName\":\"" + escape(fileName) + "\","
            + "\"caption\":\"" + escape(legenda) + "\","
            + "\"media\":\"" + qrCodeBase64 + "\""
            + "}";
        post(url, payload, numero, "media");
    }

    private void post(String url, String payload, String numero, String tipo) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .header("apikey", apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                LOG.info("WhatsApp ({}) enviado para {} via Evolution API (HTTP {})", tipo, numero, resp.statusCode());
            } else {
                LOG.error("Falha WhatsApp ({}) para {}: HTTP {} body={}", tipo, numero, resp.statusCode(), resp.body());
                throw new RuntimeException("Evolution API retornou HTTP " + resp.statusCode());
            }
        } catch (Exception e) {
            LOG.error("Erro ao enviar WhatsApp ({}) para {}: {}", tipo, numero, e.getMessage());
            throw new RuntimeException("Falha no envio de WhatsApp", e);
        }
    }

    private String montarTexto(Map<String, String> v) {
        String nomeAluno = v.getOrDefault("nomeAluno", "");
        String nomeVantagem = v.getOrDefault("nomeVantagem", "");
        String nomeEmpresa = v.getOrDefault("nomeEmpresa", "");
        String codigo = v.getOrDefault("codigoCupom", "");
        String validade = v.getOrDefault("dataExpiracao", "");

        StringBuilder sb = new StringBuilder();
        sb.append("*Sistema de Moeda Estudantil* 🎓\n\n");
        if (!nomeAluno.isBlank()) {
            sb.append("Ola, ").append(nomeAluno).append("!\n");
        }
        sb.append("Seu cupom de resgate foi gerado com sucesso.\n\n");
        if (!nomeVantagem.isBlank()) {
            sb.append("🎁 Vantagem: ").append(nomeVantagem).append("\n");
        }
        if (!nomeEmpresa.isBlank()) {
            sb.append("🏢 Parceiro: ").append(nomeEmpresa).append("\n");
        }
        sb.append("🔑 Codigo: *").append(codigo).append("*\n");
        if (!validade.isBlank()) {
            sb.append("⏳ Valido ate: ").append(validade).append("\n");
        }
        sb.append("\nApresente este codigo (ou o QR Code) no parceiro para usar o beneficio.");
        return sb.toString();
    }

    /**
     * Normaliza para o formato esperado pelo WhatsApp: somente digitos, com codigo do pais.
     * Ex.: "+55 (31) 99999-9999" -> "5531999999999"; "(31) 99999-9999" -> "5531999999999".
     */
    private String normalizarTelefone(String telefone) {
        if (telefone == null) return "";
        String digitos = telefone.replaceAll("\\D", "");
        if (digitos.isBlank()) return "";
        if (!countryCode.isBlank() && !digitos.startsWith(countryCode)) {
            digitos = countryCode + digitos;
        }
        return digitos;
    }

    private static String stripTrailingSlash(String s) {
        if (s == null) return "";
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}

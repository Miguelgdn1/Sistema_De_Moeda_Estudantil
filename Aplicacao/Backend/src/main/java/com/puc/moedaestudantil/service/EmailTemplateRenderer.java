package com.puc.moedaestudantil.service;

import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Singleton
public class EmailTemplateRenderer {

    private static final Logger LOG = LoggerFactory.getLogger(EmailTemplateRenderer.class);

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public String render(String templateName, Map<String, String> variaveis) {
        String raw = cache.computeIfAbsent(templateName, this::load);
        if (raw == null) {
            return null;
        }
        String out = raw;
        if (variaveis != null) {
            for (Map.Entry<String, String> e : variaveis.entrySet()) {
                String value = e.getValue() != null ? e.getValue() : "";
                out = out.replace("{{" + e.getKey() + "}}", value);
            }
        }
        return out;
    }

    private String load(String templateName) {
        String path = "email-templates/" + templateName + ".html";
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(path)) {
            if (in == null) {
                LOG.warn("Template de e-mail nao encontrado: {}", path);
                return null;
            }
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            in.transferTo(buf);
            return buf.toString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            LOG.error("Falha ao ler template {}: {}", path, e.getMessage());
            return null;
        }
    }
}

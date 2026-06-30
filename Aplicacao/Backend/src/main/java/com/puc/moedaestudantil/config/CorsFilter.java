package com.puc.moedaestudantil.config;

import io.micronaut.context.annotation.Value;
import io.micronaut.http.HttpMethod;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.RequestFilter;
import io.micronaut.http.annotation.ResponseFilter;
import io.micronaut.http.annotation.ServerFilter;
import io.micronaut.http.filter.ServerFilterPhase;
import jakarta.annotation.Nullable;

/**
 * Filtro CORS de alta prioridade que intercepta requests OPTIONS (preflight)
 * ANTES do Micronaut Security, resolvendo o problema de 405 Method Not Allowed
 * em deploys com origens diferentes (Vercel frontend → Render backend).
 */
@ServerFilter("/**")
public class CorsFilter {

    @Value("${micronaut.server.cors.configurations.web.allowed-origins[0]:http://localhost:4200}")
    private String allowedOrigin;

    @RequestFilter(order = ServerFilterPhase.SECURITY.before())
    @Nullable
    public HttpResponse<?> filterRequest(HttpRequest<?> request) {
        if (request.getMethod() == HttpMethod.OPTIONS) {
            String origin = request.getHeaders().getOrigin().orElse("");
            if (isOriginAllowed(origin)) {
                return HttpResponse.ok()
                    .header("Access-Control-Allow-Origin", origin)
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Authorization, Content-Type")
                    .header("Access-Control-Max-Age", "3600");
            }
        }
        return null; // continua processamento normal
    }

    @ResponseFilter(order = ServerFilterPhase.SECURITY.before())
    public void filterResponse(HttpRequest<?> request, MutableHttpResponse<?> response) {
        String origin = request.getHeaders().getOrigin().orElse("");
        if (isOriginAllowed(origin)) {
            response.header("Access-Control-Allow-Origin", origin);
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
        }
    }

    private boolean isOriginAllowed(String origin) {
        if (origin == null || origin.isEmpty()) return false;
        // Aceita a origem configurada ou qualquer HTTPS (deploy Vercel)
        // ou localhost para desenvolvimento
        return origin.equals(allowedOrigin)
            || origin.startsWith("https://")
            || origin.matches("^http://localhost(:\\d+)?$");
    }
}

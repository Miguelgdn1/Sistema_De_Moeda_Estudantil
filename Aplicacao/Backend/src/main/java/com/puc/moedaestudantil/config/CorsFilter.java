package com.puc.moedaestudantil.config;

import io.micronaut.core.order.Ordered;
import io.micronaut.http.HttpMethod;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.Filter;
import io.micronaut.http.filter.HttpServerFilter;
import io.micronaut.http.filter.ServerFilterChain;
import org.reactivestreams.Publisher;
import io.micronaut.core.async.publisher.Publishers;

/**
 * Filtro CORS de alta prioridade que intercepta requests OPTIONS (preflight)
 * ANTES do Micronaut Security, resolvendo o problema de 405 Method Not Allowed
 * em deploys com origens diferentes (Vercel frontend → Render backend).
 */
@Filter("/**")
public class CorsFilter implements HttpServerFilter, Ordered {

    private static final int ORDER = -100;

    @Override
    public int getOrder() {
        return ORDER;
    }

    @Override
    public Publisher<MutableHttpResponse<?>> doFilter(HttpRequest<?> request, ServerFilterChain chain) {
        String origin = request.getHeaders().getOrigin().orElse("");

        if (request.getMethod() == HttpMethod.OPTIONS && isOriginAllowed(origin)) {
            MutableHttpResponse<?> response = HttpResponse.ok()
                .header("Access-Control-Allow-Origin", origin)
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "Authorization, Content-Type")
                .header("Access-Control-Max-Age", "3600");
            return Publishers.just(response);
        }

        if (isOriginAllowed(origin)) {
            return Publishers.map(chain.proceed(request), response -> {
                response.header("Access-Control-Allow-Origin", origin);
                response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
                return response;
            });
        }

        return chain.proceed(request);
    }

    private boolean isOriginAllowed(String origin) {
        if (origin == null || origin.isEmpty()) return false;
        return origin.startsWith("https://") || origin.matches("^http://localhost(:\\d+)?$");
    }
}

package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.request.LoginRequest;
import com.puc.moedaestudantil.dto.response.LoginResponse;
import com.puc.moedaestudantil.service.AuthService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Autenticacao")
@Controller("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Autentica usuario e retorna token JWT")
    @ApiResponse(responseCode = "200", description = "Login bem-sucedido")
    @ApiResponse(responseCode = "401", description = "Credenciais invalidas")
    @Post("/login")
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<LoginResponse> login(@Body @Valid LoginRequest request) {
        return HttpResponse.ok(authService.login(request));
    }
}

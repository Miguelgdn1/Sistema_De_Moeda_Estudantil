package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.LoginRequestDTO;
import com.puc.moedaestudantil.dto.LoginResponseDTO;
import com.puc.moedaestudantil.service.AuthService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import jakarta.inject.Inject;
import jakarta.validation.Valid;

@Controller("/api/auth")
public class AuthController {

    @Inject
    private AuthService authService;

    @Post("/login")
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<LoginResponseDTO> login(@Body @Valid LoginRequestDTO dto) {
        return HttpResponse.ok(authService.login(dto));
    }
}

package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.request.ResgateRequest;
import com.puc.moedaestudantil.dto.response.ResgateResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.security.AuthenticatedUser;
import com.puc.moedaestudantil.service.ResgateService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;

@Tag(name = "Resgates")
@Controller("/api/resgates")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class ResgateController {

    private final ResgateService resgateService;

    public ResgateController(ResgateService resgateService) {
        this.resgateService = resgateService;
    }

    @Operation(summary = "Aluno realiza resgate de uma vantagem")
    @ApiResponse(responseCode = "201", description = "Resgate efetuado, retorna cupom + QR Code")
    @Post
    @Secured(AuthenticatedUser.ROLE_ALUNO)
    public HttpResponse<ResgateResponse> resgatar(@Body @Valid ResgateRequest request,
                                                  Authentication authentication) {
        Long alunoId = AuthenticatedUser.getUserId(authentication);
        return HttpResponse.created(resgateService.resgatar(alunoId, request.vantagemId()));
    }

    @Operation(summary = "Lista os cupons (resgates) do aluno autenticado")
    @Get("/meus")
    @Secured(AuthenticatedUser.ROLE_ALUNO)
    public List<TransacaoResponse> meusCupons(Authentication authentication) {
        Long alunoId = AuthenticatedUser.getUserId(authentication);
        return resgateService.listarCuponsDoAluno(alunoId);
    }
}

package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.request.DistribuirMoedasRequest;
import com.puc.moedaestudantil.dto.response.ExtratoResponse;
import com.puc.moedaestudantil.dto.response.ProfessorResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.security.AuthenticatedUser;
import com.puc.moedaestudantil.service.ProfessorService;
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

@Tag(name = "Professores")
@Controller("/api/professores")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class ProfessorController {

    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @Operation(summary = "Lista professores (admin)")
    @Get
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public List<ProfessorResponse> listar() {
        return professorService.listarTodos();
    }

    @Operation(summary = "Retorna o perfil do professor autenticado")
    @Get("/me")
    @Secured(AuthenticatedUser.ROLE_PROFESSOR)
    public ProfessorResponse obterMeuPerfil(Authentication authentication) {
        Long id = AuthenticatedUser.getUserId(authentication);
        return professorService.buscarPorId(id);
    }

    @Operation(summary = "Busca professor por ID (proprietario ou admin)")
    @Get("/{id}")
    public ProfessorResponse buscar(Long id, Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return professorService.buscarPorId(id);
    }

    @Operation(summary = "Retorna extrato de envios do professor")
    @Get("/{id}/extrato")
    public ExtratoResponse obterExtrato(Long id, Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return professorService.obterExtrato(id);
    }

    @Operation(summary = "Distribui moedas para um aluno")
    @ApiResponse(responseCode = "201", description = "Transacao registrada")
    @Post("/{id}/distribuir")
    @Secured(AuthenticatedUser.ROLE_PROFESSOR)
    public HttpResponse<TransacaoResponse> distribuirMoedas(Long id,
                                                            @Body @Valid DistribuirMoedasRequest request,
                                                            Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return HttpResponse.created(professorService.distribuirMoedas(id, request));
    }
}

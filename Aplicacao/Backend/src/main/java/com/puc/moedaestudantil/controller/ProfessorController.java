package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.request.AjusteSaldoRequest;
import com.puc.moedaestudantil.dto.request.DistribuirMoedasRequest;
import com.puc.moedaestudantil.dto.request.ProfessorRequest;
import com.puc.moedaestudantil.dto.response.ExtratoResponse;
import com.puc.moedaestudantil.dto.response.ProfessorResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.security.AuthenticatedUser;
import com.puc.moedaestudantil.service.ProfessorService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Delete;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.annotation.Put;
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

    @Operation(summary = "Cadastra um novo professor (admin)")
    @ApiResponse(responseCode = "201", description = "Professor criado")
    @Post
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public HttpResponse<ProfessorResponse> cadastrar(@Body @Valid ProfessorRequest request) {
        return HttpResponse.created(professorService.cadastrar(request));
    }

    @Operation(summary = "Atualiza dados de um professor (admin)")
    @Put("/{id}")
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public ProfessorResponse atualizar(Long id, @Body @Valid ProfessorRequest request) {
        return professorService.atualizar(id, request);
    }

    @Operation(summary = "Exclui (soft-delete) um professor")
    @ApiResponse(responseCode = "204", description = "Professor removido")
    @Delete("/{id}")
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public HttpResponse<Void> deletar(Long id) {
        professorService.deletar(id);
        return HttpResponse.noContent();
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

    @Operation(summary = "Ajusta saldo do professor (admin) — quantidade pode ser positiva ou negativa")
    @Post("/{id}/saldo")
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public ProfessorResponse ajustarSaldo(Long id, @Body @Valid AjusteSaldoRequest request) {
        return professorService.ajustarSaldo(id, request.quantidade());
    }
}

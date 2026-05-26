package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.request.AjusteSaldoRequest;
import com.puc.moedaestudantil.dto.request.AlunoRequest;
import com.puc.moedaestudantil.dto.response.AlunoResponse;
import com.puc.moedaestudantil.security.AuthenticatedUser;
import com.puc.moedaestudantil.service.AlunoService;
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

@Tag(name = "Alunos")
@Controller("/api/alunos")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class AlunoController {

    private final AlunoService alunoService;

    public AlunoController(AlunoService alunoService) {
        this.alunoService = alunoService;
    }

    @Operation(summary = "Cadastra um aluno")
    @ApiResponse(responseCode = "201", description = "Aluno criado")
    @Post
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<AlunoResponse> cadastrar(@Body @Valid AlunoRequest request) {
        return HttpResponse.created(alunoService.cadastrar(request));
    }

    @Operation(summary = "Lista todos os alunos ativos")
    @Get
    @Secured({AuthenticatedUser.ROLE_ADMIN, AuthenticatedUser.ROLE_PROFESSOR})
    public List<AlunoResponse> listar() {
        return alunoService.listarTodos();
    }

    @Operation(summary = "Busca aluno por ID")
    @Get("/{id}")
    public AlunoResponse buscar(Long id, Authentication authentication) {
        if (!AuthenticatedUser.isAdmin(authentication)
            && !AuthenticatedUser.hasRole(authentication, AuthenticatedUser.ROLE_PROFESSOR)) {
            AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        }
        return alunoService.buscarPorId(id);
    }

    @Operation(summary = "Atualiza dados de um aluno (admin)")
    @Put("/{id}")
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public AlunoResponse atualizar(Long id, @Body @Valid AlunoRequest request) {
        return alunoService.atualizar(id, request);
    }

    @Operation(summary = "Exclui (soft-delete) um aluno")
    @ApiResponse(responseCode = "204", description = "Aluno removido")
    @Delete("/{id}")
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public HttpResponse<Void> deletar(Long id) {
        alunoService.deletar(id);
        return HttpResponse.noContent();
    }

    @Operation(summary = "Ajusta saldo do aluno (admin) — quantidade pode ser positiva ou negativa")
    @Post("/{id}/saldo")
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public AlunoResponse ajustarSaldo(Long id, @Body @Valid AjusteSaldoRequest request) {
        return alunoService.ajustarSaldo(id, request.quantidade());
    }
}

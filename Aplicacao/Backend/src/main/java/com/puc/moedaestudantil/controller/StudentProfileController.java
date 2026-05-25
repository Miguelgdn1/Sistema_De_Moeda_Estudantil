package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.request.AlunoUpdateRequest;
import com.puc.moedaestudantil.dto.response.AlunoResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.security.AuthenticatedUser;
import com.puc.moedaestudantil.service.AlunoService;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Put;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;

@Tag(name = "Perfil do Aluno")
@Controller("/api/students")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class StudentProfileController {

    private final AlunoService alunoService;

    public StudentProfileController(AlunoService alunoService) {
        this.alunoService = alunoService;
    }

    @Operation(summary = "Retorna o perfil do aluno autenticado (ou admin)")
    @Get("/{id}/profile")
    public AlunoResponse getProfile(@PathVariable Long id, Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return alunoService.buscarPorId(id);
    }

    @Operation(summary = "Atualiza nome, email, endereco e/ou senha do aluno")
    @Put("/{id}/profile")
    public AlunoResponse updateProfile(@PathVariable Long id,
                                       @Body @Valid AlunoUpdateRequest request,
                                       Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return alunoService.atualizarPerfil(id, request);
    }

    @Operation(summary = "Lista extrato de transacoes do aluno")
    @Get("/{id}/extrato")
    public List<TransacaoResponse> getStudentExtract(@PathVariable Long id, Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return alunoService.listarExtrato(id);
    }
}

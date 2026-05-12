package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.AlunoRequestDTO;
import com.puc.moedaestudantil.dto.AlunoResponseDTO;
import com.puc.moedaestudantil.model.Aluno;
import com.puc.moedaestudantil.service.AlunoService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import java.util.List;

@Controller("/api/alunos")
public class AlunoController {

    @Inject
    private AlunoService alunoService;

    @Post
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<AlunoResponseDTO> cadastrar(@Body @Valid AlunoRequestDTO dto) {
        Aluno novo = alunoService.cadastrar(dto);
        return HttpResponse.created(AlunoResponseDTO.fromEntity(novo));
    }

    @Get
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<List<AlunoResponseDTO>> listar() {
        List<AlunoResponseDTO> dtos = alunoService.listarTodos().stream()
                .map(AlunoResponseDTO::fromEntity)
                .toList();
        return HttpResponse.ok(dtos);
    }

    @Get("/{id}")
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<AlunoResponseDTO> buscar(Long id) {
        return HttpResponse.ok(AlunoResponseDTO.fromEntity(alunoService.buscarPorId(id)));
    }

    @Put("/{id}")
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<AlunoResponseDTO> atualizar(Long id, @Body @Valid AlunoRequestDTO dto) {
        return HttpResponse.ok(AlunoResponseDTO.fromEntity(alunoService.atualizar(id, dto)));
    }

    @Delete("/{id}")
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<Void> deletar(Long id) {
        alunoService.deletar(id);
        return HttpResponse.noContent();
    }
}

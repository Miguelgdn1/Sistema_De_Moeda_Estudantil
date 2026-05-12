package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.EmpresaParceiraRequestDTO;
import com.puc.moedaestudantil.dto.EmpresaParceiraResponseDTO;
import com.puc.moedaestudantil.model.EmpresaParceira;
import com.puc.moedaestudantil.service.EmpresaParceiraService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import java.util.List;

@Controller("/api/empresas")
public class EmpresaParceiraController {

    @Inject
    private EmpresaParceiraService empresaService;

    @Post
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<EmpresaParceiraResponseDTO> cadastrar(@Body @Valid EmpresaParceiraRequestDTO dto) {
        EmpresaParceira nova = empresaService.cadastrar(dto);
        return HttpResponse.created(EmpresaParceiraResponseDTO.fromEntity(nova));
    }

    @Get
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<List<EmpresaParceiraResponseDTO>> listar() {
        List<EmpresaParceiraResponseDTO> dtos = empresaService.listarTodas().stream()
                .map(EmpresaParceiraResponseDTO::fromEntity)
                .toList();
        return HttpResponse.ok(dtos);
    }

    @Get("/{id}")
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<EmpresaParceiraResponseDTO> buscar(Long id) {
        return HttpResponse.ok(EmpresaParceiraResponseDTO.fromEntity(empresaService.buscarPorId(id)));
    }

    @Put("/{id}")
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<EmpresaParceiraResponseDTO> atualizar(Long id, @Body @Valid EmpresaParceiraRequestDTO dto) {
        return HttpResponse.ok(EmpresaParceiraResponseDTO.fromEntity(empresaService.atualizar(id, dto)));
    }

    @Delete("/{id}")
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<Void> deletar(Long id) {
        empresaService.deletar(id);
        return HttpResponse.noContent();
    }
}

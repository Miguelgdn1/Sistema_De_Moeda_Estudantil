package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.request.EmpresaParceiraRequest;
import com.puc.moedaestudantil.dto.request.EmpresaParceiraUpdateRequest;
import com.puc.moedaestudantil.dto.response.EmpresaParceiraResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.security.AuthenticatedUser;
import com.puc.moedaestudantil.service.EmpresaParceiraService;
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

@Tag(name = "Empresas Parceiras")
@Controller("/api/empresas")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class EmpresaParceiraController {

    private final EmpresaParceiraService empresaService;

    public EmpresaParceiraController(EmpresaParceiraService empresaService) {
        this.empresaService = empresaService;
    }

    @Operation(summary = "Cadastra empresa parceira")
    @ApiResponse(responseCode = "201", description = "Empresa criada")
    @Post
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<EmpresaParceiraResponse> cadastrar(@Body @Valid EmpresaParceiraRequest request) {
        return HttpResponse.created(empresaService.cadastrar(request));
    }

    @Operation(summary = "Lista empresas parceiras (admin)")
    @Get
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public List<EmpresaParceiraResponse> listar() {
        return empresaService.listarTodas();
    }

    @Operation(summary = "Busca empresa por ID (proprietaria ou admin)")
    @Get("/{id}")
    public EmpresaParceiraResponse buscar(Long id, Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return empresaService.buscarPorId(id);
    }

    @Operation(summary = "Atualiza empresa (proprietaria ou admin)")
    @Put("/{id}")
    public EmpresaParceiraResponse atualizar(Long id,
                                             @Body @Valid EmpresaParceiraUpdateRequest request,
                                             Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return empresaService.atualizar(id, request);
    }

    @Operation(summary = "Exclui (soft-delete) empresa")
    @ApiResponse(responseCode = "204", description = "Empresa removida")
    @Delete("/{id}")
    @Secured(AuthenticatedUser.ROLE_ADMIN)
    public HttpResponse<Void> deletar(Long id) {
        empresaService.deletar(id);
        return HttpResponse.noContent();
    }

    @Operation(summary = "Lista trocas (cupons usados) de uma empresa")
    @Get("/{id}/trocas")
    public List<TransacaoResponse> relatorioTrocas(Long id, Authentication authentication) {
        AuthenticatedUser.requireOwnerOrAdmin(authentication, id);
        return empresaService.listarTrocasPorEmpresa(id);
    }
}

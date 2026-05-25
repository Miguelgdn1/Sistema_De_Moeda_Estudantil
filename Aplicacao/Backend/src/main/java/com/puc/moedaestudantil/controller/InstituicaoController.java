package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.response.InstituicaoResponse;
import com.puc.moedaestudantil.service.InstituicaoService;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@Tag(name = "Instituicoes")
@Controller("/api/instituicoes")
public class InstituicaoController {

    private final InstituicaoService instituicaoService;

    public InstituicaoController(InstituicaoService instituicaoService) {
        this.instituicaoService = instituicaoService;
    }

    @Operation(summary = "Lista instituicoes ativas (publico)")
    @Get
    @Secured(SecurityRule.IS_ANONYMOUS)
    public List<InstituicaoResponse> listar() {
        return instituicaoService.listarTodas();
    }
}

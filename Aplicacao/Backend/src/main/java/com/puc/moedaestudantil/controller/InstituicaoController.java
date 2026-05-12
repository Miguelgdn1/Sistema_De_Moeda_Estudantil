package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.model.Instituicao;
import com.puc.moedaestudantil.repository.InstituicaoDAO;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import jakarta.inject.Inject;
import java.util.List;

@Controller("/api/instituicoes")
public class InstituicaoController {

    @Inject
    private InstituicaoDAO instituicaoDAO;

    @Get
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<List<Instituicao>> listar() {
        return HttpResponse.ok(instituicaoDAO.listarTodas());
    }
}

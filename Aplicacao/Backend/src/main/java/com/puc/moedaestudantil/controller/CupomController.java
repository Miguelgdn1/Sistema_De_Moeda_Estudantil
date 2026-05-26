package com.puc.moedaestudantil.controller;

import com.puc.moedaestudantil.dto.response.CupomValidacaoResponse;
import com.puc.moedaestudantil.security.AuthenticatedUser;
import com.puc.moedaestudantil.service.QrCodeService;
import com.puc.moedaestudantil.service.ResgateService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.annotation.Produces;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Cupons")
@Controller("/api/cupons")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class CupomController {

    private final ResgateService resgateService;
    private final QrCodeService qrCodeService;

    public CupomController(ResgateService resgateService, QrCodeService qrCodeService) {
        this.resgateService = resgateService;
        this.qrCodeService = qrCodeService;
    }

    @Operation(summary = "Gera o QR Code PNG de um cupom")
    @Get(value = "/{codigo}/qr-code", produces = MediaType.IMAGE_PNG)
    @Produces(MediaType.IMAGE_PNG)
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<byte[]> qrCode(@PathVariable String codigo) {
        // Anonimo proposital: o navegador (img tag) nao envia JWT.
        // O codigo do cupom ja e o segredo; quem nao o tem nao consegue gerar QR util.
        resgateService.validar(codigo); // valida que o cupom existe; lanca 404 se nao
        byte[] png = qrCodeService.gerarPng(codigo);
        return HttpResponse.ok(png).contentType(MediaType.IMAGE_PNG);
    }

    @Operation(summary = "Valida um cupom pelo codigo (empresa/admin)")
    @Get("/{codigo}/validar")
    @Secured({AuthenticatedUser.ROLE_EMPRESA, AuthenticatedUser.ROLE_ADMIN})
    public CupomValidacaoResponse validar(@PathVariable String codigo) {
        return resgateService.validar(codigo);
    }

    @Operation(summary = "Marca o cupom como utilizado (empresa dona ou admin)")
    @Post("/{codigo}/utilizar")
    @Secured({AuthenticatedUser.ROLE_EMPRESA, AuthenticatedUser.ROLE_ADMIN})
    public CupomValidacaoResponse utilizar(@PathVariable String codigo, Authentication authentication) {
        Long empresaId = AuthenticatedUser.getUserId(authentication);
        boolean isAdmin = AuthenticatedUser.isAdmin(authentication);
        return resgateService.marcarComoUsado(codigo, empresaId, isAdmin);
    }
}

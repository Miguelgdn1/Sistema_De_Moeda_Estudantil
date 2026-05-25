package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.model.Transacao;

final class TransacaoMapper {

    private TransacaoMapper() {}

    static TransacaoResponse toResponse(Transacao t) {
        String descricao = t.getMensagem();
        if (descricao == null || descricao.isBlank()) {
            if (t.getCodigoCupom() != null && !t.getCodigoCupom().isBlank()) {
                descricao = "Cupom: " + t.getCodigoCupom();
            } else if (t.getVantagem() != null) {
                descricao = t.getVantagem().getNome();
            } else {
                descricao = t.getTipo() != null ? t.getTipo().name() : "Transacao";
            }
        }
        Long alunoId = t.getAluno() != null ? t.getAluno().getId() : null;
        String alunoNome = t.getAluno() != null ? t.getAluno().getNome() : null;
        return new TransacaoResponse(
            t.getId(),
            t.getTipo() != null ? t.getTipo().name() : null,
            t.getQuantidadeMoedas(),
            t.getDataHora(),
            descricao,
            alunoId,
            alunoNome
        );
    }
}

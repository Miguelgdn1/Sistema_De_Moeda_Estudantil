package com.puc.moedaestudantil.dto;

import com.puc.moedaestudantil.model.Transacao;
import io.micronaut.serde.annotation.Serdeable;
import java.time.LocalDateTime;

@Serdeable
public record TransacaoResponseDTO(
    Long id,
    String tipo,
    Integer valor,
    LocalDateTime dataHora,
    String descricao,
    Long alunoId,
    String alunoNome
) {
    public static TransacaoResponseDTO fromEntity(Transacao transacao) {
        String descricao = transacao.getMensagem();
        if (descricao == null || descricao.isBlank()) {
            if (transacao.getCodigoCupom() != null && !transacao.getCodigoCupom().isBlank()) {
                descricao = "Cupom: " + transacao.getCodigoCupom();
            } else if (transacao.getVantagem() != null) {
                descricao = transacao.getVantagem().getNome();
            } else {
                descricao = transacao.getTipo() != null ? transacao.getTipo().name() : "Transação";
            }
        }
        Long alunoId = transacao.getAluno() != null ? transacao.getAluno().getId() : null;
        String alunoNome = transacao.getAluno() != null ? transacao.getAluno().getNome() : null;
        return new TransacaoResponseDTO(
            transacao.getId(),
            transacao.getTipo() != null ? transacao.getTipo().name() : null,
            transacao.getQuantidadeMoedas(),
            transacao.getDataHora(),
            descricao,
            alunoId,
            alunoNome
        );
    }
}

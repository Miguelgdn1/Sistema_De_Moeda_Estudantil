package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.request.DistribuirMoedasRequest;
import com.puc.moedaestudantil.dto.response.ExtratoResponse;
import com.puc.moedaestudantil.dto.response.ProfessorResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.exception.AlunoNaoEncontradoException;
import com.puc.moedaestudantil.exception.ProfessorNaoEncontradoException;
import com.puc.moedaestudantil.exception.SaldoInsuficienteException;
import com.puc.moedaestudantil.model.Aluno;
import com.puc.moedaestudantil.model.Professor;
import com.puc.moedaestudantil.model.TipoTransacao;
import com.puc.moedaestudantil.model.Transacao;
import com.puc.moedaestudantil.repository.AlunoRepository;
import com.puc.moedaestudantil.repository.ProfessorRepository;
import com.puc.moedaestudantil.repository.TransacaoRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Singleton
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;
    private final TransacaoRepository transacaoRepository;

    public ProfessorService(ProfessorRepository professorRepository,
                            AlunoRepository alunoRepository,
                            TransacaoRepository transacaoRepository) {
        this.professorRepository = professorRepository;
        this.alunoRepository = alunoRepository;
        this.transacaoRepository = transacaoRepository;
    }

    public List<ProfessorResponse> listarTodos() {
        return professorRepository.findAllByDeletedAtIsNull().stream()
            .map(this::toResponse)
            .toList();
    }

    public ProfessorResponse buscarPorId(Long id) {
        return toResponse(carregar(id));
    }

    public ExtratoResponse obterExtrato(Long professorId) {
        Professor professor = carregar(professorId);
        List<TransacaoResponse> transacoes = transacaoRepository.listarPorProfessor(professorId).stream()
            .map(TransacaoMapper::toResponse)
            .toList();
        return new ExtratoResponse(professor.getSaldoMoedas(), transacoes);
    }

    @Transactional
    public TransacaoResponse distribuirMoedas(Long professorId, DistribuirMoedasRequest request) {
        Professor professor = carregar(professorId);
        Aluno aluno = alunoRepository.findByIdAndDeletedAtIsNull(request.alunoId())
            .orElseThrow(() -> new AlunoNaoEncontradoException(request.alunoId()));

        int quantidade = request.quantidade();
        if (professor.getSaldoMoedas() < quantidade) {
            throw new SaldoInsuficienteException(professor.getSaldoMoedas(), quantidade);
        }

        professor.setSaldoMoedas(professor.getSaldoMoedas() - quantidade);
        aluno.setSaldoMoedas(aluno.getSaldoMoedas() + quantidade);
        professorRepository.update(professor);
        alunoRepository.update(aluno);

        Transacao transacao = new Transacao();
        transacao.setTipo(TipoTransacao.ENVIO_MOEDA);
        transacao.setQuantidadeMoedas(quantidade);
        transacao.setDataHora(LocalDateTime.now());
        transacao.setMensagem(request.mensagem());
        transacao.setProfessor(professor);
        transacao.setAluno(aluno);

        return TransacaoMapper.toResponse(transacaoRepository.save(transacao));
    }

    private Professor carregar(Long id) {
        return professorRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ProfessorNaoEncontradoException(id));
    }

    private ProfessorResponse toResponse(Professor p) {
        return new ProfessorResponse(
            p.getId(),
            p.getNome(),
            p.getEmail(),
            p.getCpf(),
            p.getDepartamento(),
            p.getInstituicao() != null ? p.getInstituicao().getId() : null,
            p.getInstituicao() != null ? p.getInstituicao().getNome() : null,
            p.getSaldoMoedas()
        );
    }
}

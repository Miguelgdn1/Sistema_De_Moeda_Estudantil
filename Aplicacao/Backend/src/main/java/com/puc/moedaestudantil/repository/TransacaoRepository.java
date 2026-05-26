package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Transacao;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransacaoRepository extends CrudRepository<Transacao, Long> {

    @Query("SELECT t FROM Transacao t WHERE t.aluno.id = :alunoId ORDER BY t.dataHora DESC")
    List<Transacao> listarPorAluno(Long alunoId);

    @Query("SELECT t FROM Transacao t WHERE t.professor.id = :professorId ORDER BY t.dataHora DESC")
    List<Transacao> listarPorProfessor(Long professorId);

    @Query("SELECT t FROM Transacao t WHERE t.vantagem IS NOT NULL AND t.vantagem.empresa.id = :empresaId ORDER BY t.dataHora DESC")
    List<Transacao> listarPorEmpresa(Long empresaId);

    @Query("SELECT t FROM Transacao t WHERE t.aluno.id = :alunoId AND t.tipo = com.puc.moedaestudantil.model.TipoTransacao.RESGATE_VANTAGEM ORDER BY t.dataHora DESC")
    List<Transacao> listarCuponsDoAluno(Long alunoId);

    Optional<Transacao> findByCodigoCupom(String codigoCupom);
}

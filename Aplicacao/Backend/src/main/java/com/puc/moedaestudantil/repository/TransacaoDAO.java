package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Transacao;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class TransacaoDAO {

    private final EntityManager entityManager;

    public TransacaoDAO(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public Transacao salvar(Transacao transacao) {
        entityManager.persist(transacao);
        return transacao;
    }

    @Transactional
    public Optional<Transacao> buscarPorId(Long id) {
        return Optional.ofNullable(entityManager.find(Transacao.class, id));
    }

    @Transactional
    public List<Transacao> listarTodas() {
        return entityManager.createQuery("SELECT t FROM Transacao t ORDER BY t.dataHora DESC", Transacao.class).getResultList();
    }

    @Transactional
    public List<Transacao> listarPorAluno(Long alunoId) {
        return entityManager.createQuery("SELECT t FROM Transacao t WHERE t.aluno.id = :id ORDER BY t.dataHora DESC", Transacao.class)
                .setParameter("id", alunoId)
                .getResultList();
    }

    @Transactional
    public List<Transacao> listarPorProfessor(Long professorId) {
        return entityManager.createQuery("SELECT t FROM Transacao t WHERE t.professor.id = :id ORDER BY t.dataHora DESC", Transacao.class)
                .setParameter("id", professorId)
                .getResultList();
    }
}

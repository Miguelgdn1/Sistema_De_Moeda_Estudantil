package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Professor;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class ProfessorDAO {

    private final EntityManager entityManager;

    public ProfessorDAO(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public Professor salvar(Professor professor) {
        entityManager.persist(professor);
        return professor;
    }

    @Transactional
    public Optional<Professor> buscarPorId(Long id) {
        return Optional.ofNullable(entityManager.find(Professor.class, id));
    }

    @Transactional
    public List<Professor> listarTodos() {
        return entityManager.createQuery("SELECT p FROM Professor p", Professor.class).getResultList();
    }

    @Transactional
    public Optional<Professor> buscarPorCpf(String cpf) {
        return entityManager.createQuery("SELECT p FROM Professor p WHERE p.cpf = :cpf", Professor.class)
                .setParameter("cpf", cpf)
                .getResultStream()
                .findFirst();
    }
}

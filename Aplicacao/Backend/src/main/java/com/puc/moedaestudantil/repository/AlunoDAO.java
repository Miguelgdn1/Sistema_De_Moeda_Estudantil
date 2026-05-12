package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Aluno;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class AlunoDAO {

    private final EntityManager entityManager;

    public AlunoDAO(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public Aluno salvar(Aluno aluno) {
        entityManager.persist(aluno);
        return aluno;
    }

    @Transactional
    public Aluno atualizar(Aluno aluno) {
        return entityManager.merge(aluno);
    }

    @Transactional
    public void deletar(Long id) {
        Aluno aluno = entityManager.find(Aluno.class, id);
        if (aluno != null) {
            entityManager.remove(aluno);
        }
    }

    @Transactional
    public Optional<Aluno> buscarPorId(Long id) {
        return Optional.ofNullable(entityManager.find(Aluno.class, id));
    }

    @Transactional
    public List<Aluno> listarTodos() {
        return entityManager.createQuery("SELECT a FROM Aluno a", Aluno.class).getResultList();
    }

    @Transactional
    public Optional<Aluno> buscarPorCpf(String cpf) {
        return entityManager.createQuery("SELECT a FROM Aluno a WHERE a.cpf = :cpf", Aluno.class)
                .setParameter("cpf", cpf)
                .getResultStream()
                .findFirst();
    }

    @Transactional
    public boolean existePorCpf(String cpf) {
        Long count = entityManager.createQuery("SELECT COUNT(a) FROM Aluno a WHERE a.cpf = :cpf", Long.class)
                .setParameter("cpf", cpf)
                .getSingleResult();
        return count > 0;
    }

    @Transactional
    public boolean existePorEmail(String email) {
        Long count = entityManager.createQuery("SELECT COUNT(u) FROM Usuario u WHERE u.email = :email", Long.class)
                .setParameter("email", email)
                .getSingleResult();
        return count > 0;
    }
}

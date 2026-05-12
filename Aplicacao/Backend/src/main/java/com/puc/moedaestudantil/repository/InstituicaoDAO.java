package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Instituicao;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class InstituicaoDAO {

    private final EntityManager entityManager;

    public InstituicaoDAO(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public Instituicao salvar(Instituicao instituicao) {
        entityManager.persist(instituicao);
        return instituicao;
    }

    @Transactional
    public Optional<Instituicao> buscarPorId(Long id) {
        return Optional.ofNullable(entityManager.find(Instituicao.class, id));
    }

    @Transactional
    public List<Instituicao> listarTodas() {
        return entityManager.createQuery("SELECT i FROM Instituicao i", Instituicao.class).getResultList();
    }

    @Transactional
    public Optional<Instituicao> buscarPorCnpj(String cnpj) {
        return entityManager.createQuery("SELECT i FROM Instituicao i WHERE i.cnpj = :cnpj", Instituicao.class)
                .setParameter("cnpj", cnpj)
                .getResultStream()
                .findFirst();
    }
}

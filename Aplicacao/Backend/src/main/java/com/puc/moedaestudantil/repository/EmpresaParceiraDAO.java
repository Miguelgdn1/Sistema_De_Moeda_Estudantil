package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.EmpresaParceira;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class EmpresaParceiraDAO {

    private final EntityManager entityManager;

    public EmpresaParceiraDAO(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public EmpresaParceira salvar(EmpresaParceira empresa) {
        entityManager.persist(empresa);
        return empresa;
    }

    @Transactional
    public EmpresaParceira atualizar(EmpresaParceira empresa) {
        return entityManager.merge(empresa);
    }

    @Transactional
    public void deletar(Long id) {
        EmpresaParceira e = entityManager.find(EmpresaParceira.class, id);
        if (e != null) {
            entityManager.remove(e);
        }
    }

    @Transactional
    public Optional<EmpresaParceira> buscarPorId(Long id) {
        return Optional.ofNullable(entityManager.find(EmpresaParceira.class, id));
    }

    @Transactional
    public List<EmpresaParceira> listarTodas() {
        return entityManager.createQuery("SELECT e FROM EmpresaParceira e", EmpresaParceira.class).getResultList();
    }

    @Transactional
    public Optional<EmpresaParceira> buscarPorCnpj(String cnpj) {
        return entityManager.createQuery("SELECT e FROM EmpresaParceira e WHERE e.cnpj = :cnpj", EmpresaParceira.class)
                .setParameter("cnpj", cnpj)
                .getResultStream()
                .findFirst();
    }

    @Transactional
    public boolean existePorCnpj(String cnpj) {
        Long count = entityManager.createQuery("SELECT COUNT(e) FROM EmpresaParceira e WHERE e.cnpj = :cnpj", Long.class)
                .setParameter("cnpj", cnpj)
                .getSingleResult();
        return count > 0;
    }
}

package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Vantagem;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class VantagemDAO {

    private final EntityManager entityManager;

    public VantagemDAO(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public Vantagem salvar(Vantagem vantagem) {
        entityManager.persist(vantagem);
        return vantagem;
    }

    @Transactional
    public Optional<Vantagem> buscarPorId(Long id) {
        return Optional.ofNullable(entityManager.find(Vantagem.class, id));
    }

    @Transactional
    public List<Vantagem> listarTodas() {
        return entityManager.createQuery("SELECT v FROM Vantagem v", Vantagem.class).getResultList();
    }

    @Transactional
    public List<Vantagem> listarPorEmpresa(Long empresaId) {
        return entityManager.createQuery("SELECT v FROM Vantagem v WHERE v.empresa.id = :id", Vantagem.class)
                .setParameter("id", empresaId)
                .getResultList();
    }
}

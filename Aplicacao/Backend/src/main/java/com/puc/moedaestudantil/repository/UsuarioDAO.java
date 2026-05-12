package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Usuario;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.Optional;

@Singleton
public class UsuarioDAO {

    private final EntityManager entityManager;

    public UsuarioDAO(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public Optional<Usuario> buscarPorEmail(String email) {
        return entityManager.createQuery("SELECT u FROM Usuario u WHERE u.email = :email", Usuario.class)
                .setParameter("email", email)
                .getResultStream()
                .findFirst();
    }
}

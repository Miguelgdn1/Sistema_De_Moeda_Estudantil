package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Professor;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessorRepository extends CrudRepository<Professor, Long> {

    Optional<Professor> findByIdAndDeletedAtIsNull(Long id);

    Optional<Professor> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    List<Professor> findAllByDeletedAtIsNull();
}

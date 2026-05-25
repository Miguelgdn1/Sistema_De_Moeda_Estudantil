package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Aluno;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlunoRepository extends CrudRepository<Aluno, Long> {

    Optional<Aluno> findByIdAndDeletedAtIsNull(Long id);

    List<Aluno> findAllByDeletedAtIsNull();

    boolean existsByCpf(String cpf);
}

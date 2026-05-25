package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Instituicao;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstituicaoRepository extends CrudRepository<Instituicao, Long> {

    Optional<Instituicao> findByIdAndDeletedAtIsNull(Long id);

    List<Instituicao> findAllByDeletedAtIsNull();
}

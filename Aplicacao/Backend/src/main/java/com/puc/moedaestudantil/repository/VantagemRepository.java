package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.Vantagem;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VantagemRepository extends CrudRepository<Vantagem, Long> {

    Optional<Vantagem> findByIdAndDeletedAtIsNull(Long id);

    List<Vantagem> findAllByDeletedAtIsNull();

    List<Vantagem> findAllByEmpresaIdAndDeletedAtIsNull(Long empresaId);
}

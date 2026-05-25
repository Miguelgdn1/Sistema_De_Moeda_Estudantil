package com.puc.moedaestudantil.repository;

import com.puc.moedaestudantil.model.EmpresaParceira;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmpresaParceiraRepository extends CrudRepository<EmpresaParceira, Long> {

    Optional<EmpresaParceira> findByIdAndDeletedAtIsNull(Long id);

    List<EmpresaParceira> findAllByDeletedAtIsNull();

    boolean existsByCnpj(String cnpj);
}

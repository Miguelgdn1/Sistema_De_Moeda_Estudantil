package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.response.InstituicaoResponse;
import com.puc.moedaestudantil.model.Instituicao;
import com.puc.moedaestudantil.repository.InstituicaoRepository;
import jakarta.inject.Singleton;
import java.util.List;

@Singleton
public class InstituicaoService {

    private final InstituicaoRepository instituicaoRepository;

    public InstituicaoService(InstituicaoRepository instituicaoRepository) {
        this.instituicaoRepository = instituicaoRepository;
    }

    public List<InstituicaoResponse> listarTodas() {
        return instituicaoRepository.findAllByDeletedAtIsNull().stream()
            .map(this::toResponse)
            .toList();
    }

    private InstituicaoResponse toResponse(Instituicao i) {
        return new InstituicaoResponse(i.getId(), i.getNome(), i.getCnpj(), i.getEndereco());
    }
}

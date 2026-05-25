package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.request.EmpresaParceiraRequest;
import com.puc.moedaestudantil.dto.request.EmpresaParceiraUpdateRequest;
import com.puc.moedaestudantil.dto.response.EmpresaParceiraResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.exception.CnpjDuplicadoException;
import com.puc.moedaestudantil.exception.EmailDuplicadoException;
import com.puc.moedaestudantil.exception.EmpresaNaoEncontradaException;
import com.puc.moedaestudantil.model.EmpresaParceira;
import com.puc.moedaestudantil.repository.EmpresaParceiraRepository;
import com.puc.moedaestudantil.repository.TransacaoRepository;
import com.puc.moedaestudantil.repository.UsuarioRepository;
import com.puc.moedaestudantil.security.PasswordEncoder;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Singleton
public class EmpresaParceiraService {

    private final EmpresaParceiraRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TransacaoRepository transacaoRepository;
    private final PasswordEncoder passwordEncoder;

    public EmpresaParceiraService(EmpresaParceiraRepository empresaRepository,
                                  UsuarioRepository usuarioRepository,
                                  TransacaoRepository transacaoRepository,
                                  PasswordEncoder passwordEncoder) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.transacaoRepository = transacaoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public EmpresaParceiraResponse cadastrar(EmpresaParceiraRequest request) {
        if (empresaRepository.existsByCnpj(request.cnpj())) {
            throw new CnpjDuplicadoException();
        }
        if (usuarioRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new EmailDuplicadoException();
        }

        EmpresaParceira empresa = new EmpresaParceira();
        empresa.setEmail(request.email());
        empresa.setSenhaHash(passwordEncoder.hash(request.senha()));
        empresa.setCnpj(request.cnpj());
        empresa.setNomeFantasia(request.nomeFantasia());
        empresa.setDescricao(request.descricao());

        return toResponse(empresaRepository.save(empresa));
    }

    public List<EmpresaParceiraResponse> listarTodas() {
        return empresaRepository.findAllByDeletedAtIsNull().stream()
            .map(this::toResponse)
            .toList();
    }

    public EmpresaParceiraResponse buscarPorId(Long id) {
        return toResponse(carregar(id));
    }

    @Transactional
    public EmpresaParceiraResponse atualizar(Long id, EmpresaParceiraUpdateRequest request) {
        EmpresaParceira empresa = carregar(id);

        if (!empresa.getCnpj().equals(request.cnpj()) && empresaRepository.existsByCnpj(request.cnpj())) {
            throw new CnpjDuplicadoException();
        }
        if (!empresa.getEmail().equals(request.email())
            && usuarioRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new EmailDuplicadoException();
        }

        empresa.setEmail(request.email());
        if (request.senha() != null && !request.senha().isBlank()) {
            empresa.setSenhaHash(passwordEncoder.hash(request.senha()));
        }
        empresa.setCnpj(request.cnpj());
        empresa.setNomeFantasia(request.nomeFantasia());
        empresa.setDescricao(request.descricao());

        return toResponse(empresaRepository.update(empresa));
    }

    @Transactional
    public void deletar(Long id) {
        EmpresaParceira empresa = carregar(id);
        empresa.setDeletedAt(LocalDateTime.now());
        empresaRepository.update(empresa);
    }

    public List<TransacaoResponse> listarTrocasPorEmpresa(Long empresaId) {
        carregar(empresaId);
        return transacaoRepository.listarPorEmpresa(empresaId).stream()
            .map(TransacaoMapper::toResponse)
            .toList();
    }

    private EmpresaParceira carregar(Long id) {
        return empresaRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new EmpresaNaoEncontradaException(id));
    }

    private EmpresaParceiraResponse toResponse(EmpresaParceira e) {
        return new EmpresaParceiraResponse(
            e.getId(),
            e.getEmail(),
            e.getCnpj(),
            e.getNomeFantasia(),
            e.getDescricao()
        );
    }
}

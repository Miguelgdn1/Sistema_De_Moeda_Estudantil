package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.EmpresaParceiraRequestDTO;
import com.puc.moedaestudantil.model.EmpresaParceira;
import com.puc.moedaestudantil.repository.EmpresaParceiraDAO;
import com.puc.moedaestudantil.security.PasswordEncoder;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Singleton
public class EmpresaParceiraService {

    @Inject
    private EmpresaParceiraDAO empresaDAO;

    @Inject
    private PasswordEncoder passwordEncoder;

    public EmpresaParceira cadastrar(EmpresaParceiraRequestDTO dto) {
        if (empresaDAO.existePorCnpj(dto.getCnpj())) {
            throw new IllegalArgumentException("CNPJ já cadastrado.");
        }

        EmpresaParceira empresa = new EmpresaParceira();
        empresa.setEmail(dto.getEmail());
        empresa.setSenhaHash(passwordEncoder.hash(dto.getSenha()));
        empresa.setCnpj(dto.getCnpj());
        empresa.setNomeFantasia(dto.getNomeFantasia());
        empresa.setDescricao(dto.getDescricao());

        return empresaDAO.salvar(empresa);
    }

    public List<EmpresaParceira> listarTodas() {
        return empresaDAO.listarTodas();
    }

    public EmpresaParceira buscarPorId(Long id) {
        return empresaDAO.buscarPorId(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada: id=" + id));
    }

    public EmpresaParceira atualizar(Long id, EmpresaParceiraRequestDTO dto) {
        EmpresaParceira empresa = buscarPorId(id);

        if (!empresa.getCnpj().equals(dto.getCnpj()) && empresaDAO.existePorCnpj(dto.getCnpj())) {
            throw new IllegalArgumentException("CNPJ já cadastrado por outra empresa.");
        }

        empresa.setEmail(dto.getEmail());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            empresa.setSenhaHash(passwordEncoder.hash(dto.getSenha()));
        }
        empresa.setCnpj(dto.getCnpj());
        empresa.setNomeFantasia(dto.getNomeFantasia());
        empresa.setDescricao(dto.getDescricao());

        return empresaDAO.atualizar(empresa);
    }

    public void deletar(Long id) {
        if (empresaDAO.buscarPorId(id).isEmpty()) {
            throw new EntityNotFoundException("Empresa não encontrada: id=" + id);
        }
        empresaDAO.deletar(id);
    }
}

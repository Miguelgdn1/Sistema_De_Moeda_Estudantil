package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.AlunoRequestDTO;
import com.puc.moedaestudantil.model.Aluno;
import com.puc.moedaestudantil.model.Instituicao;
import com.puc.moedaestudantil.repository.AlunoDAO;
import com.puc.moedaestudantil.repository.InstituicaoDAO;
import com.puc.moedaestudantil.security.PasswordEncoder;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Singleton
public class AlunoService {

    @Inject
    private AlunoDAO alunoDAO;

    @Inject
    private InstituicaoDAO instituicaoDAO;

    @Inject
    private PasswordEncoder passwordEncoder;

    public Aluno cadastrar(AlunoRequestDTO dto) {
        if (alunoDAO.existePorCpf(dto.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }
        if (alunoDAO.existePorEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado.");
        }
        Instituicao instituicao = instituicaoDAO.buscarPorId(dto.getInstituicaoId())
                .orElseThrow(() -> new IllegalArgumentException("Instituição não encontrada."));

        Aluno aluno = new Aluno();
        aluno.setEmail(dto.getEmail());
        aluno.setSenhaHash(passwordEncoder.hash(dto.getSenha()));
        aluno.setCpf(dto.getCpf());
        aluno.setRg(dto.getRg());
        aluno.setNome(dto.getNome());
        aluno.setEndereco(dto.getEndereco());
        aluno.setCurso(dto.getCurso());
        aluno.setSaldoMoedas(0);
        aluno.setInstituicao(instituicao);

        return alunoDAO.salvar(aluno);
    }

    public List<Aluno> listarTodos() {
        return alunoDAO.listarTodos();
    }

    public Aluno buscarPorId(Long id) {
        return alunoDAO.buscarPorId(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado: id=" + id));
    }

    public Aluno atualizar(Long id, AlunoRequestDTO dto) {
        Aluno aluno = buscarPorId(id);

        if (!aluno.getCpf().equals(dto.getCpf()) && alunoDAO.existePorCpf(dto.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado por outro aluno.");
        }
        if (!aluno.getEmail().equals(dto.getEmail()) && alunoDAO.existePorEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado por outro usuário.");
        }
        Instituicao instituicao = instituicaoDAO.buscarPorId(dto.getInstituicaoId())
                .orElseThrow(() -> new IllegalArgumentException("Instituição não encontrada."));

        aluno.setEmail(dto.getEmail());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            aluno.setSenhaHash(passwordEncoder.hash(dto.getSenha()));
        }
        aluno.setCpf(dto.getCpf());
        aluno.setRg(dto.getRg());
        aluno.setNome(dto.getNome());
        aluno.setEndereco(dto.getEndereco());
        aluno.setCurso(dto.getCurso());
        aluno.setInstituicao(instituicao);

        return alunoDAO.atualizar(aluno);
    }

    public void deletar(Long id) {
        if (alunoDAO.buscarPorId(id).isEmpty()) {
            throw new EntityNotFoundException("Aluno não encontrado: id=" + id);
        }
        alunoDAO.deletar(id);
    }
}

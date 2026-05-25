package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.request.AlunoRequest;
import com.puc.moedaestudantil.dto.request.AlunoUpdateRequest;
import com.puc.moedaestudantil.dto.response.AlunoResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.exception.AlunoNaoEncontradoException;
import com.puc.moedaestudantil.exception.CpfDuplicadoException;
import com.puc.moedaestudantil.exception.EmailDuplicadoException;
import com.puc.moedaestudantil.exception.InstituicaoNaoEncontradaException;
import com.puc.moedaestudantil.model.Aluno;
import com.puc.moedaestudantil.model.Instituicao;
import com.puc.moedaestudantil.repository.AlunoRepository;
import com.puc.moedaestudantil.repository.InstituicaoRepository;
import com.puc.moedaestudantil.repository.TransacaoRepository;
import com.puc.moedaestudantil.repository.UsuarioRepository;
import com.puc.moedaestudantil.security.PasswordEncoder;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Singleton
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final InstituicaoRepository instituicaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TransacaoRepository transacaoRepository;
    private final PasswordEncoder passwordEncoder;

    public AlunoService(AlunoRepository alunoRepository,
                        InstituicaoRepository instituicaoRepository,
                        UsuarioRepository usuarioRepository,
                        TransacaoRepository transacaoRepository,
                        PasswordEncoder passwordEncoder) {
        this.alunoRepository = alunoRepository;
        this.instituicaoRepository = instituicaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.transacaoRepository = transacaoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AlunoResponse cadastrar(AlunoRequest request) {
        if (alunoRepository.existsByCpf(request.cpf())) {
            throw new CpfDuplicadoException();
        }
        if (usuarioRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new EmailDuplicadoException();
        }
        Instituicao instituicao = instituicaoRepository.findByIdAndDeletedAtIsNull(request.instituicaoId())
            .orElseThrow(() -> new InstituicaoNaoEncontradaException(request.instituicaoId()));

        Aluno aluno = new Aluno();
        aluno.setEmail(request.email());
        aluno.setSenhaHash(passwordEncoder.hash(request.senha()));
        aluno.setCpf(request.cpf());
        aluno.setRg(request.rg());
        aluno.setNome(request.nome());
        aluno.setEndereco(request.endereco());
        aluno.setCurso(request.curso());
        aluno.setSaldoMoedas(0);
        aluno.setInstituicao(instituicao);

        return toResponse(alunoRepository.save(aluno));
    }

    public List<AlunoResponse> listarTodos() {
        return alunoRepository.findAllByDeletedAtIsNull().stream()
            .map(this::toResponse)
            .toList();
    }

    public AlunoResponse buscarPorId(Long id) {
        return toResponse(carregarAluno(id));
    }

    @Transactional
    public AlunoResponse atualizar(Long id, AlunoRequest request) {
        Aluno aluno = carregarAluno(id);

        if (!aluno.getCpf().equals(request.cpf()) && alunoRepository.existsByCpf(request.cpf())) {
            throw new CpfDuplicadoException();
        }
        if (!aluno.getEmail().equals(request.email())
            && usuarioRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new EmailDuplicadoException();
        }
        Instituicao instituicao = instituicaoRepository.findByIdAndDeletedAtIsNull(request.instituicaoId())
            .orElseThrow(() -> new InstituicaoNaoEncontradaException(request.instituicaoId()));

        aluno.setEmail(request.email());
        if (request.senha() != null && !request.senha().isBlank()) {
            aluno.setSenhaHash(passwordEncoder.hash(request.senha()));
        }
        aluno.setCpf(request.cpf());
        aluno.setRg(request.rg());
        aluno.setNome(request.nome());
        aluno.setEndereco(request.endereco());
        aluno.setCurso(request.curso());
        aluno.setInstituicao(instituicao);

        return toResponse(alunoRepository.update(aluno));
    }

    @Transactional
    public AlunoResponse atualizarPerfil(Long id, AlunoUpdateRequest request) {
        Aluno aluno = carregarAluno(id);

        if (!aluno.getEmail().equals(request.email())
            && usuarioRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new EmailDuplicadoException();
        }

        aluno.setNome(request.nome());
        aluno.setEmail(request.email());
        aluno.setEndereco(request.endereco() != null && !request.endereco().isBlank()
            ? request.endereco() : null);

        if (request.senha() != null && !request.senha().isBlank()) {
            aluno.setSenhaHash(passwordEncoder.hash(request.senha()));
        }

        return toResponse(alunoRepository.update(aluno));
    }

    @Transactional
    public void deletar(Long id) {
        Aluno aluno = carregarAluno(id);
        aluno.setDeletedAt(LocalDateTime.now());
        alunoRepository.update(aluno);
    }

    public List<TransacaoResponse> listarExtrato(Long alunoId) {
        carregarAluno(alunoId);
        return transacaoRepository.listarPorAluno(alunoId).stream()
            .map(TransacaoMapper::toResponse)
            .toList();
    }

    private Aluno carregarAluno(Long id) {
        return alunoRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new AlunoNaoEncontradoException(id));
    }

    private AlunoResponse toResponse(Aluno a) {
        return new AlunoResponse(
            a.getId(),
            a.getEmail(),
            a.getCpf(),
            a.getRg(),
            a.getNome(),
            a.getEndereco(),
            a.getCurso(),
            a.getSaldoMoedas(),
            a.getInstituicao() != null ? a.getInstituicao().getId() : null,
            a.getInstituicao() != null ? a.getInstituicao().getNome() : null
        );
    }
}

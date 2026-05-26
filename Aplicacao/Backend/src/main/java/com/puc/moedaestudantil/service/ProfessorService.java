package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.request.DistribuirMoedasRequest;
import com.puc.moedaestudantil.dto.request.ProfessorRequest;
import com.puc.moedaestudantil.dto.response.ExtratoResponse;
import com.puc.moedaestudantil.dto.response.ProfessorResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.exception.AlunoNaoEncontradoException;
import com.puc.moedaestudantil.exception.CpfDuplicadoException;
import com.puc.moedaestudantil.exception.EmailDuplicadoException;
import com.puc.moedaestudantil.exception.InstituicaoNaoEncontradaException;
import com.puc.moedaestudantil.exception.ProfessorNaoEncontradoException;
import com.puc.moedaestudantil.exception.SaldoInsuficienteException;
import com.puc.moedaestudantil.messaging.NotificationMessage;
import com.puc.moedaestudantil.messaging.NotificationProducer;
import com.puc.moedaestudantil.model.Aluno;
import com.puc.moedaestudantil.model.Instituicao;
import com.puc.moedaestudantil.model.Professor;
import com.puc.moedaestudantil.model.TipoTransacao;
import com.puc.moedaestudantil.model.Transacao;
import com.puc.moedaestudantil.repository.AlunoRepository;
import com.puc.moedaestudantil.repository.InstituicaoRepository;
import com.puc.moedaestudantil.repository.ProfessorRepository;
import com.puc.moedaestudantil.repository.TransacaoRepository;
import com.puc.moedaestudantil.repository.UsuarioRepository;
import com.puc.moedaestudantil.security.PasswordEncoder;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Singleton
public class ProfessorService {

    private static final Logger LOG = LoggerFactory.getLogger(ProfessorService.class);
    private static final DateTimeFormatter DATA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;
    private final TransacaoRepository transacaoRepository;
    private final InstituicaoRepository instituicaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationProducer notificationProducer;

    public ProfessorService(ProfessorRepository professorRepository,
                            AlunoRepository alunoRepository,
                            TransacaoRepository transacaoRepository,
                            InstituicaoRepository instituicaoRepository,
                            UsuarioRepository usuarioRepository,
                            PasswordEncoder passwordEncoder,
                            NotificationProducer notificationProducer) {
        this.professorRepository = professorRepository;
        this.alunoRepository = alunoRepository;
        this.transacaoRepository = transacaoRepository;
        this.instituicaoRepository = instituicaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationProducer = notificationProducer;
    }

    @Transactional
    public ProfessorResponse cadastrar(ProfessorRequest request) {
        if (professorRepository.existsByCpf(request.cpf())) {
            throw new CpfDuplicadoException();
        }
        if (usuarioRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new EmailDuplicadoException();
        }
        if (request.senha() == null || request.senha().isBlank()) {
            throw new IllegalArgumentException("Senha e obrigatoria no cadastro.");
        }
        Instituicao instituicao = instituicaoRepository.findByIdAndDeletedAtIsNull(request.instituicaoId())
            .orElseThrow(() -> new InstituicaoNaoEncontradaException(request.instituicaoId()));

        Professor professor = new Professor();
        professor.setEmail(request.email());
        professor.setSenhaHash(passwordEncoder.hash(request.senha()));
        professor.setCpf(request.cpf());
        professor.setNome(request.nome());
        professor.setDepartamento(request.departamento());
        professor.setSaldoMoedas(1000);
        professor.setInstituicao(instituicao);

        return toResponse(professorRepository.save(professor));
    }

    @Transactional
    public ProfessorResponse atualizar(Long id, ProfessorRequest request) {
        Professor professor = carregar(id);

        if (!professor.getCpf().equals(request.cpf()) && professorRepository.existsByCpf(request.cpf())) {
            throw new CpfDuplicadoException();
        }
        if (!professor.getEmail().equals(request.email())
            && usuarioRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new EmailDuplicadoException();
        }
        Instituicao instituicao = instituicaoRepository.findByIdAndDeletedAtIsNull(request.instituicaoId())
            .orElseThrow(() -> new InstituicaoNaoEncontradaException(request.instituicaoId()));

        professor.setEmail(request.email());
        if (request.senha() != null && !request.senha().isBlank()) {
            professor.setSenhaHash(passwordEncoder.hash(request.senha()));
        }
        professor.setCpf(request.cpf());
        professor.setNome(request.nome());
        professor.setDepartamento(request.departamento());
        professor.setInstituicao(instituicao);

        return toResponse(professorRepository.update(professor));
    }

    @Transactional
    public void deletar(Long id) {
        Professor professor = carregar(id);
        professor.setDeletedAt(LocalDateTime.now());
        professorRepository.update(professor);
    }

    @Transactional
    public ProfessorResponse ajustarSaldo(Long id, int quantidade) {
        Professor professor = carregar(id);
        int novoSaldo = professor.getSaldoMoedas() + quantidade;
        if (novoSaldo < 0) {
            throw new SaldoInsuficienteException(professor.getSaldoMoedas(), -quantidade);
        }
        professor.setSaldoMoedas(novoSaldo);
        return toResponse(professorRepository.update(professor));
    }

    public List<ProfessorResponse> listarTodos() {
        return professorRepository.findAllByDeletedAtIsNull().stream()
            .map(this::toResponse)
            .toList();
    }

    public ProfessorResponse buscarPorId(Long id) {
        return toResponse(carregar(id));
    }

    public ExtratoResponse obterExtrato(Long professorId) {
        Professor professor = carregar(professorId);
        List<TransacaoResponse> transacoes = transacaoRepository.listarPorProfessor(professorId).stream()
            .map(TransacaoMapper::toResponse)
            .toList();
        return new ExtratoResponse(professor.getSaldoMoedas(), transacoes);
    }

    @Transactional
    public TransacaoResponse distribuirMoedas(Long professorId, DistribuirMoedasRequest request) {
        Professor professor = carregar(professorId);
        Aluno aluno = alunoRepository.findByIdAndDeletedAtIsNull(request.alunoId())
            .orElseThrow(() -> new AlunoNaoEncontradoException(request.alunoId()));

        int quantidade = request.quantidade();
        if (professor.getSaldoMoedas() < quantidade) {
            throw new SaldoInsuficienteException(professor.getSaldoMoedas(), quantidade);
        }

        professor.setSaldoMoedas(professor.getSaldoMoedas() - quantidade);
        aluno.setSaldoMoedas(aluno.getSaldoMoedas() + quantidade);
        professorRepository.update(professor);
        alunoRepository.update(aluno);

        Transacao transacao = new Transacao();
        transacao.setTipo(TipoTransacao.ENVIO_MOEDA);
        transacao.setQuantidadeMoedas(quantidade);
        transacao.setDataHora(LocalDateTime.now());
        transacao.setMensagem(request.mensagem());
        transacao.setProfessor(professor);
        transacao.setAluno(aluno);
        Transacao salva = transacaoRepository.save(transacao);

        publicarNotificacoes(professor, aluno, quantidade, request.mensagem(), salva.getDataHora());

        return TransacaoMapper.toResponse(salva);
    }

    private void publicarNotificacoes(Professor professor, Aluno aluno, int quantidade,
                                      String mensagem, LocalDateTime dataHora) {
        Map<String, String> vars = new HashMap<>();
        vars.put("nomeAluno", aluno.getNome());
        vars.put("nomeProfessor", professor.getNome());
        vars.put("quantidade", String.valueOf(quantidade));
        vars.put("mensagem", mensagem == null ? "" : mensagem);
        vars.put("saldoAtual", String.valueOf(aluno.getSaldoMoedas()));
        vars.put("dataHora", dataHora.format(DATA_FMT));

        publicarSeguro("aluno-moeda", aluno.getId(), aluno.getEmail(), () ->
            notificationProducer.enviarEmailMoedaAluno(NotificationMessage.email(
                "moeda-recebida-aluno",
                aluno.getEmail(),
                "Voce recebeu " + quantidade + " moedas!",
                "moeda-recebida-aluno",
                vars
            ))
        );

        publicarSeguro("professor-moeda", professor.getId(), professor.getEmail(), () ->
            notificationProducer.enviarEmailMoedaProfessor(NotificationMessage.email(
                "moeda-enviada-professor",
                professor.getEmail(),
                "Confirmacao: " + quantidade + " moedas enviadas",
                "moeda-enviada-professor",
                new HashMap<>(vars)
            ))
        );
    }

    // Cada publicacao tem seu try/catch — uma falha (ou falso positivo do broker em
    // confirmacoes assincronas) nao deve impedir o envio dos outros destinatarios.
    private void publicarSeguro(String rotulo, Long id, String email, Runnable publish) {
        if (email == null || email.isBlank()) {
            LOG.warn("Destinatario {} (id={}) sem email cadastrado; pulando notificacao.", rotulo, id);
            return;
        }
        try {
            publish.run();
        } catch (Exception e) {
            LOG.warn("Falha ao publicar notificacao '{}' (id={}, email={}): {}", rotulo, id, email, e.getMessage(), e);
        }
    }

    private Professor carregar(Long id) {
        return professorRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ProfessorNaoEncontradoException(id));
    }

    private ProfessorResponse toResponse(Professor p) {
        return new ProfessorResponse(
            p.getId(),
            p.getNome(),
            p.getEmail(),
            p.getCpf(),
            p.getDepartamento(),
            p.getInstituicao() != null ? p.getInstituicao().getId() : null,
            p.getInstituicao() != null ? p.getInstituicao().getNome() : null,
            p.getSaldoMoedas()
        );
    }
}

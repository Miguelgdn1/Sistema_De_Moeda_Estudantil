package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.response.CupomValidacaoResponse;
import com.puc.moedaestudantil.dto.response.ResgateResponse;
import com.puc.moedaestudantil.dto.response.TransacaoResponse;
import com.puc.moedaestudantil.exception.AlunoNaoEncontradoException;
import com.puc.moedaestudantil.exception.CupomNaoEncontradoException;
import com.puc.moedaestudantil.exception.SaldoInsuficienteException;
import com.puc.moedaestudantil.exception.VantagemNaoEncontradaException;
import com.puc.moedaestudantil.messaging.NotificationMessage;
import com.puc.moedaestudantil.messaging.NotificationProducer;
import com.puc.moedaestudantil.model.Aluno;
import com.puc.moedaestudantil.model.EmpresaParceira;
import com.puc.moedaestudantil.model.TipoTransacao;
import com.puc.moedaestudantil.model.Transacao;
import com.puc.moedaestudantil.model.Vantagem;
import com.puc.moedaestudantil.repository.AlunoRepository;
import com.puc.moedaestudantil.repository.TransacaoRepository;
import com.puc.moedaestudantil.repository.VantagemRepository;
import com.puc.moedaestudantil.util.CodigoCupomGenerator;
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
public class ResgateService {

    private static final Logger LOG = LoggerFactory.getLogger(ResgateService.class);
    private static final int VALIDADE_DIAS = 30;
    private static final DateTimeFormatter DATA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final AlunoRepository alunoRepository;
    private final VantagemRepository vantagemRepository;
    private final TransacaoRepository transacaoRepository;
    private final QrCodeService qrCodeService;
    private final NotificationProducer notificationProducer;

    public ResgateService(AlunoRepository alunoRepository,
                          VantagemRepository vantagemRepository,
                          TransacaoRepository transacaoRepository,
                          QrCodeService qrCodeService,
                          NotificationProducer notificationProducer) {
        this.alunoRepository = alunoRepository;
        this.vantagemRepository = vantagemRepository;
        this.transacaoRepository = transacaoRepository;
        this.qrCodeService = qrCodeService;
        this.notificationProducer = notificationProducer;
    }

    @Transactional
    public ResgateResponse resgatar(Long alunoId, Long vantagemId) {
        Aluno aluno = alunoRepository.findByIdAndDeletedAtIsNull(alunoId)
            .orElseThrow(() -> new AlunoNaoEncontradoException(alunoId));
        Vantagem vantagem = vantagemRepository.findByIdAndDeletedAtIsNull(vantagemId)
            .orElseThrow(() -> new VantagemNaoEncontradaException(vantagemId));

        int custo = vantagem.getCustoMoedas();
        if (aluno.getSaldoMoedas() < custo) {
            throw new SaldoInsuficienteException(aluno.getSaldoMoedas(), custo);
        }

        aluno.setSaldoMoedas(aluno.getSaldoMoedas() - custo);
        alunoRepository.update(aluno);

        String codigo = gerarCodigoUnico();
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime expiracao = agora.plusDays(VALIDADE_DIAS);

        Transacao transacao = new Transacao();
        transacao.setTipo(TipoTransacao.RESGATE_VANTAGEM);
        transacao.setQuantidadeMoedas(custo);
        transacao.setDataHora(agora);
        transacao.setMensagem("Resgate da vantagem: " + vantagem.getNome());
        transacao.setCodigoCupom(codigo);
        transacao.setDataExpiracao(expiracao);
        transacao.setAluno(aluno);
        transacao.setVantagem(vantagem);
        Transacao salva = transacaoRepository.save(transacao);

        String qrBase64 = qrCodeService.gerarBase64(codigo);

        publicarNotificacoes(aluno, vantagem, codigo, qrBase64, agora, expiracao);

        EmpresaParceira empresa = vantagem.getEmpresa();
        return new ResgateResponse(
            salva.getId(),
            codigo,
            qrBase64,
            agora,
            expiracao,
            aluno.getSaldoMoedas(),
            vantagem.getId(),
            vantagem.getNome(),
            custo,
            empresa != null ? empresa.getNomeFantasia() : null
        );
    }

    public List<TransacaoResponse> listarCuponsDoAluno(Long alunoId) {
        alunoRepository.findByIdAndDeletedAtIsNull(alunoId)
            .orElseThrow(() -> new AlunoNaoEncontradoException(alunoId));
        return transacaoRepository.listarCuponsDoAluno(alunoId).stream()
            .map(TransacaoMapper::toResponse)
            .toList();
    }

    public CupomValidacaoResponse validar(String codigo) {
        Transacao t = transacaoRepository.findByCodigoCupom(codigo)
            .orElseThrow(() -> new CupomNaoEncontradoException(codigo));

        String status;
        if (t.getCupomUsadoEm() != null) {
            status = "UTILIZADO";
        } else if (t.getDataExpiracao() != null && t.getDataExpiracao().isBefore(LocalDateTime.now())) {
            status = "EXPIRADO";
        } else {
            status = "VALIDO";
        }

        Vantagem vantagem = t.getVantagem();
        EmpresaParceira empresa = vantagem != null ? vantagem.getEmpresa() : null;

        return new CupomValidacaoResponse(
            t.getCodigoCupom(),
            status,
            t.getAluno() != null ? t.getAluno().getNome() : null,
            vantagem != null ? vantagem.getNome() : null,
            empresa != null ? empresa.getNomeFantasia() : null,
            t.getDataHora(),
            t.getDataExpiracao(),
            t.getCupomUsadoEm()
        );
    }

    @Transactional
    public CupomValidacaoResponse marcarComoUsado(String codigo, Long empresaSolicitanteId, boolean isAdmin) {
        Transacao t = transacaoRepository.findByCodigoCupom(codigo)
            .orElseThrow(() -> new CupomNaoEncontradoException(codigo));

        Vantagem vantagem = t.getVantagem();
        if (!isAdmin && vantagem != null && vantagem.getEmpresa() != null
            && !vantagem.getEmpresa().getId().equals(empresaSolicitanteId)) {
            throw new com.puc.moedaestudantil.exception.AcessoNegadoException(
                "Empresa nao pode validar cupom de outra empresa.");
        }

        if (t.getCupomUsadoEm() == null) {
            t.setCupomUsadoEm(LocalDateTime.now());
            transacaoRepository.update(t);
        }
        return validar(codigo);
    }

    private String gerarCodigoUnico() {
        for (int i = 0; i < 5; i++) {
            String candidato = CodigoCupomGenerator.gerar();
            if (transacaoRepository.findByCodigoCupom(candidato).isEmpty()) {
                return candidato;
            }
        }
        throw new RuntimeException("Nao foi possivel gerar codigo de cupom unico apos 5 tentativas.");
    }

    private void publicarNotificacoes(Aluno aluno, Vantagem vantagem, String codigo, String qrBase64,
                                      LocalDateTime dataResgate, LocalDateTime expiracao) {
        EmpresaParceira empresa = vantagem.getEmpresa();
        String nomeEmpresa = empresa != null ? empresa.getNomeFantasia() : "";

        Map<String, String> varAluno = new HashMap<>();
        varAluno.put("nomeAluno", aluno.getNome());
        varAluno.put("nomeVantagem", vantagem.getNome());
        varAluno.put("nomeEmpresa", nomeEmpresa);
        varAluno.put("codigoCupom", codigo);
        varAluno.put("dataExpiracao", expiracao.format(DATA_FMT));

        publicarSeguro("cupom-aluno", codigo, () ->
            notificationProducer.enviarEmailCupomAluno(NotificationMessage.emailComCupom(
                "cupom-aluno",
                aluno.getEmail(),
                "Seu cupom de resgate: " + codigo,
                "cupom-aluno",
                varAluno,
                qrBase64,
                codigo
            ))
        );

        if (empresa != null && empresa.getEmail() != null) {
            Map<String, String> varEmp = new HashMap<>(varAluno);
            varEmp.put("dataResgate", dataResgate.format(DATA_FMT));
            publicarSeguro("cupom-empresa", codigo, () ->
                notificationProducer.enviarEmailCupomEmpresa(NotificationMessage.email(
                    "cupom-empresa",
                    empresa.getEmail(),
                    "Cupom resgatado: " + vantagem.getNome(),
                    "cupom-empresa",
                    varEmp
                ))
            );
        }

        if (aluno.getTelefone() != null && !aluno.getTelefone().isBlank()) {
            publicarSeguro("cupom-aluno-wa", codigo, () ->
                notificationProducer.enviarWhatsAppCupomAluno(NotificationMessage.whatsapp(
                    "cupom-aluno-wa",
                    aluno.getTelefone(),
                    varAluno,
                    qrBase64,
                    codigo
                ))
            );
        }
    }

    // Cada publicacao em try/catch separado — uma falha (ou falso positivo do broker em
    // confirmacoes assincronas) nao deve impedir o envio aos outros destinatarios.
    private void publicarSeguro(String rotulo, String codigo, Runnable publish) {
        try {
            publish.run();
        } catch (Exception e) {
            LOG.warn("Falha ao publicar notificacao '{}' (cupom={}): {}", rotulo, codigo, e.getMessage(), e);
        }
    }
}

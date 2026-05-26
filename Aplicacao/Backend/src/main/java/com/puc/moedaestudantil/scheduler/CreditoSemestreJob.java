package com.puc.moedaestudantil.scheduler;

import com.puc.moedaestudantil.model.Professor;
import com.puc.moedaestudantil.repository.ProfessorRepository;
import io.micronaut.scheduling.annotation.Scheduled;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Singleton
public class CreditoSemestreJob {

    private static final Logger LOG = LoggerFactory.getLogger(CreditoSemestreJob.class);

    private static final int MOEDAS_POR_SEMESTRE = 1000;

    private final ProfessorRepository professorRepository;

    public CreditoSemestreJob(ProfessorRepository professorRepository) {
        this.professorRepository = professorRepository;
    }

    // 1 de fevereiro e 1 de agosto a meia-noite — inicio dos semestres letivos.
    @Scheduled(cron = "0 0 0 1 2,8 *")
    @Transactional
    public void creditarSemestre() {
        List<Professor> professores = professorRepository.findAllByDeletedAtIsNull();
        int creditados = 0;
        for (Professor p : professores) {
            int saldoAtual = p.getSaldoMoedas() != null ? p.getSaldoMoedas() : 0;
            p.setSaldoMoedas(saldoAtual + MOEDAS_POR_SEMESTRE);
            professorRepository.update(p);
            creditados++;
        }
        LOG.info("Credito semestral aplicado: +{} moedas para {} professores.",
            MOEDAS_POR_SEMESTRE, creditados);
    }
}

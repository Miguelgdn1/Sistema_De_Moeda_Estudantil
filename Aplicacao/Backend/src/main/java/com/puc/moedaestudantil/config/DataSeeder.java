package com.puc.moedaestudantil.config;

import com.puc.moedaestudantil.model.Instituicao;
import com.puc.moedaestudantil.model.Professor;
import com.puc.moedaestudantil.repository.InstituicaoDAO;
import com.puc.moedaestudantil.repository.ProfessorDAO;
import com.puc.moedaestudantil.security.PasswordEncoder;
import io.micronaut.context.event.StartupEvent;
import io.micronaut.runtime.event.annotation.EventListener;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class DataSeeder {

    private static final Logger LOG = LoggerFactory.getLogger(DataSeeder.class);

    private final InstituicaoDAO instituicaoDAO;
    private final ProfessorDAO professorDAO;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(InstituicaoDAO instituicaoDAO, ProfessorDAO professorDAO, PasswordEncoder passwordEncoder) {
        this.instituicaoDAO = instituicaoDAO;
        this.professorDAO = professorDAO;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener
    public void onStartup(StartupEvent event) {
        if (!instituicaoDAO.listarTodas().isEmpty()) {
            LOG.info("Seed: instituições já existem, pulando.");
            return;
        }

        Instituicao puc = novaInstituicao("PUC Minas", "12345678000100", "Av. Dom José Gaspar, 500 - Belo Horizonte/MG");
        Instituicao ufmg = novaInstituicao("UFMG", "12345678000201", "Av. Antônio Carlos, 6627 - Belo Horizonte/MG");
        Instituicao cefet = novaInstituicao("CEFET-MG", "12345678000302", "Av. Amazonas, 7675 - Belo Horizonte/MG");
        instituicaoDAO.salvar(puc);
        instituicaoDAO.salvar(ufmg);
        instituicaoDAO.salvar(cefet);
        LOG.info("Seed: 3 instituições inseridas.");

        if (professorDAO.listarTodos().isEmpty()) {
            Professor prof = new Professor();
            prof.setEmail("joao.aramuni@puc.br");
            prof.setSenhaHash(passwordEncoder.hash("senha123"));
            prof.setCpf("11122233344");
            prof.setNome("João Paulo Aramuni");
            prof.setDepartamento("Engenharia de Software");
            prof.setSaldoMoedas(1000);
            prof.setInstituicao(puc);
            professorDAO.salvar(prof);
            LOG.info("Seed: professor exemplo inserido.");
        }
    }

    private Instituicao novaInstituicao(String nome, String cnpj, String endereco) {
        Instituicao i = new Instituicao();
        i.setNome(nome);
        i.setCnpj(cnpj);
        i.setEndereco(endereco);
        return i;
    }
}

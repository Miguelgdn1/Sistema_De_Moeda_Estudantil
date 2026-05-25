package com.puc.moedaestudantil.config;

import com.puc.moedaestudantil.model.Administrador;
import com.puc.moedaestudantil.model.Instituicao;
import com.puc.moedaestudantil.model.Professor;
import com.puc.moedaestudantil.repository.InstituicaoRepository;
import com.puc.moedaestudantil.repository.ProfessorRepository;
import com.puc.moedaestudantil.repository.UsuarioRepository;
import com.puc.moedaestudantil.security.PasswordEncoder;
import io.micronaut.context.event.StartupEvent;
import io.micronaut.runtime.event.annotation.EventListener;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Singleton
public class DataSeeder {

    private static final Logger LOG = LoggerFactory.getLogger(DataSeeder.class);

    private final InstituicaoRepository instituicaoRepository;
    private final ProfessorRepository professorRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(InstituicaoRepository instituicaoRepository,
                      ProfessorRepository professorRepository,
                      UsuarioRepository usuarioRepository,
                      PasswordEncoder passwordEncoder) {
        this.instituicaoRepository = instituicaoRepository;
        this.professorRepository = professorRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener
    @Transactional
    public void onStartup(StartupEvent event) {
        seedInstituicoes();
        seedProfessor();
        seedAdmin();
    }

    private void seedInstituicoes() {
        if (instituicaoRepository.findAllByDeletedAtIsNull().isEmpty()) {
            instituicaoRepository.saveAll(List.of(
                novaInstituicao("PUC Minas", "12345678000100", "Av. Dom Jose Gaspar, 500 - Belo Horizonte/MG"),
                novaInstituicao("UFMG", "12345678000201", "Av. Antonio Carlos, 6627 - Belo Horizonte/MG"),
                novaInstituicao("CEFET-MG", "12345678000302", "Av. Amazonas, 7675 - Belo Horizonte/MG")
            ));
            LOG.info("Seed: 3 instituicoes inseridas.");
        } else {
            LOG.info("Seed: instituicoes ja existem, pulando.");
        }
    }

    private void seedProfessor() {
        if (professorRepository.findByCpf("11122233344").isPresent()) {
            return;
        }
        Instituicao puc = instituicaoRepository.findAllByDeletedAtIsNull().get(0);
        Professor prof = new Professor();
        prof.setEmail("joao.aramuni@puc.br");
        prof.setSenhaHash(passwordEncoder.hash("senha123"));
        prof.setCpf("11122233344");
        prof.setNome("Joao Paulo Aramuni");
        prof.setDepartamento("Engenharia de Software");
        prof.setSaldoMoedas(1000);
        prof.setInstituicao(puc);
        professorRepository.save(prof);
        LOG.info("Seed: professor exemplo inserido.");
    }

    private void seedAdmin() {
        if (usuarioRepository.findByEmailAndDeletedAtIsNull("admin@studentcoins.com").isPresent()) {
            return;
        }
        Administrador admin = new Administrador();
        admin.setNome("Administrador do Sistema");
        admin.setEmail("admin@studentcoins.com");
        admin.setSenhaHash(passwordEncoder.hash("admin123"));
        usuarioRepository.save(admin);
        LOG.info("Seed: usuario ADMIN inserido.");
    }

    private Instituicao novaInstituicao(String nome, String cnpj, String endereco) {
        Instituicao i = new Instituicao();
        i.setNome(nome);
        i.setCnpj(cnpj);
        i.setEndereco(endereco);
        return i;
    }
}

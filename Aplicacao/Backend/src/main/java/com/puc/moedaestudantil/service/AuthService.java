package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.request.LoginProfessorRequest;
import com.puc.moedaestudantil.dto.request.LoginRequest;
import com.puc.moedaestudantil.dto.response.LoginResponse;
import com.puc.moedaestudantil.dto.response.ProfessorPublicoResponse;
import com.puc.moedaestudantil.exception.CredenciaisInvalidasException;
import com.puc.moedaestudantil.model.Administrador;
import com.puc.moedaestudantil.model.Aluno;
import com.puc.moedaestudantil.model.EmpresaParceira;
import com.puc.moedaestudantil.model.Professor;
import com.puc.moedaestudantil.model.Usuario;
import com.puc.moedaestudantil.repository.ProfessorRepository;
import com.puc.moedaestudantil.repository.UsuarioRepository;
import com.puc.moedaestudantil.security.JwtService;
import com.puc.moedaestudantil.security.PasswordEncoder;
import jakarta.inject.Singleton;

import java.util.Comparator;
import java.util.List;

@Singleton
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ProfessorRepository professorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository,
                       ProfessorRepository professorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.professorRepository = professorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailAndDeletedAtIsNull(request.email())
            .orElseThrow(CredenciaisInvalidasException::new);

        return autenticar(usuario, request.senha());
    }

    public LoginResponse loginProfessor(LoginProfessorRequest request) {
        Professor professor = professorRepository.findByIdAndDeletedAtIsNull(request.professorId())
            .orElseThrow(CredenciaisInvalidasException::new);
        return autenticar(professor, request.senha());
    }

    public List<ProfessorPublicoResponse> listarProfessoresParaLogin() {
        return professorRepository.findAllByDeletedAtIsNull().stream()
            .sorted(Comparator.comparing(Professor::getNome, String.CASE_INSENSITIVE_ORDER))
            .map(p -> new ProfessorPublicoResponse(p.getId(), p.getNome()))
            .toList();
    }

    private LoginResponse autenticar(Usuario usuario, String senha) {
        if (!passwordEncoder.matches(senha, usuario.getSenhaHash())) {
            throw new CredenciaisInvalidasException();
        }

        String tipoUsuario;
        String nome;
        if (usuario instanceof Aluno a) {
            tipoUsuario = "ALUNO";
            nome = a.getNome();
        } else if (usuario instanceof Professor p) {
            tipoUsuario = "PROFESSOR";
            nome = p.getNome();
        } else if (usuario instanceof EmpresaParceira e) {
            tipoUsuario = "EMPRESA";
            nome = e.getNomeFantasia();
        } else if (usuario instanceof Administrador admin) {
            tipoUsuario = "ADMIN";
            nome = admin.getNome();
        } else {
            tipoUsuario = "DESCONHECIDO";
            nome = usuario.getEmail();
        }

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), tipoUsuario);
        return new LoginResponse(token, tipoUsuario, usuario.getId(), nome);
    }
}

package com.puc.moedaestudantil.service;

import com.puc.moedaestudantil.dto.LoginRequestDTO;
import com.puc.moedaestudantil.dto.LoginResponseDTO;
import com.puc.moedaestudantil.model.Aluno;
import com.puc.moedaestudantil.model.EmpresaParceira;
import com.puc.moedaestudantil.model.Professor;
import com.puc.moedaestudantil.model.Usuario;
import com.puc.moedaestudantil.repository.UsuarioDAO;
import com.puc.moedaestudantil.security.JwtService;
import com.puc.moedaestudantil.security.PasswordEncoder;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class AuthService {

    @Inject
    private UsuarioDAO usuarioDAO;

    @Inject
    private PasswordEncoder passwordEncoder;

    @Inject
    private JwtService jwtService;

    public LoginResponseDTO login(LoginRequestDTO dto) {
        Usuario usuario = usuarioDAO.buscarPorEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenhaHash())) {
            throw new IllegalArgumentException("Credenciais inválidas.");
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
        } else {
            tipoUsuario = "DESCONHECIDO";
            nome = usuario.getEmail();
        }

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), tipoUsuario);
        return new LoginResponseDTO(token, tipoUsuario, usuario.getId(), nome);
    }
}

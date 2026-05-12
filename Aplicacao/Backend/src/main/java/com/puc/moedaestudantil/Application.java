package com.puc.moedaestudantil;

import io.micronaut.runtime.Micronaut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.regex.Pattern;

public class Application {

    private static final Logger LOG = LoggerFactory.getLogger(Application.class);

    // Identificador de banco seguro (sem chance de SQL injection)
    private static final Pattern DB_NAME_SAFE = Pattern.compile("^[a-zA-Z0-9_]+$");

    public static void main(String[] args) {
        bootstrapDatabase(
                System.getenv().getOrDefault("DB_NAME", "moedaestudantil"),
                System.getenv().getOrDefault("DB_HOST", "localhost"),
                System.getenv().getOrDefault("DB_PORT", "5432"),
                System.getenv().getOrDefault("DB_USER", "postgres"),
                System.getenv().getOrDefault("DB_PASSWORD", "postgres")
        );
        Micronaut.run(Application.class, args);
    }

    private static void bootstrapDatabase(String dbName, String host, String port, String user, String password) {
        if (!DB_NAME_SAFE.matcher(dbName).matches()) {
            LOG.error("Nome de banco inválido: {}. Abortando criação automática.", dbName);
            return;
        }
        String adminUrl = "jdbc:postgresql://" + host + ":" + port + "/postgres";

        try (Connection connection = DriverManager.getConnection(adminUrl, user, password);
             Statement statement = connection.createStatement()) {

            ResultSet rs = statement.executeQuery("SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'");
            if (!rs.next()) {
                LOG.info("Banco '{}' não encontrado. Criando...", dbName);
                statement.executeUpdate("CREATE DATABASE " + dbName);
                LOG.info("Banco '{}' criado com sucesso.", dbName);
            } else {
                LOG.info("Banco '{}' já existe.", dbName);
            }
        } catch (Exception e) {
            LOG.error("Erro ao verificar/criar o banco '{}': {}", dbName, e.getMessage());
        }
    }
}

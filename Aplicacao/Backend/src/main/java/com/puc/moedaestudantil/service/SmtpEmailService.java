package com.puc.moedaestudantil.service;

import io.micronaut.context.annotation.Value;
import jakarta.activation.DataHandler;
import jakarta.inject.Singleton;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Properties;

@Singleton
public class SmtpEmailService implements EmailService {

    private static final Logger LOG = LoggerFactory.getLogger(SmtpEmailService.class);

    private final boolean enabled;
    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String from;
    private final String fromName;
    private final boolean startTls;
    private final EmailTemplateRenderer renderer;

    public SmtpEmailService(@Value("${mail.enabled:false}") boolean enabled,
                            @Value("${mail.host:localhost}") String host,
                            @Value("${mail.port:587}") int port,
                            @Value("${mail.username:}") String username,
                            @Value("${mail.password:}") String password,
                            @Value("${mail.from:no-reply@moedaestudantil.local}") String from,
                            @Value("${mail.from-name:Sistema de Moeda Estudantil}") String fromName,
                            @Value("${mail.starttls:true}") boolean startTls,
                            EmailTemplateRenderer renderer) {
        this.enabled = enabled;
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.from = from;
        this.fromName = fromName;
        this.startTls = startTls;
        this.renderer = renderer;
    }

    @Override
    public void enviar(String para, String assunto, String corpoHtml) {
        if (!enabled) {
            LOG.info("[mail.enabled=false] simulando envio para {} assunto='{}'", para, assunto);
            return;
        }
        try {
            Session session = buildSession();
            MimeMessage msg = baseMessage(session, para, assunto);
            msg.setContent(corpoHtml, "text/html; charset=UTF-8");
            Transport.send(msg);
            LOG.info("E-mail enviado para {} (assunto='{}').", para, assunto);
        } catch (Exception e) {
            LOG.error("Falha ao enviar e-mail para {}: {}", para, e.getMessage());
            throw new RuntimeException("Falha no envio de e-mail", e);
        }
    }

    @Override
    public void enviarTemplate(String para, String assunto, String template, Map<String, String> variaveis) {
        String corpo = renderer.render(template, variaveis);
        if (corpo == null) {
            LOG.warn("Template '{}' indisponivel. Pulando envio para {}.", template, para);
            return;
        }
        enviar(para, assunto, corpo);
    }

    @Override
    public void enviarComAnexo(String para, String assunto, String corpoHtml,
                               byte[] anexo, String nomeAnexo, String contentId) {
        if (!enabled) {
            LOG.info("[mail.enabled=false] simulando envio com anexo para {} (anexo={}, {} bytes)",
                para, nomeAnexo, anexo != null ? anexo.length : 0);
            return;
        }
        try {
            Session session = buildSession();
            MimeMessage msg = baseMessage(session, para, assunto);

            MimeBodyPart corpoPart = new MimeBodyPart();
            corpoPart.setContent(corpoHtml, "text/html; charset=UTF-8");

            MimeBodyPart anexoPart = new MimeBodyPart();
            ByteArrayDataSource ds = new ByteArrayDataSource(anexo, "image/png");
            anexoPart.setDataHandler(new DataHandler(ds));
            anexoPart.setFileName(nomeAnexo);
            if (contentId != null) {
                anexoPart.setContentID("<" + contentId + ">");
                anexoPart.setDisposition(MimeBodyPart.INLINE);
            }

            Multipart multipart = new MimeMultipart("related");
            multipart.addBodyPart(corpoPart);
            multipart.addBodyPart(anexoPart);
            msg.setContent(multipart);

            Transport.send(msg);
            LOG.info("E-mail com anexo enviado para {} (assunto='{}').", para, assunto);
        } catch (Exception e) {
            LOG.error("Falha ao enviar e-mail com anexo para {}: {}", para, e.getMessage());
            throw new RuntimeException("Falha no envio de e-mail com anexo", e);
        }
    }

    private Session buildSession() {
        Properties props = new Properties();
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", String.valueOf(port));
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", String.valueOf(startTls));
        return Session.getInstance(props, new jakarta.mail.Authenticator() {
            @Override
            protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                return new jakarta.mail.PasswordAuthentication(username, password);
            }
        });
    }

    private MimeMessage baseMessage(Session session, String para, String assunto) throws MessagingException {
        MimeMessage msg = new MimeMessage(session);
        try {
            msg.setFrom(new InternetAddress(from, fromName, "UTF-8"));
        } catch (java.io.UnsupportedEncodingException e) {
            msg.setFrom(new InternetAddress(from));
        }
        msg.addRecipient(Message.RecipientType.TO, new InternetAddress(para));
        msg.setSubject(assunto, "UTF-8");
        return msg;
    }
}

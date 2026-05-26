package com.puc.moedaestudantil.messaging;

import com.puc.moedaestudantil.service.EmailService;
import com.puc.moedaestudantil.service.EmailTemplateRenderer;
import io.micronaut.rabbitmq.annotation.Queue;
import io.micronaut.rabbitmq.annotation.RabbitListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Base64;

@RabbitListener
public class EmailNotificationConsumer {

    private static final Logger LOG = LoggerFactory.getLogger(EmailNotificationConsumer.class);

    private final EmailService emailService;
    private final EmailTemplateRenderer renderer;

    public EmailNotificationConsumer(EmailService emailService, EmailTemplateRenderer renderer) {
        this.emailService = emailService;
        this.renderer = renderer;
    }

    @Queue("email.queue")
    public void receber(NotificationMessage msg) {
        try {
            LOG.info("Consumindo mensagem de e-mail: tipo={} para={} template={}",
                msg.tipo(), msg.para(), msg.template());

            if (msg.qrCodeBase64() != null && !msg.qrCodeBase64().isBlank()) {
                String corpo = renderer.render(msg.template(), msg.variaveis());
                if (corpo == null) {
                    LOG.warn("Template '{}' nao encontrado; pulando.", msg.template());
                    return;
                }
                byte[] anexo = Base64.getDecoder().decode(msg.qrCodeBase64());
                emailService.enviarComAnexo(msg.para(), msg.assunto(), corpo, anexo, "cupom-qr.png", "cupom-qr");
            } else {
                emailService.enviarTemplate(msg.para(), msg.assunto(), msg.template(), msg.variaveis());
            }
        } catch (Exception e) {
            LOG.error("Falha ao processar mensagem de e-mail (tipo={}, para={}): {}",
                msg.tipo(), msg.para(), e.getMessage());
            // Re-lanca para o broker rejeitar e a mensagem cair na DLQ.
            throw new RuntimeException(e);
        }
    }
}

package com.puc.moedaestudantil.messaging;

import com.puc.moedaestudantil.service.WhatsAppService;
import io.micronaut.rabbitmq.annotation.Queue;
import io.micronaut.rabbitmq.annotation.RabbitListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RabbitListener
public class WhatsAppNotificationConsumer {

    private static final Logger LOG = LoggerFactory.getLogger(WhatsAppNotificationConsumer.class);

    private final WhatsAppService whatsAppService;

    public WhatsAppNotificationConsumer(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }

    @Queue("whatsapp.queue")
    public void receber(NotificationMessage msg) {
        try {
            LOG.info("Consumindo mensagem WhatsApp: tipo={} para={}", msg.tipo(), msg.para());
            whatsAppService.enviarCupom(msg.para(), msg.variaveis(), msg.qrCodeBase64());
        } catch (Exception e) {
            LOG.error("Falha ao processar WhatsApp (tipo={}, para={}): {}",
                msg.tipo(), msg.para(), e.getMessage());
            throw new RuntimeException(e);
        }
    }
}

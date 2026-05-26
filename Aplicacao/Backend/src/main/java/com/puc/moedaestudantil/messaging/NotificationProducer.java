package com.puc.moedaestudantil.messaging;

import io.micronaut.rabbitmq.annotation.Binding;
import io.micronaut.rabbitmq.annotation.RabbitClient;

@RabbitClient("notifications.exchange")
public interface NotificationProducer {

    @Binding("notification.email.aluno-moeda")
    void enviarEmailMoedaAluno(NotificationMessage message);

    @Binding("notification.email.professor-moeda")
    void enviarEmailMoedaProfessor(NotificationMessage message);

    @Binding("notification.email.aluno-cupom")
    void enviarEmailCupomAluno(NotificationMessage message);

    @Binding("notification.email.empresa-cupom")
    void enviarEmailCupomEmpresa(NotificationMessage message);

    @Binding("notification.whatsapp.aluno-cupom")
    void enviarWhatsAppCupomAluno(NotificationMessage message);
}

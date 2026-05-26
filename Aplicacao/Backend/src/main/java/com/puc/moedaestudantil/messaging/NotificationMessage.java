package com.puc.moedaestudantil.messaging;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;

import java.util.Map;

@Serdeable
public record NotificationMessage(
    String tipo,
    String para,
    String assunto,
    String template,
    Map<String, String> variaveis,
    @Nullable String qrCodeBase64,
    @Nullable String codigoCupom
) {
    public static NotificationMessage email(String tipo, String para, String assunto,
                                            String template, Map<String, String> variaveis) {
        return new NotificationMessage(tipo, para, assunto, template, variaveis, null, null);
    }

    public static NotificationMessage emailComCupom(String tipo, String para, String assunto,
                                                    String template, Map<String, String> variaveis,
                                                    String qrCodeBase64, String codigoCupom) {
        return new NotificationMessage(tipo, para, assunto, template, variaveis, qrCodeBase64, codigoCupom);
    }

    public static NotificationMessage whatsapp(String tipo, String paraTelefone,
                                               Map<String, String> variaveis, String qrCodeBase64,
                                               String codigoCupom) {
        return new NotificationMessage(tipo, paraTelefone, null, null, variaveis, qrCodeBase64, codigoCupom);
    }
}

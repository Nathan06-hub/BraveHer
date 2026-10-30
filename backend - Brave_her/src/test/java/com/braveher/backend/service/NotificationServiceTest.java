package com.braveher.backend.service;

import com.braveher.backend.integration.orange.OrangeSmsGateway;
import com.braveher.backend.integration.whatsapp.WhatsAppGateway;
import com.braveher.backend.model.entity.Patiente;
import com.braveher.backend.model.entity.SmsLog;
import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.model.enums.Langue;
import com.braveher.backend.model.enums.StatutSms;
import com.braveher.backend.repository.SmsLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private OrangeSmsGateway orangeSmsGateway;

    @Mock
    private WhatsAppGateway whatsAppGateway;

    @Mock
    private SmsLogRepository smsLogRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("utiliseWhatsApp = false -> routage automatique vers OrangeSmsGateway")
    void routeToOrangeSmsWhenNoWhatsApp() {
        Patiente p = new Patiente();
        p.setTelephone("+22676000001");
        p.setUtiliseWhatsApp(false);
        p.setLangue(Langue.MOORE);

        when(orangeSmsGateway.envoyerSms(eq("+22676000001"), anyString(), eq(Langue.MOORE)))
                .thenReturn("ORA-SMS-12345");
        when(smsLogRepository.save(any(SmsLog.class))).thenAnswer(inv -> inv.getArgument(0));

        SmsLog log = notificationService.notifierPatiente(p, "Campagne test", null, null);

        assertThat(log).isNotNull();
        assertThat(log.getCanal()).isEqualTo(CanalNotification.SMS);
        assertThat(log.getStatut()).isEqualTo(StatutSms.SIMULE);
        assertThat(log.getMessageIdExterne()).isEqualTo("ORA-SMS-12345");

        verify(orangeSmsGateway, times(1)).envoyerSms(anyString(), anyString(), any());
        verify(whatsAppGateway, never()).envoyerMessage(anyString(), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("utiliseWhatsApp = true -> routage vers WhatsApp sans média non configuré")
    void routeToWhatsAppWhenSmartphone() {
        Patiente p = new Patiente();
        p.setTelephone("+22676000002");
        p.setUtiliseWhatsApp(true);
        p.setLangue(Langue.FRANCAIS);

        when(whatsAppGateway.envoyerMessage(eq("+22676000002"), anyString(), isNull(), eq(Langue.FRANCAIS)))
                .thenReturn("WA-98765");
        when(smsLogRepository.save(any(SmsLog.class))).thenAnswer(inv -> inv.getArgument(0));

        SmsLog log = notificationService.notifierPatiente(p, "Campagne test", null, null);

        assertThat(log).isNotNull();
        assertThat(log.getCanal()).isEqualTo(CanalNotification.WHATSAPP);
        assertThat(log.getMediaUrl()).isNull();
        assertThat(log.getStatut()).isEqualTo(StatutSms.SIMULE);
        assertThat(log.getMessageIdExterne()).isEqualTo("WA-98765");

        verify(whatsAppGateway, times(1)).envoyerMessage(anyString(), anyString(), isNull(), any());
        verify(orangeSmsGateway, never()).envoyerSms(anyString(), anyString(), any());
    }
}

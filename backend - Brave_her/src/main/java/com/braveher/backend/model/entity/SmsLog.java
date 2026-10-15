package com.braveher.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.model.enums.Langue;
import com.braveher.backend.model.enums.StatutSms;

/** Journal de chaque notification envoyée (SMS Orange ou WhatsApp). */
@Entity
@Table(name = "sms_logs", indexes = {
        @Index(name = "idx_smslog_canal", columnList = "canal"),
        @Index(name = "idx_smslog_date", columnList = "date_envoi")
})
@Getter
@Setter
@NoArgsConstructor
public class SmsLog extends BaseEntity {

    @Column(nullable = false, length = 20)
    private String destinataire;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CanalNotification canal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Langue langue;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    /** Vidéo / mémo vocal joint (WhatsApp uniquement). */
    @Column(length = 500)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StatutSms statut;

    /** Identifiant renvoyé par la passerelle (Orange / WhatsApp), ou généré en mode simulé. */
    @Column(length = 100)
    private String messageIdExterne;

    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campagne_id")
    private Campagne campagne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patiente_id")
    private Patiente patiente;
}

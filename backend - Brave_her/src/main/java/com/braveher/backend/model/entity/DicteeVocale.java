package com.braveher.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Dictée vocale de l'agent : audio -> transcription (Orange STT) -> entités extraites (NLP). */
@Entity
@Table(name = "dictees_vocales")
@Getter
@Setter
@NoArgsConstructor
public class DicteeVocale extends BaseEntity {

    @Column(length = 500)
    private String cheminAudio;

    @Column(columnDefinition = "TEXT")
    private String transcription;

    /** Indicateurs détectés par le NLP, stockés en JSONB (requêtable sous PostgreSQL). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String entitesExtraitesJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;
}

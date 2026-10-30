package com.braveher.backend.config;

import com.braveher.backend.model.entity.*;
import com.braveher.backend.model.enums.*;
import com.braveher.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Données de démonstration réalistes (Burkina Faso). Exécuté une seule fois : base vide uniquement.
 * Désactivable via SEED_ENABLED=false.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DataSeeder implements ApplicationRunner {

    private final CentreSanteRepository centreRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PatienteRepository patienteRepository;
    private final FondsParrainageRepository fondsRepository;
    private final CampagneRepository campagneRepository;
    private final EvaluationRepository evaluationRepository;
    private final BonSanteRepository bonSanteRepository;
    private final SmsLogRepository smsLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.mot-de-passe-demo}")
    private String motDePasseDemo;

    public DataSeeder(CentreSanteRepository centreRepository,
                      UtilisateurRepository utilisateurRepository,
                      PatienteRepository patienteRepository,
                      FondsParrainageRepository fondsRepository,
                      CampagneRepository campagneRepository,
                      EvaluationRepository evaluationRepository,
                      BonSanteRepository bonSanteRepository,
                      SmsLogRepository smsLogRepository,
                      PasswordEncoder passwordEncoder) {
        this.centreRepository = centreRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.patienteRepository = patienteRepository;
        this.fondsRepository = fondsRepository;
        this.campagneRepository = campagneRepository;
        this.evaluationRepository = evaluationRepository;
        this.bonSanteRepository = bonSanteRepository;
        this.smsLogRepository = smsLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (utilisateurRepository.count() > 0) {
            log.info("Données déjà présentes : seed ignoré");
            return;
        }

        // --- Centres de santé ---
        CentreSante tanghin = centre("CSPS de Tanghin", TypeCentre.CSPS, "Centre", "Kadiogo", "Ouagadougou", 12.3920, -1.5100);
        CentreSante pissy = centre("CMA de Pissy", TypeCentre.CMA, "Centre", "Kadiogo", "Ouagadougou", 12.3500, -1.5600);
        centre("CHU Yalgado Ouédraogo", TypeCentre.CHU, "Centre", "Kadiogo", "Ouagadougou", 12.3790, -1.5170);
        CentreSante koro = centre("CSPS de Kôrô", TypeCentre.CSPS, "Hauts-Bassins", "Houet", "Bobo-Dioulasso", 11.1800, -4.2970);
        CentreSante koudougou = centre("CSPS Secteur 5 Koudougou", TypeCentre.CSPS, "Centre-Ouest", "Boulkiemdé", "Koudougou", 12.2526, -2.3627);
        CentreSante djibo = centre("CSPS de Djibo", TypeCentre.CSPS, "Sahel", "Soum", "Djibo", 14.1020, -1.6280);

        // --- Utilisateurs (mot de passe commun de démo) ---
        utilisateur("Kaboré", "Admin", "+22670000001", "admin@example.org", Role.ADMIN, null);
        Utilisateur sageFemme = utilisateur("Ouédraogo", "Awa", "+22670000002", "awa.ouedraogo@example.org", Role.SAGE_FEMME, tanghin);
        utilisateur("Sawadogo", "Issouf", "+22670000003", null, Role.AGENT_SANTE, tanghin);
        utilisateur("Traoré", "Mariam", "+22670000004", null, Role.AGENT_SANTE, koro);
        utilisateur("Zongo", "Pascal", "+22670000005", "ministere@sante.gov.bf", Role.MINISTERE, null);
        utilisateur("Compaoré", "Fatimata", "+22670000006", "fatimata.compaore@example.org", Role.SAGE_FEMME, koro);

        // --- Patientes : mix téléphone classique (SMS) / smartphone (WhatsApp) et langues ---
        Patiente p1 = patiente("Ouédraogo", "Salimata", 46, "+22676110001", false, Langue.MOORE, "Ouagadougou", "Centre", true, false, tanghin);
        Patiente p2 = patiente("Kaboré", "Aminata", 38, "+22676110002", true, Langue.FRANCAIS, "Ouagadougou", "Centre", false, false, tanghin);
        Patiente p3 = patiente("Nikiéma", "Rasmata", 52, "+22676110003", false, Langue.MOORE, "Ouagadougou", "Centre", true, false, pissy);
        patiente("Zoungrana", "Bibata", 41, "+22676110004", true, Langue.MOORE, "Ouagadougou", "Centre", false, false, pissy);
        Patiente p5 = patiente("Sanou", "Mariam", 44, "+22676110005", false, Langue.DIOULA, "Bobo-Dioulasso", "Hauts-Bassins", true, false, koro);
        patiente("Traoré", "Fanta", 35, "+22676110006", true, Langue.DIOULA, "Bobo-Dioulasso", "Hauts-Bassins", false, false, koro);
        Patiente p7 = patiente("Bamogo", "Adjaratou", 49, "+22676110007", false, Langue.MOORE, "Koudougou", "Centre-Ouest", true, false, koudougou);
        patiente("Yaméogo", "Clarisse", 57, "+22676110008", true, Langue.FRANCAIS, "Koudougou", "Centre-Ouest", false, false, koudougou);
        Patiente p9 = patiente("Diallo", "Hawa", 43, "+22676110009", false, Langue.FULFULDE, "Djibo", "Sahel", true, true, djibo);
        patiente("Barry", "Kadiatou", 39, "+22676110010", false, Langue.FULFULDE, "Djibo", "Sahel", true, true, djibo);

        // --- Fonds de parrainage (FCFA) ---
        FondsParrainage fonds1 = fonds("Fonds Octobre Rose 2026 (démo)", "Partenaire Télécom", new BigDecimal("5000000"));
        fonds("Fonds Solidarité Déplacées Internes (démo)", "ONG partenaire", new BigDecimal("2000000"));

        // --- Évaluations de démonstration (pour la heatmap et le tableau de bord) ---
        evaluation(p1, sageFemme, tanghin, true, true, true, 8, NiveauSuspicion.ELEVE,
                "Suspicion ÉLEVÉE : Nodule palpé + peau d'orange. Référence CHU.");
        evaluation(p2, sageFemme, tanghin, false, false, false, 1, NiveauSuspicion.FAIBLE,
                "Risque FAIBLE : Sensibilisation à l'auto-palpation.");
        evaluation(p3, sageFemme, pissy, true, false, true, 6, NiveauSuspicion.ELEVE,
                "Suspicion ÉLEVÉE : Adénopathie + nodule. Référence CMA.");
        evaluation(p5, sageFemme, koro, false, false, false, 3, NiveauSuspicion.MODERE,
                "Suspicion MODÉRÉE : Douleur persistante et antécédents.");
        evaluation(p7, sageFemme, koudougou, false, false, false, 1, NiveauSuspicion.FAIBLE,
                "Risque FAIBLE : Examen normal.");
        evaluation(p9, sageFemme, djibo, true, true, true, 8, NiveauSuspicion.ELEVE,
                "Suspicion ÉLEVÉE : Patiente déplacée interne. Prise en charge prioritaire.");

        // --- Bon de santé pré-émis pour la démo ---
        BonSante bon = new BonSante();
        bon.setCode("BON-BF-DEMO01");
        bon.setMontant(new BigDecimal("25000"));
        bon.setStatut(StatutBon.EMIS);
        bon.setTransactionOrangeMoney("OM-BF-TX98231");
        bon.setDateEmission(java.time.LocalDateTime.now().minusHours(2));
        bon.setPatiente(p1);
        bon.setFonds(fonds1);
        bon.setCentre(tanghin);
        bonSanteRepository.save(bon);

        // --- Campagne active ---
        Campagne campagne = new Campagne();
        campagne.setTitre("Octobre Rose 2026 — Kadiogo");
        campagne.setMessage("Dépistage GRATUIT du cancer du sein ce samedi au CSPS de Tanghin. "
                + "Venez avec votre carnet. Parlez-en à vos sœurs et voisines.");
        campagne.setRegion("Centre");
        campagne.setCommune("Ouagadougou");
        campagne.setDateDebut(LocalDate.now());
        campagne.setDateFin(LocalDate.now().plusDays(30));
        campagne.setStatut(StatutCampagne.EN_COURS);
        campagne.setPlanifiePar(sageFemme);
        campagne.setCentre(tanghin);
        Campagne campSaved = campagneRepository.save(campagne);

        // --- Notifications pré-enregistrées (SMS Orange pour p1, WhatsApp pour p2) pour la démo ---
        SmsLog logSms = new SmsLog();
        logSms.setDestinataire(p1.getTelephone());
        logSms.setCanal(CanalNotification.SMS);
        logSms.setLangue(p1.getLangue());
        logSms.setContenu("Ne y baasgo! Wa n gese f yĩnga la f biis CSPS pʋgẽ. Dépistage yaa zaalem.");
        logSms.setStatut(StatutSms.SIMULE);
        logSms.setMessageIdExterne("ORA-SMS-DEMO01");
        logSms.setDateEnvoi(java.time.LocalDateTime.now().minusHours(1));
        logSms.setPatiente(p1);
        logSms.setCampagne(campSaved);
        smsLogRepository.save(logSms);

        SmsLog logWa = new SmsLog();
        logWa.setDestinataire(p2.getTelephone());
        logWa.setCanal(CanalNotification.WHATSAPP);
        logWa.setLangue(p2.getLangue());
        logWa.setContenu("Dépistage gratuit du cancer du sein ce samedi au CSPS de Tanghin. Consultez le guide vidéo joint !");
        logWa.setMediaUrl(null);
        logWa.setStatut(StatutSms.SIMULE);
        logWa.setMessageIdExterne("WA-DEMO02");
        logWa.setDateEnvoi(java.time.LocalDateTime.now().minusMinutes(45));
        logWa.setPatiente(p2);
        logWa.setCampagne(campSaved);
        smsLogRepository.save(logWa);


        log.info("Seed terminé : {} centres, {} utilisateurs, {} patientes. Mot de passe démo : {}",
                centreRepository.count(), utilisateurRepository.count(), patienteRepository.count(), motDePasseDemo);
    }

    private CentreSante centre(String nom, TypeCentre type, String region, String province, String commune,
                               double lat, double lng) {
        CentreSante c = new CentreSante();
        c.setNom(nom);
        c.setType(type);
        c.setRegion(region);
        c.setProvince(province);
        c.setCommune(commune);
        c.setLatitude(lat);
        c.setLongitude(lng);
        return centreRepository.save(c);
    }

    private Utilisateur utilisateur(String nom, String prenom, String tel, String email, Role role, CentreSante centre) {
        Utilisateur u = new Utilisateur();
        u.setNom(nom);
        u.setPrenom(prenom);
        u.setTelephone(tel);
        u.setEmail(email);
        u.setMotDePasse(passwordEncoder.encode(motDePasseDemo));
        u.setRole(role);
        u.setCentre(centre);
        return utilisateurRepository.save(u);
    }

    private Patiente patiente(String nom, String prenom, int age, String tel, boolean whatsapp, Langue langue,
                              String commune, String region, boolean vulnerable, boolean deplacee, CentreSante centre) {
        Patiente p = new Patiente();
        p.setNom(nom);
        p.setPrenom(prenom);
        p.setAge(age);
        p.setTelephone(tel);
        p.setUtiliseWhatsApp(whatsapp);
        p.setLangue(langue);
        p.setCommune(commune);
        p.setRegion(region);
        p.setVulnerable(vulnerable);
        p.setDeplaceeInterne(deplacee);
        p.setCentre(centre);
        return patienteRepository.save(p);
    }

    private FondsParrainage fonds(String nom, String sponsor, BigDecimal montant) {
        FondsParrainage f = new FondsParrainage();
        f.setNom(nom);
        f.setSponsor(sponsor);
        f.setSoldeInitial(montant);
        f.setSoldeActuel(montant);
        return fondsRepository.save(f);
    }

    private Evaluation evaluation(Patiente patiente, Utilisateur agent, CentreSante centre,
                                  boolean nodule, boolean peauOrange, boolean adenopathie,
                                  int score, NiveauSuspicion niveau, String reco) {
        Evaluation e = new Evaluation();
        e.setClientUuid(java.util.UUID.randomUUID());
        e.setDateEvaluation(java.time.LocalDateTime.now().minusDays(2));
        e.setPatiente(patiente);
        e.setAgent(agent);
        e.setCentre(centre);
        e.setScoreSuspicion(score);
        e.setNiveau(niveau);
        e.setRecommandation(reco);
        e.setSource(SourceSaisie.FORMULAIRE);
        e.setLatitude(centre.getLatitude());
        e.setLongitude(centre.getLongitude());

        IndicateursCliniques ind = new IndicateursCliniques();
        ind.setNoduleSein(nodule);
        ind.setPeauOrange(peauOrange);
        ind.setAdenopathieAxillaire(adenopathie);
        ind.setAge40Plus(patiente.getAge() != null && patiente.getAge() >= 40);
        e.setIndicateurs(ind);

        return evaluationRepository.save(e);
    }
}

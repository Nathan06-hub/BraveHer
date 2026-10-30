import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

# Colors
PRIMARY = colors.HexColor("#0D5C63")     # Teal médical
SECONDARY = colors.HexColor("#FF7900")   # Orange solidarité
TEXT_DARK = colors.HexColor("#1A2B2D")   # Texte principal
TEXT_MUTED = colors.HexColor("#536B70")  # Texte secondaire
BG_LIGHT = colors.HexColor("#F2F8F8")    # Fond léger
BORDER_COLOR = colors.HexColor("#D6E8E8")
WHITE = colors.HexColor("#FFFFFF")
SUCCESS_COLOR = colors.HexColor("#107C41")

styles = getSampleStyleSheet()

# Custom styles
style_header_tag = ParagraphStyle(
    'HeaderTag',
    fontName='Helvetica-Bold',
    fontSize=8,
    textColor=SECONDARY,
    leading=10,
    textTransform='uppercase',
    alignment=0
)

style_title = ParagraphStyle(
    'DocTitle',
    fontName='Helvetica-Bold',
    fontSize=18,
    textColor=PRIMARY,
    leading=22,
    spaceAfter=4
)

style_subtitle = ParagraphStyle(
    'DocSubTitle',
    fontName='Helvetica-Oblique',
    fontSize=10,
    textColor=TEXT_MUTED,
    leading=14,
    spaceAfter=12
)

style_h1 = ParagraphStyle(
    'Heading1_Custom',
    fontName='Helvetica-Bold',
    fontSize=12,
    textColor=PRIMARY,
    leading=16,
    spaceBefore=10,
    spaceAfter=6
)

style_h2 = ParagraphStyle(
    'Heading2_Custom',
    fontName='Helvetica-Bold',
    fontSize=10,
    textColor=SECONDARY,
    leading=13,
    spaceBefore=6,
    spaceAfter=4
)

style_body = ParagraphStyle(
    'Body_Custom',
    fontName='Helvetica',
    fontSize=8.5,
    textColor=TEXT_DARK,
    leading=12,
    spaceAfter=6
)

style_bullet = ParagraphStyle(
    'Bullet_Custom',
    fontName='Helvetica',
    fontSize=8.5,
    textColor=TEXT_DARK,
    leading=12,
    leftIndent=12,
    spaceAfter=3
)

style_callout = ParagraphStyle(
    'Callout_Custom',
    fontName='Helvetica-Bold',
    fontSize=8.5,
    textColor=PRIMARY,
    leading=12
)

style_table_header = ParagraphStyle(
    'TableHeader',
    fontName='Helvetica-Bold',
    fontSize=8,
    textColor=WHITE,
    leading=10,
    alignment=1
)

style_table_cell = ParagraphStyle(
    'TableCell',
    fontName='Helvetica',
    fontSize=8,
    textColor=TEXT_DARK,
    leading=10
)

style_table_cell_center = ParagraphStyle(
    'TableCellCenter',
    fontName='Helvetica',
    fontSize=8,
    textColor=TEXT_DARK,
    leading=10,
    alignment=1
)

def create_header(canvas, doc, title_text):
    canvas.saveState()
    canvas.setFont('Helvetica-Bold', 7)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(36, 810, "CONCOURS YENNENGA DIGIT'ELLES 2026 — FEMMES TIC BURKINA FASO | SEMAINE DU NUMÉRIQUE")
    canvas.drawRightString(559, 810, title_text)
    canvas.setStrokeColor(BORDER_COLOR)
    canvas.setLineWidth(0.5)
    canvas.line(36, 804, 559, 804)
    
    # Footer
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(36, 25, "Brave_her — Santé Numérique & Dépistage Solidaire au Burkina Faso | Dépôt officiel 2026")
    canvas.drawRightString(559, 25, f"Page {doc.page}")
    canvas.line(36, 33, 559, 33)
    canvas.restoreState()

# =========================================================================
# DOCUMENT 1 : FICHE DESCRIPTIVE DU PROJET
# =========================================================================
def build_fiche_projet(filename="BraveHer_Fiche_Description_Projet.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=42
    )
    story = []

    # Tag & Title
    story.append(Paragraph("Semaine du Numérique 2026 &bull; Concours Yennenga Digit'Elles", style_header_tag))
    story.append(Spacer(1, 3))
    story.append(Paragraph("FICHE DE DESCRIPTION DU PROJET — BRAVE_HER", style_title))
    story.append(Paragraph("Dispositif numérique inclusif d'e-santé pour le dépistage précoce du cancer du sein et le tiers-payant solidaire au Burkina Faso", style_subtitle))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8))

    # Bloc Équipe
    team_data = [
        [
            Paragraph("<b>Porteuse du projet :</b>", style_callout),
            Paragraph("<b>OUEDRAOGO Omaïma</b> &mdash; Lead Conception E-Santé & Pilotage Stratégique", style_body)
        ],
        [
            Paragraph("<b>Équipe technique :</b>", style_callout),
            Paragraph("<b>BOUDA Distelle Aurélia Wendenda</b> (Lead Frontend UI/UX & Offline)<br/>"
                      "<b>MARE Stéphane Nathanaël</b> (Ingénieur Test QA & Développeur Backend)<br/>"
                      "<b>WAONGO Serge Landry</b> (Ingénieur Backend Spring Boot & Sécurité des Systèmes)", style_body)
        ],
        [
            Paragraph("<b>Localisation & Statut :</b>", style_callout),
            Paragraph("Ouagadougou, Burkina Faso &bull; Prototype fonctionnel (MVP testé et audité)", style_body)
        ]
    ]
    team_table = Table(team_data, colWidths=[110, 413])
    team_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(team_table)
    story.append(Spacer(1, 10))

    # 1. Problème et contexte local
    story.append(Paragraph("1. Problème ciblé et contexte sanitaire burkinabè", style_h1))
    story.append(Paragraph(
        "Le cancer du sein est la <b>1ère cause de mortalité par cancer chez la femme au Burkina Faso</b>. "
        "Plus de <b>80 % des patientes sont diagnostiquées aux stades 3 ou 4</b>, réduisant drastiquement les chances de rémission. "
        "Cette hécatombe silencieuse est alimentée par trois freins structurels :", style_body))
    story.append(Paragraph("&bull; <b>L'enclavement et la fracture numérique :</b> Les centres de santé de base (CSPS) en milieu rural n'ont pas d'accès Internet continu pour échanger avec les hôpitaux de référence.", style_bullet))
    story.append(Paragraph("&bull; <b>La barrière linguistique et l'analphabétisme :</b> Plus de 65 % des femmes rurales ne maîtrisent pas le français et sont exclues des campagnes d'information classiques.", style_bullet))
    story.append(Paragraph("&bull; <b>La précarité financière :</b> Une échographie/mammographie coûte 20 000 à 27 000 FCFA, une somme insurmontable pour les ménages vulnérables et les 2 millions de personnes déplacées internes (PDI).", style_bullet))
    story.append(Spacer(1, 8))

    # 2. La Solution Numérique Brave_her
    story.append(Paragraph("2. Description de la solution numérique Brave_her", style_h1))
    story.append(Paragraph(
        "Brave_her est une plateforme d'e-santé souveraine conçue sur mesure pour les réalités de terrain du Burkina Faso :", style_body))
    
    sol_data = [
        [
            Paragraph("<b>Brique</b>", style_table_header),
            Paragraph("<b>Fonctionnalité & Rôle Médical</b>", style_table_header),
            Paragraph("<b>Ancrage Terrain au Burkina Faso</b>", style_table_header)
        ],
        [
            Paragraph("<b>1. Mode Offline-First</b>", style_table_cell),
            Paragraph("Saisie clinique locale chiffrée (IndexedDB AES-GCM 256 bits). Synchronisation automatique dès détection du réseau.", style_table_cell),
            Paragraph("Continuité de service garantie dans les CSPS sans électricité stable ni couverture 3G/4G.", style_table_cell)
        ],
        [
            Paragraph("<b>2. Système Expert SEADM</b>", style_table_cell),
            Paragraph("Aide à la décision médicale conforme aux protocoles OMS et Société Burkinabè de Sénologie (Tri : Faible, Modéré, Élevé).", style_table_cell),
            Paragraph("Explicabilité clinique 100 % déterministe sans boîte noire d'IA, adoptée par les sages-femmes.", style_table_cell)
        ],
        [
            Paragraph("<b>3. Tiers-Payant Solidaire</b>", style_table_cell),
            Paragraph("Émission d'un Bon de Santé numérique QR/Code lié au Fonds de Solidarité alimenté par bailleurs et entreprises.", style_table_cell),
            Paragraph("Virement Orange Money déclenché vers l'hôpital lors de l'acte d'imagerie (zéro avance de frais).", style_table_cell)
        ],
        [
            Paragraph("<b>4. Sensibilisation Multilingue</b>", style_table_cell),
            Paragraph("Rappels automatisés selon l'âge en Mooré, Dioula, Fulfuldé et Français relayés par messages vocaux et SMS 2G.", style_table_cell),
            Paragraph("Inclusion totale des femmes analphabètes et respect des langues du terroir.", style_table_cell)
        ],
    ]
    t_sol = Table(sol_data, colWidths=[95, 235, 193])
    t_sol.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_sol)
    story.append(Spacer(1, 10))

    # 3. Caractère innovant & Valeur ajoutée
    story.append(Paragraph("3. Caractère innovant & Valeur ajoutée", style_h1))
    story.append(Paragraph("&bull; <b>Innovation de rupture par la résilience :</b> Première application nationale de santé à fonctionner en mode déconnecté avec chiffrement militaire local respectant les directives de la Commission de l'Informatique et des Libertés (CIL).", style_bullet))
    story.append(Paragraph("&bull; <b>Innovation d'action médico-financière :</b> Contrairement aux applications qui se contentent d'alerter sans pouvoir soigner, Brave_her solvabilise l'examen médical immédiatement via Mobile Money.", style_bullet))
    story.append(Paragraph("&bull; <b>NLP clinique adapté avec gestion des négations :</b> Analyse des dictées médicales des soignantes capable de distinguer les signes positifs des affirmations négatives (ex. 'aucun nodule').", style_bullet))
    story.append(Spacer(1, 8))

    # 4. État d'avancement réel & Démonstration
    story.append(Paragraph("4. État d'avancement réel & Validation technique", style_h1))
    story.append(Paragraph(
        "Le projet a dépassé le stade conceptuel et dispose d'un <b>prototype complet et testé</b> :<br/>"
        "&bull; <b>Backend :</b> API REST Java / Spring Boot 3 sécurisée par JWT, PostgreSQL, gestion fine des accès multi-centres (anti-BOLA) et passerelles de paiement.<br/>"
        "&bull; <b>Frontend :</b> Application web progressive React 19 / TypeScript, 33 tests automatisés unitaires et d'intégration validés (Vitest).<br/>"
        "&bull; <b>Dépôt GitHub public audité :</b> <u>https://github.com/Nathan06-hub/BraveHer.git</u>", style_body))
    story.append(Spacer(1, 8))

    # 5. Impact & Objectifs 12 mois
    story.append(Paragraph("5. Impact sanitaire et sociétal mesurable (Objectifs 12 mois)", style_h1))
    story.append(Paragraph("&bull; <b>Précocité :</b> Réduire de 70 % le délai moyen entre premier signe et confirmation radiologique (passer de 120 à 21 jours).", style_bullet))
    story.append(Paragraph("&bull; <b>Couverture :</b> Équiper 20 CSPS pilotes (Centre et Hauts-Bassins) et former 60 sages-femmes d'État.", style_bullet))
    story.append(Paragraph("&bull; <b>Équité sociale :</b> 100 % des femmes vulnérables et PDI dépistées à risque bénéficient de la gratuité totale de leur échographie/mammographie.", style_bullet))

    doc.build(story, onFirstPage=lambda c, d: create_header(c, d, "FICHE DESCRIPTIVE"),
                    onLaterPages=lambda c, d: create_header(c, d, "FICHE DESCRIPTIVE"))
    print(f"[OK] Fiche descriptive générée : {filename}")

# =========================================================================
# DOCUMENT 2 : MODÈLE ÉCONOMIQUE & BUSINESS PLAN
# =========================================================================
def build_business_plan(filename="BraveHer_Modele_Economique_Business_Plan.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=42
    )
    story = []

    # Tag & Title
    story.append(Paragraph("Semaine du Numérique 2026 &bull; Concours Yennenga Digit'Elles", style_header_tag))
    story.append(Spacer(1, 3))
    story.append(Paragraph("MODÈLE ÉCONOMIQUE & PLAN DE DÉVELOPPEMENT — BRAVE_HER", style_title))
    story.append(Paragraph("Stratégie de monétisation, pérennité financière, structure de coûts et passage à l'échelle au Burkina Faso", style_subtitle))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8))

    # 1. Modèle d'affaires hybride
    story.append(Paragraph("1. Modèle d'Affaires Hybride & Flux de Revenus", style_h1))
    story.append(Paragraph(
        "Brave_her ne repose pas sur une logique associative fragile dépendante de dons aléatoires. "
        "La solution combine un modèle tripartite B2G (secteur public), B2B RSE (secteur privé) et Tiers-Payant d'impact :", style_body))

    bm_data = [
        [
            Paragraph("<b>Segment</b>", style_table_header),
            Paragraph("<b>Bénéficiaire / Client</b>", style_table_header),
            Paragraph("<b>Mécanisme de Revenu / Monétisation</b>", style_table_header)
        ],
        [
            Paragraph("<b>B2G (Public)</b>", style_table_cell),
            Paragraph("Ministère de la Santé, Directions Régionales (DRS), Districts Sanitaires", style_table_cell),
            Paragraph("Abonnement annuel SaaS pour le tableau de bord d'épidémiosurveillance, la heatmap régionale en temps réel et la gestion des flux CSPS-CHU.", style_table_cell)
        ],
        [
            Paragraph("<b>B2B RSE (Privé)</b>", style_table_cell),
            Paragraph("Opérateurs télécoms (Orange, Moov), Banques (Coris Bank, etc.), Compagnies minières", style_table_cell),
            Paragraph("Partenariats institutionnels et sponsoring d'impact : financement des packs SMS/voix de sensibilisation et dotation du Fonds de Solidarité (Octobre Rose).", style_table_cell)
        ],
        [
            Paragraph("<b>Frais de gestion Tiers-Payant</b>", style_table_cell),
            Paragraph("Bailleurs de fonds (OMS, Fonds Mondial, ONG internationales)", style_table_cell),
            Paragraph("Prélèvement d'une commission technique transparente de 3,5 % sur les flux de bons de santé pour assurer l'infogérance cloud sécurisée et la maintenance.", style_table_cell)
        ],
    ]
    t_bm = Table(bm_data, colWidths=[90, 185, 248])
    t_bm.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_bm)
    story.append(Spacer(1, 10))

    # 2. Structure des Coûts
    story.append(Paragraph("2. Structure des Coûts et Optimisations Techniques", style_h1))
    story.append(Paragraph("&bull; <b>Hébergement souverain & Sécurité CIL :</b> Serveurs cloud sécurisés conformes aux normes de données de santé (HDS) et audits de sécurité annuels.", style_bullet))
    story.append(Paragraph("&bull; <b>Optimisation des coûts télécoms :</b> Partenariat avec l'ARCEP et les opérateurs pour un <i>Shortcode d'Intérêt Public</i> permettant un tarif SMS subventionné (ou gratuit) pour la santé publique.", style_bullet))
    story.append(Paragraph("&bull; <b>Équipements de terrain :</b> Déploiement de tablettes tactiles professionnelles durcies (120 000 FCFA/unité) dotées du mode hors-ligne pour les sages-femmes.", style_bullet))
    story.append(Spacer(1, 8))

    # 3. Prévisionnel Financier Triennal (2026 - 2028)
    story.append(Paragraph("3. Prévisionnel Financier Triennal (en FCFA)", style_h1))
    fin_data = [
        [
            Paragraph("<b>Poste Budgétaire</b>", style_table_header),
            Paragraph("<b>Année 1 (Pilote 20 CSPS)</b>", style_table_header),
            Paragraph("<b>Année 2 (Extension 60 CSPS)</b>", style_table_header),
            Paragraph("<b>Année 3 (National 150 CSPS)</b>", style_table_header)
        ],
        [
            Paragraph("Abonnements B2G (Ministère & DRS)", style_table_cell),
            Paragraph("5 000 000 FCFA", style_table_cell_center),
            Paragraph("18 000 000 FCFA", style_table_cell_center),
            Paragraph("45 000 000 FCFA", style_table_cell_center),
        ],
        [
            Paragraph("Sponsoring RSE (Télécoms, Banques)", style_table_cell),
            Paragraph("15 000 000 FCFA", style_table_cell_center),
            Paragraph("35 000 000 FCFA", style_table_cell_center),
            Paragraph("70 000 000 FCFA", style_table_cell_center),
        ],
        [
            Paragraph("Commissions Tiers-Payant (3,5 %)", style_table_cell),
            Paragraph("1 750 000 FCFA", style_table_cell_center),
            Paragraph("5 250 000 FCFA", style_table_cell_center),
            Paragraph("14 000 000 FCFA", style_table_cell_center),
        ],
        [
            Paragraph("Fonds Concours & Amorçage", style_table_cell),
            Paragraph("5 000 000 FCFA", style_table_cell_center),
            Paragraph("0 FCFA", style_table_cell_center),
            Paragraph("0 FCFA", style_table_cell_center),
        ],
        [
            Paragraph("<b>TOTAL REVENUS</b>", style_callout),
            Paragraph("<b>26 750 000 FCFA</b>", style_callout),
            Paragraph("<b>58 250 000 FCFA</b>", style_callout),
            Paragraph("<b>129 000 000 FCFA</b>", style_callout),
        ],
        [
            Paragraph("Coûts Opérationnels & Tech", style_table_cell),
            Paragraph("18 500 000 FCFA", style_table_cell_center),
            Paragraph("41 000 000 FCFA", style_table_cell_center),
            Paragraph("86 000 000 FCFA", style_table_cell_center),
        ],
        [
            Paragraph("<b>RÉSULTAT NET (Autofinancement)</b>", style_callout),
            Paragraph("<b>+8 250 000 FCFA</b>", style_callout),
            Paragraph("<b>+17 250 000 FCFA</b>", style_callout),
            Paragraph("<b>+43 000 000 FCFA</b>", style_callout),
        ],
    ]
    t_fin = Table(fin_data, colWidths=[150, 125, 125, 123])
    t_fin.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BACKGROUND', (0, 5), (-1, 5), BG_LIGHT),
        ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor("#E2F0D9")),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_fin)
    story.append(Spacer(1, 10))

    # 4. Perspectives de Scalabilité
    story.append(Paragraph("4. Feuille de Route & Passage à l'Échelle", style_h1))
    story.append(Paragraph("&bull; <b>Phase 1 (Mois 1-12) :</b> Déploiement pilote 20 CSPS (Centre et Hauts-Bassins), signature convention Ministère de la Santé (PNLC).", style_bullet))
    story.append(Paragraph("&bull; <b>Phase 2 (Mois 13-24) :</b> Extension à 6 régions sanitaires et intégration du dépistage du cancer du col de l'utérus (IVA).", style_bullet))
    story.append(Paragraph("&bull; <b>Phase 3 (Mois 25-36) :</b> Couverture des 13 régions du Burkina Faso et amorçage du déploiement sous-régional (Mali, Niger, Côte d'Ivoire).", style_bullet))

    doc.build(story, onFirstPage=lambda c, d: create_header(c, d, "MODÈLE ÉCONOMIQUE & BUSINESS PLAN"),
                    onLaterPages=lambda c, d: create_header(c, d, "MODÈLE ÉCONOMIQUE & BUSINESS PLAN"))
    print(f"[OK] Business Plan généré : {filename}")

if __name__ == '__main__':
    build_fiche_projet()
    build_business_plan()

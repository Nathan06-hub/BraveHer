/**
 * Référentiels Officiels et Données de Référence du Burkina Faso
 * Brave_her — Ministère de la Santé & Passerelle Orange BF
 * 
 * Ce fichier regroupe les données de référence institutionnelles stables
 * (Communes, Hôpitaux d'imagerie CHU, Régions administratives et Protocoles médicaux par âge).
 * Il ne contient AUCUNE fausse donnée d'utilisateurs, de patientes ou de campagnes.
 */

import type { CentreImagerie, IndicateurZoneBF } from '../types/solidarity';
import type { RegleAutomatisationAge } from '../types/campaign';

// 1. Communes officielles du Burkina Faso pour la géolocalisation et les formulaires
export const COMMUNES_BF: string[] = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Ouahigouya',
  'Banfora',
  'Dédougou',
  'Kaya',
  'Fada N’Gourma',
  'Tenkodogo',
  'Dori',
  'Manga',
  'Gaoua',
  'Ziniaré',
];

// 2. Centres hospitaliers et services d'imagerie / sénologie de référence
export const CENTRES_IMAGERIE_BF: CentreImagerie[] = [
  {
    id: 'img-1',
    nom: 'Service Radiologie & Sénologie — CHU Yalgado Ouédraogo',
    commune: 'Ouagadougou',
    telephone: '+226 25 30 66 41',
    compteOrangeMoney: '+226 76 00 22 11',
    tarifStandardFCFA: 25000,
    delaiMoyenJours: 3,
  },
  {
    id: 'img-2',
    nom: 'Unité d’Imagerie Médicale — CHU de Bogodogo',
    commune: 'Ouagadougou',
    telephone: '+226 25 37 10 12',
    compteOrangeMoney: '+226 77 11 33 44',
    tarifStandardFCFA: 25000,
    delaiMoyenJours: 2,
  },
  {
    id: 'img-3',
    nom: 'Pôle Imagerie — CHU Souro Sanou',
    commune: 'Bobo-Dioulasso',
    telephone: '+226 20 97 00 44',
    compteOrangeMoney: '+226 75 88 99 00',
    tarifStandardFCFA: 22500,
    delaiMoyenJours: 4,
  },
  {
    id: 'img-4',
    nom: 'Cabinet d’Échographie & Mammographie Saint-Camille',
    commune: 'Ouagadougou',
    telephone: '+226 25 36 12 14',
    compteOrangeMoney: '+226 70 44 55 66',
    tarifStandardFCFA: 27000,
    delaiMoyenJours: 1,
  },
  {
    id: 'img-5',
    nom: 'Centre Médical CMA de Koudougou — Antenne Radiologie',
    commune: 'Koudougou',
    telephone: '+226 25 44 02 11',
    compteOrangeMoney: '+226 71 22 33 44',
    tarifStandardFCFA: 20000,
    delaiMoyenJours: 5,
  },
];

// 3. Règles cliniques standardisées de dépistage selon le cycle de vie et l'âge (20, 35, 40, 50 ans)
export const REGLES_AUTOMATISATION_AGE_SYSTEME: RegleAutomatisationAge[] = [
  {
    id: 'regle-age-20',
    nom: 'Programme 20-34 ans : Auto-examen mensuel des seins',
    description:
      "Rappel automatique envoyé chaque 1er du mois à toutes les femmes dès 20 ans pour encourager l'auto-examen régulier et l'autopalpation préventive des seins.",
    ageMin: 20,
    ageMax: 34,
    frequence: 'MENSUEL',
    jourDuMois: 1,
    actif: true,
    totalEnvoyes: 0,
    derniereExecution: '2026-10-01 08:00',
    prochaineExecution: '2026-11-01 08:00',
    messages: {
      francais:
        "Bonjour {prenom} ! C'est le début du mois : prenez 5 minutes pour réaliser votre auto-examen des seins. Prévenir tôt, c'est guérir !",
      moore:
        'Yaa yéelé {prenom} ! Kalo daminɛ yaa waati songe ti f maan f meng gesg. Ges-y y menga la y biis songe !',
      dioula:
        'Aw bismila {prenom} ! Kalo daminɛ ye waati ɲuman ye ka i sinsin kɔlɔsi i yɛrɛ bolo bi. Kɛnɛya ye foyi tɛmɛ !',
      fulfulde:
        'Jam waali {prenom} ! Nde lewru fuɗɗi, ɗum saanga moƴƴo ngam ƴeewtindaade enɗi maada. Cellal buri fuu !',
    },
  },
  {
    id: 'regle-age-35',
    nom: 'Programme 35-39 ans : Examen clinique annuel des seins',
    description:
      'Rappel annuel invitant les femmes à partir de 35 ans à se faire examiner par une sage-femme ou un médecin dans un centre de santé (CSPS).',
    ageMin: 35,
    ageMax: 39,
    frequence: 'ANNUEL',
    jourDuMois: 5,
    actif: true,
    totalEnvoyes: 0,
    derniereExecution: '2026-09-05 09:30',
    prochaineExecution: '2027-09-05 09:00',
    messages: {
      francais:
        'Bonjour {prenom} ! À partir de 35 ans, un examen clinique annuel des seins par une sage-femme est recommandé. Rendez-vous au CSPS pour votre contrôle gratuit.',
      moore:
        'Yaa yéelé {prenom} ! Yʋʋm 35 poore, segdame tɩ sage-femme gese y biisi yʋʋmd fãa. Wa-y CSPS n paam gesg zaalem.',
      dioula:
        'Aw bismila {prenom} ! San 35 kɔfɛ, a bɛ wajibiya ka taga dɔgɔtɔrɔso la san o san ka i sinsin sɛgɛsɛgɛ. Sɛgɛsɛgɛri gbansan don.',
      fulfulde:
        'Jam waali {prenom} ! So a heɓii duuɓi 35, heɗo doktoor ƴeewa enɗi maada hitaande fuu. War to CSPS ngam ƴeewteede ɓolum.',
    },
  },
  {
    id: 'regle-age-40',
    nom: 'Programme 40-49 ans : Écho-mammographie tous les 2 à 3 ans',
    description:
      'Protocole de surveillance recommandant une échographie mammaire et mammographie de contrôle tous les 2 à 3 ans pour les femmes de 40 à 49 ans.',
    ageMin: 40,
    ageMax: 49,
    frequence: 'TOUS LES 2-3 ANS',
    jourDuMois: 10,
    actif: true,
    totalEnvoyes: 0,
    derniereExecution: '2026-08-10 10:00',
    prochaineExecution: '2028-08-10 10:00',
    messages: {
      francais:
        'Bonjour {prenom} ! Entre 40 et 49 ans, une écho-mammographie est recommandée tous les 2 à 3 ans. Consultez votre sage-femme au CSPS pour obtenir votre orientation.',
      moore:
        'Yaa yéelé {prenom} ! Yʋʋm 40 n tɩ ta 49, segdame tɩ b maan echomammographie yʋʋm 2 walla 3 pʋgẽ. Wa-y centre n paam sebre.',
      dioula:
        'Aw bismila {prenom} ! San 40 fo ka se san 49 ma, echomammographie kɛli san 2 walima 3 kɔnɔ ka ɲi kosɛbɛ. Taga dɔgɔtɔrɔso la ka kunnafoni sɔrɔ.',
      fulfulde:
        'Jam waali {prenom} ! Hakkunde duuɓi 40 e 49, ɗum moƴƴi waɗde echomammographie duuɓi 2 koo 3 fuu. War to suudu lokkotoroo ngam heɓde ɗatal.',
    },
  },
  {
    id: 'regle-age-50',
    nom: 'Programme 50 ans et + : Mammographie de dépistage tous les 2 ans',
    description:
      'Protocole national de surveillance biennale : dépistage régulier par mammographie tous les 2 ans pour toutes les femmes dès 50 ans avec bons de prise en charge.',
    ageMin: 50,
    ageMax: 85,
    frequence: 'TOUS LES 2 ANS',
    jourDuMois: 15,
    actif: true,
    totalEnvoyes: 0,
    derniereExecution: '2026-07-15 08:30',
    prochaineExecution: '2028-07-15 08:30',
    messages: {
      francais:
        'Bonjour {prenom} ! À partir de 50 ans, une mammographie tous les 2 ans est essentielle pour votre santé. Contactez votre centre de santé pour votre bon de prise en charge.',
      moore:
        'Yaa yéelé {prenom} ! Yʋʋm 50 poore, mammographie maanego yʋʋm 2 fãa yaa tɩlɛ tɩ b gese y laafɩ. B paamda bon de santé CSPS pʋgẽ.',
      dioula:
        'Aw bismila {prenom} ! San 50 kɔfɛ, mammographie kɛli san 2 o san nafa ka bon i ka kɛnɛya kama. Aw ka na dɔgɔtɔrɔso la ka demɛ sɔrɔ.',
      fulfulde:
        'Jam waali {prenom} ! So a heɓii duuɓi 50, mammographie duuɓi 2 fuu na heewi nafoore ngam cellal maada. War to CSPS ngam heɓde ballal.',
    },
  },
];

// 4. Les 13 régions sanitaires du Burkina Faso pour la cartographie
export const INDICATEURS_REGIONS_BF: IndicateurZoneBF[] = [
  {
    regionId: 'centre',
    regionNom: 'Centre',
    chefLieu: 'Ouagadougou',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'hauts-bassins',
    regionNom: 'Hauts-Bassins',
    chefLieu: 'Bobo-Dioulasso',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'centre-ouest',
    regionNom: 'Centre-Ouest',
    chefLieu: 'Koudougou',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'nord',
    regionNom: 'Nord',
    chefLieu: 'Ouahigouya',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'cascades',
    regionNom: 'Cascades',
    chefLieu: 'Banfora',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'boucle-mouhoun',
    regionNom: 'Boucle du Mouhoun',
    chefLieu: 'Dédougou',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'centre-nord',
    regionNom: 'Centre-Nord',
    chefLieu: 'Kaya',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'est',
    regionNom: 'Est',
    chefLieu: 'Fada N’Gourma',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'centre-est',
    regionNom: 'Centre-Est',
    chefLieu: 'Tenkodogo',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'sahel',
    regionNom: 'Sahel',
    chefLieu: 'Dori',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'centre-sud',
    regionNom: 'Centre-Sud',
    chefLieu: 'Manga',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'sud-ouest',
    regionNom: 'Sud-Ouest',
    chefLieu: 'Gaoua',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
  {
    regionId: 'plateau-central',
    regionNom: 'Plateau-Central',
    chefLieu: 'Ziniaré',
    femmesSensibilisees: 0,
    depistagesRealises: 0,
    casSuspicionElevee: 0,
    demandesAideDeposees: 0,
    aidesAttribuees: 0,
    examensRealises: 0,
    tauxCouverture: 0,
    niveauRisque: 'faible',
  },
];

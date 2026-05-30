import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIncident, getBrigades, uploadPhoto } from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const IMPACTS = ['Critique', 'Majeure', 'Moyenne', 'Mineure'];

const CAUSES = [
  'Usure normale', 'Mauvaise maintenance', 'Surcharge', 'Vieillissement', 'Corrosion',
  'Erreur humaine', 'Defaut fabrication', 'Mauvaise installation', 'Variation tension',
  'Conditions climatiques', 'Qualite eau', 'Vibrations', 'Mauvais dimensionnement',
  'Absence lubrification', 'Autre'
];

const TYPES_DEF_GROUPES = {
  "A1. Pompes de surface - Mécaniques": [
    "Vibrations excessives", "Bruit anormal", "Désalignement moteur/pompe", "Échauffement des roulements",
    "Usure des roulements", "Fuite garniture mécanique", "Fuite d'huile", "Cavitation", "Corrosion",
    "Turbine usée", "Axe cassé", "Grippage", "Désamorçage", "Débit insuffisant", "Pression insuffisante",
    "Surpression", "Pompe bloquée", "Pompe ne démarre pas", "Fonctionnement intermittent"
  ],
  "A1. Pompes de surface - Électriques": [
    "Surcharge moteur", "Court-circuit", "Perte de phase", "Baisse tension", "Surtension",
    "Échauffement moteur", "Défaut isolement", "Déclenchement disjoncteur", "Mauvais câblage", "Variateur défaillant"
  ],
  "A1. Pompes de surface - Hydrauliques": [
    "Prise d'air aspiration", "Colmatage aspiration", "Clapet anti-retour défectueux", "Fuite conduite aspiration",
    "Fuite conduite refoulement", "Entrée sable/boue"
  ],
  "A2. Pompes de forage": [
    "Niveau dynamique trop bas", "Marche à sec", "Surcharge immergée", "Câble immergé détérioré",
    "Corrosion colonne", "Colonne rompue", "Pompe coincée dans forage", "Présence sable", "Débit faible",
    "Pompe noyée", "Défaillance moteur immergé", "Remontée d'eau insuffisante", "Défaut sonde niveau", "Défaut capteur pression"
  ],
  "A3. Colonnes d'exhaure": [
    "Corrosion interne", "Corrosion externe", "Fuite bride", "Rupture colonne", "Dévissage colonne",
    "Obstruction", "Déformation", "Fissure", "Usure filetages", "Encrassement calcaire", "Coup de bélier", "Mauvaise étanchéité"
  ],
  "B. Conduites d'adduction - Structurelles": [
    "Fuite", "Rupture conduite", "Fissure", "Perforation", "Affaissement canalisation", "Corrosion",
    "Déboîtement", "Écrasement", "Vieillissement matériau"
  ],
  "B. Conduites d'adduction - Hydrauliques": [
    "Perte de charge élevée", "Baisse pression", "Surpression", "Coup de bélier", "Débit insuffisant",
    "Contre-pente", "Poche d'air", "Colmatage", "Envasement", "Obstruction partielle/totale"
  ],
  "B. Conduites d'adduction - Environnementales": [
    "Érosion terrain", "Exposition conduite", "Inondation", "Glissement terrain", "Dommage travaux tiers"
  ],
  "C. Nœuds raccordement - Vannes": [
    "Vanne bloquée", "Vanne cassée", "Fuite vanne", "Vanne grippée", "Mauvaise fermeture", "Commande défectueuse"
  ],
  "C. Nœuds raccordement - Brides et raccords": [
    "Fuite bride", "Joint détérioré", "Desserrage boulons", "Corrosion raccord", "Mauvais alignement"
  ],
  "C. Nœuds raccordement - Regards et chambres": [
    "Inondation regard", "Couvercle endommagé", "Accumulation boue", "Accès obstrué"
  ],
  "C. Nœuds raccordement - Instrumentation": [
    "Manomètre défectueux", "Débitmètre hors service", "Compteur hors service", "Compteur bloqué", 
    "Capteur pression défaillant", "Sonde niveau défectueuse", "Transmission SCADA perdue"
  ],
  "D. Réseau électrique - Alimentation": [
    "Coupure électrique", "Chute tension", "Surtension", "Déséquilibre phases", "Perte phase", "Fréquence instable"
  ],
  "D. Réseau électrique - Câblage": [
    "Câble coupé", "Câble brûlé", "Mauvais serrage", "Défaut isolement", "Court-circuit", "Échauffement câble"
  ],
  "D. Réseau électrique - Protections": [
    "Disjoncteur déclenché", "Fusible grillé", "Relais défectueux", "Protection thermique HS", "Défaut mise à terre"
  ],
  "D. Réseau électrique - Transformateurs / groupes": [
    "Surchauffe transformateur", "Fuite huile transformateur", "Groupe électrogène ne démarre pas", "Batterie faible", "Défaut alternateur"
  ],
  "E. Armoires de commande - Électriques": [
    "Contacteur défectueux", "Relais HS", "Automate en défaut", "Variateur en panne", "Carte électronique HS", "Alimentation commande HS"
  ],
  "E. Armoires de commande - Thermiques": [
    "Surchauffe armoire", "Ventilation insuffisante", "Ventilateur HS", "Climatisation armoire HS"
  ],
  "E. Armoires de commande - Instrumentation/automatisme": [
    "Perte communication", "Défaut automate PLC", "Défaut télémétrie", "Défaut capteurs", "Alarme non fonctionnelle"
  ],
  "E. Armoires de commande - Physiques": [
    "Corrosion armoire", "Infiltration eau", "Présence poussière", "Porte endommagée", "Serrure cassée"
  ]
};



const SITES_DATA = {
  "Idini": {
    brigade: "Brigade d'Idini",
    forages: ["Forage F08","Forage F24","Forage F29","Forage F41","PK25","Forage F44","Wad Naga","Pk41"]
  },
  "Aftout Echergui": {
    brigade: "Brigade D'Aftout Echergui",
    forages: ["Barkeol","Boutherwa 2","Monguel","Elgabra","Tweizekre","Bouratt","Kankossa","M'Bout"]
  },
  "Aftout Essaheli": {
    brigade: "Brigade D'Aftout Echergui",
    forages: ["Beni-Nadji","Aftout Prise","PK17","Anti-bellier"]
  },
  "Boulenoir": {
    brigade: "Brigade de Boulenoir",
    forages: ["Forage PRN7","Forage F6","Forage F9","Forage F10","Forage F14","Chami","DN350"]
  },
  "Chami": {
    brigade: "Brigade de Boulenoir",
    forages: ["Forage F1","Forage F2","Forage F3","Forage F4"]
  },
  "Dessalement": {
    brigade: "Brigade de dessalement",
    forages: ["Nirobox N1","Nirobox N2","Nirobox N3","Nirobox N4","Module 02","Forage F4","Station principale"]
  },
  "Dhar": {
    brigade: "Brigade de Dhar",
    forages: ["Boughla BL15","BL7","BL8","SP0","DL6","SP2 Boughla","DL10"]
  },
  "Dhar(Boughla)": {
    brigade: "Brigade de Dhar",
    forages: ["BL7","BL8","BL15"]
  },
  "Aioun": {
    brigade: "Brigade du Hohd Egharbi",
    forages: ["Forage Gendarmerie","Forage Argoub","Forage Baghdad","Forage R2","Forage Elevage","Forage Telex","Fbase"]
  },
  "Tintane": {
    brigade: "Brigade du Hohd Egharbi",
    forages: ["Forage F2","Forage F3","Forage F4","Forage F5","FN1 Solaire","Forage F2 Solaire","Forage Eguenni"]
  },
  "Bassiknou": {
    brigade: "Brigade du Hohd Egharbi",
    forages: ["Forage F1","Forage F2","Forage F3","Forage F7"]
  },
  "Oualata": {
    brigade: "Brigade du Hohd Egharbi",
    forages: ["Forage F1 Solaire","Forage F2 Solaire","Forage F37","Levrayesse","F electrique"]
  },
  "Timbedra": {
    brigade: "Brigade du Hohd Egharbi",
    forages: ["Forage F1","Forage F2","Forage F3"]
  },
  "Kiffa": {
    brigade: "Brigade de Kiffa",
    forages: ["Forage JF13B","Forage TF5B","Bougadoum","Nakatt","Guerrou F8","Wad Rewda","Billemtar"]
  },
  "Guerrou": {
    brigade: "Brigade de Kiffa",
    forages: ["Forage F2","Forage F6","Forage F7","Forage F8","Forage 03","Nakatt","Chateau El-Hevra"]
  },
  "Kankossa": {
    brigade: "Brigade de Kiffa",
    forages: ["Forage F01","Forage F1 Abdel","Forage F3 Zaire","Forage F1 Zaire","Forage F6","Liweide"]
  },
  "Atar": {
    brigade: "Brigade du Nord",
    forages: ["Forage F2","Forage F5","Forage F6","Forage F7","Forage F8","Ilige F11","Teyaret Sdar"]
  },
  "Chinguitti": {
    brigade: "Brigade du Nord",
    forages: ["Forage F1","Forage F3","Forage F4","Forage F5","Forage F6","Forage 03"]
  },
  "Ouadane": {
    brigade: "Brigade du Nord",
    forages: ["Forage F3","Forage Total","Forage Goucha2","Forage Goucha3","Forage Goucha4"]
  },
  "Owjevt": {
    brigade: "Brigade du Nord",
    forages: ["Forage F1","Forage F2","Forage F4","Forage F2-F3-F4"]
  },
  "Tidjikja": {
    brigade: "Brigade du centre",
    forages: ["Forage F5","Forage F8","Forage F9","Forage F11","Forage F12","Forage F13","F8 Arzak"]
  },
  "Moudjeria": {
    brigade: "Brigade du centre",
    forages: ["Forage F3","Forage F4","Groupe Electrogene"]
  },
  "Rosso": {
    brigade: "Departement Eaux de Surface",
    forages: ["Ancienne Station","Nouvelle Station","Exhaure N01","Station principale"]
  },
  "Tekane": {
    brigade: "Departement Eaux de Surface",
    forages: ["Tekane","Nouvelle Station"]
  },
  "Kaedi": {
    brigade: "Departement Eaux de Surface",
    forages: ["Forage F4","Forage F5","Forage FE","Tenzah","Forages"]
  },
  "Bababé": {
    brigade: "Departement Eaux de Surface",
    forages: ["Forage F1","Forage F2","Forage F3","Forages de Bababe"]
  },
  "Lexeiba": {
    brigade: "Departement Eaux de Surface",
    forages: ["Forage F01","Forage F02","Forage 03","Forage 04","Forage 05"]
  },
  "Boghé": {
    brigade: "Departement Eaux de Surface",
    forages: ["Station de traitement","Daghveg","Boghe principal"]
  },
  "Aleg": {
    brigade: "Brigade du centre",
    forages: ["Forage F2","Forage F4","Bouhchiche","Bouhdide","Mbermesse","Chogar"]
  },
  "Boutilimite": {
    brigade: "Brigade d'Idini",
    forages: ["Forage FB2","Forage FB3","Forage FB4","Forage FB5"]
  },
  "Selibaby": {
    brigade: "Brigade de Kiffa",
    forages: ["Forage 02","Forage 04","Forage F5","Forage F6"]
  },
  "Barkeol": {
    brigade: "Brigade D'Aftout Echergui",
    forages: ["SP6","Forage principal"]
  },
  "Tamchekette": {
    brigade: "Brigade du Hohd Egharbi",
    forages: ["Forage F1","Forage F2","Forage F4","Nouveau Forage","Chateau d'eau"]
  }
};

const PIECES_PAR_CATEGORIE = {
  "Pompes immergees": [
    "Électropompe immergée multicellulaire 4' en acier inoxydable, puissance 0.75 kW, sortie 1'1/4, Q = 1.5 m³/h, HMT = 55 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 4' en acier inoxydable, puissance 1.1 kW, sortie 1'1/2, Q = 3 m³/h, HMT = 60 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 4' en acier inoxydable, puissance 1.5 kW, sortie 2', Q = 3 m³/h, HMT = 70 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 4' en acier inoxydable, puissance 2.2 kW, sortie 2', Q = 5 m³/h, HMT = 85 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 4' en acier inoxydable, puissance 3 kW, sortie 2', Q = 5 m³/h, HMT = 120 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 4' en acier inoxydable, puissance 4 kW, sortie 2', Q = 6 m³/h, HMT = 140 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 4' en acier inoxydable, puissance 5,5 kW, sortie 2', Q = 8 m³/h, HMT = 140 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 4' en acier inoxydable, puissance 7,5 kW, sortie 2', Q = 10 m³/h, HMT = 140 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 6' en acier inoxydable, puissance 9.2 kW, sortie 3', Q = 25 m³/h, HMT = 110 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 6' en acier inoxydable, puissance 11 kW, sortie 4', Q = 30 m³/h, HMT = 100 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 6' GRUNDFOS en acier inoxydable Aisi 316L, puissance 15 kW, sortie 4', Q = 60 m³/h, HMT = 63 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 8' en acier inoxydable, puissance 15 kW, sortie 4', Q = 40 m³/h, HMT = 100 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 8' en acier inoxydable, puissance 18.5 kW, sortie 4', Q = 50 m³/h, HMT = 100 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 8' en acier inoxydable, puissance 22 kW, sortie 5', Q = 60 m³/h, HMT = 100 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 8' en acier inoxydable, puissance 30 kW, sortie 5', Q = 80 m³/h, HMT = 100 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 8' en acier inoxydable, puissance 30 kW, sortie 5', Q = 80 m³/h, HMT = 100 mCE, moteur triphasé 380–400 V / 50 Hz.Demarrage etoil triangle",
    "Électropompe immergée multicellulaire 10' en acier inoxydable, puissance 37 kW, sortie 5', Q = 80 m³/h, HMT = 120 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 10' en acier inoxydable, puissance 37 kW, sortie 5', Q = 100 m³/h, HMT = 100 mCE, moteur triphasé 380–400 V / 50 Hz. Demarrage etoil triangle",
    "Électropompe immergée multicellulaire 10' en acier inoxydable, puissance 45 kW, sortie 6', Q = 100 m³/h, HMT = 120 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 10' en acier inoxydable, puissance 55 kW, sortie 6', Q = 125 m³/h, HMT = 120 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 10' en acier inoxydable, puissance 55 kW, sortie 6', Q = 150 m³/h, HMT = 100 mCE, moteur triphasé 380–400 V / 50 Hz.",
    "Électropompe immergée multicellulaire 12' en acier inoxydable, puissance 75 kW, sortie 8', Q = 160 m³/h, HMT = 130 mCE, moteur triphasé 380–400 V / 50 Hz."
  ],
  "Cables electriques": [
    "Câble d'alimentation 4x35 mm2  en Alu",
    "Câble  cuivre 4x25 mm2 souple, normes",
    "Câble   4x6mm² cuivre souple",
    "Câble  cuivre 4x16 mm2 cuivre souple",
    "Câble  4x2.5 mm2 souple en cuivre",
    "Câble  électrique 2x2.5mm² Ingelec",
    "Câble  cuivre 4X95mm2 armé souple",
    "Câble  Alu iso tors 4x16mm2",
    "Câble  nylon de sécurité 18mm",
    "Câble  nylon de sécurité 25mm",
    "Câble de sonde de niveau 3x1.5mm2 cuivre souple"
  ],
  "Kits de jonction": [
    "Kit de jonction thermo rétractable 10 mm² IP68",
    "Kit de jonction thermo rétractable 16 mm² IP68",
    "Kit de jonction thermo rétractable 25 mm² IP68",
    "Kit de jonction submersible à résine 16 mm² IP68",
    "Kit de jonction submersible à résine 25 mm² IP68"
  ],
  "Disjoncteurs": [
    "Disjoncteurs différentiel 10/30 A 4P",
    "Disjoncteurs différentiel 30/60 A 4P",
    "Compact NS250N - disjoncteur - TMD - 200A - 4P",
    "Disjoncteur C120N - 4P - 125A - courbe C",
    "Disjoncteur -C120N - 4P - 80A - courbe C",
    "Compact NSX100B - Disjoncteur - TM-D 40A - 3P",
    "Compact NSX630N - disjoncteur - 630A - 4P"
  ],
  "Fusibles": [
    "Fusible AM 125 A coton wimex",
    "Fusible 60A AM",
    "Fusible 16 A paquet de 24",
    "Fusible AM 20 A paquet 24 normes IEC 60947-3",
    "FUSIBLE 14*51 25 A avec porte fusible normes IEC 60947-3",
    "Fusible 160 A avec porte fsible normes IEC 60947-3",
    "FUSIBLE 63 A AM 22X58 normes IEC 60947-3",
    "Fusible MT Un:24kv ,ln:63A,I1 :16 KA  I3: 252A Frq :50Hz D :442 mm S .on :1265957 normes IEC 60947-3"
  ],
  "Variateurs": [
    "Variateurs solaire Hybride 2,2 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec,",
    "Variateurs solaire Hybride 3 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs solaire Hybride 4 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs solaire Hybride 5,5 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs solaire Hybride 7,5 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs solaire Hybride 11 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé ; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs solaire Hybride 15 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé ; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs de vitesse 18,5 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé ; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs de vitesse 22 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs de vitesse 30 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs de vitesse 37 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs de vitesse 45 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs de vitesse 55 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs de vitesse 75 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec",
    "Variateurs de vitesse 90 kw Alimentation : 400 V, 50 Hz; triphasé;type du moteur asynchrone triphasé; commande : U/f quadratique (pompe); protections : surcharge, court-circuit, sur/sous-tension, thermique moteur, marche à sec"
  ],
  "Accessoires hydrauliques - Cones": [
    "Cône fonte 2 B 100/80 PN10",
    "Cône en fonte BB DN 100/50 PN10",
    "Cône fonte 2 B 80/60 PN10",
    "Cône fonte 2b DN 200/150 PN10",
    "Cône fonte 2b DN 300/150 PN10",
    "Cône à 2 brides en fonte DN 300/200 PN10",
    "Cône 200/100 FD 2B PN 10",
    "Cône AG 150/100 BB PN 16",
    "Cône BB FD DN 150/65 PN16",
    "Cône fonte 2 B 350/300 PN10"
  ],
  "Accessoires hydrauliques - Reductions": [
    "Réduction en PEHD DE 200/160 PN10",
    "Réduction DE 315/160 en PE PN10",
    "Réduction en PEHD DE 200/110 PN10",
    "Réduction en PEHD DE 315/200 PN10",
    "Reduction PVC D 63/50 PN10",
    "Réduction Galva DN 50/32 PN10",
    "Réduction fileté Galva 4''/3' PN10",
    "Réduction 110/63 PE PN10",
    "Réduction 3'' su 2,5'' en inox PN10",
    "Réduction 400/200 PEHD PN10",
    "Réduction PE 110/90 PN 16",
    "Réduction PE DN 63/40 PN10",
    "Réduction PE mécanique DN 90/40 PN10",
    "Réduction PEHD 75/63 PN10"
  ],
  "Accessoires hydrauliques - Coudes": [
    "Coude PE 315 22.5° PN10",
    "Coude en PE DE 160 90° PN10",
    "Coude en PEDE 200 45° PN10",
    "Coude en fonte DN 60 BB 45° PN10",
    "Coude 2 B fonte DN 80 45°",
    "Coude PVC DN 15 90° PN10",
    "Coude en acier Galva 4'' 90° PN10",
    "Coudes AG 3'' 90° PN10",
    "Coude 2 E PVC DE 32-1/4 PN10",
    "Coude 2 E PVC DE 63 - 1/4 PN10",
    "Coude en acier Galva DN80 90° PN10",
    "Coude en PE DE 160-45° PN10",
    "Coude PE110 45° PN10",
    "Coude mécanique PEHD DN63 PN10",
    "Coude 2 B fonte DN 100-90° PN10",
    "Coude en PE DE90 - 90° PN10",
    "Coude PE DE110 90° PN10",
    "Coude PE63 90° PN 16",
    "Coud PE HD DE200 90° PN10",
    "Coud 2 B fonte DN 150-90° PN10",
    "Coud 2 B fonte DN 200 PN10"
  ],
  "Manchettes": [
    "Manchette de 50 cm en fonte DN 80 BB PN10",
    "Manchette FD DN 80 2B long 30 mm PN10",
    "Manchette BB DN 50 long 30 mm PN10",
    "Manchette BB DN 60 long 30 mm PN10",
    "Manchette à BB en fonte DN 80 long 1m PN10",
    "Manchette BB en fonte DN 150 long 1,5m PN10",
    "Manchette BB en fonte DN 300 long 1,5m PN10"
  ],
  "Vannes": [
    "Vannes d'arrêt 20/27 PN 16 d'arrêt",
    "Vanne DN 100 BB",
    "Vannes DN 80 BB PN 10",
    "Vanne BB DN 50",
    "Vanne AG 2' fileté",
    "Vanne DN 65 BB",
    "Vanne PVC-C D20DN15+GF",
    "Vannes BB DN315 PN16",
    "Vannes à boisseau sphérique 3'' PN 25",
    "Ventouses DN 25 mm avec vanne d'arrêt plus mamelon PN10",
    "Ventouse 2' fileté",
    "Ventouse triple effet DN 100 PN25",
    "Ventouse double effe DN 80 PN10",
    "Ventouse DN 40 bride 65 PN10",
    "Ventouse 50 PN 10 bride 50-65"
  ],
  "Plaques pleines": [
    "Plaque pleine fonte DN100 PN10",
    "Plaque pleine fonte DN100 PN25",
    "Plaque pleine fonte DN 300 PN10",
    "Plaque pleine fonte DN 300 PN25",
    "Plaque pleine DN 110 PN10",
    "Plaque pleine fonte DN 150 PN10",
    "Plaque pleine fonte DN 150 PN16",
    "Plaque pleine DN80 PN16",
    "Plaque pleine fonte DN 60 PN16"
  ],
  "Joints": [
    "Joint Gibault DN  50",
    "Joint plat DN 50",
    "Joint de démontage DN 50 PN10",
    "Joint Gibault DN 150 PN10",
    "Joint s plats DN 250 PN25",
    "Joint s plats DN 250 PN16",
    "Joint Gibault DN 250 PN10",
    "Joint plat DN 350 PN 10",
    "Joint plat DN 150",
    "Joint plat DN 250 PN10",
    "Joint Gibault DN 500",
    "Joint de démontage DN 150 PN10",
    "Joint Giboult DN 350 PN10",
    "Joint Gibault DN 200 PN16",
    "Joint plat DN 200 PN16",
    "Joint plat DN 300 PN16",
    "Joint Gibault DN 300 PN16",
    "Joint de démontage DN 300 PN16",
    "Joint Plat DN 80 PN16",
    "Joint Gibault DN 80 PN16",
    "Joint de dilatation DN 80 BB",
    "Joint plat DN80 PN10",
    "Joint de dilatation DN 110 PN16",
    "Joint plat DN 110 PN16",
    "Joint Gibault pour PVC DN 110 PN 16",
    "Joint plat DN 100 PN16",
    "Joint Gibault DN 100 PN16",
    "Joint plat DN 100 PN10",
    "Joint plat 125 PN 16",
    "Joint plat DN 125 PN25",
    "Joint plat 65 PN16",
    "Joint plat DN 65 PN10",
    "Joint de dilatation DN60 BB",
    "Joint plat DN 60 PN16",
    "Joint plat DN 60PN10",
    "Joint Gibault pour PVC DN160 PN16",
    "Joint Gibault DN 400 PN16",
    "Joint plat DN 400 PN16",
    "Joint Gbault DN 700 PN10"
  ],
  "Embouts et Mamelons": [
    "Embout bronze DN 63 PN16",
    "Embout 63 électro soudable PN16",
    "Embout PE DN 25 femelle PN10",
    "Embout PVC fileté M DN25",
    "Embout en PVC fileté. DN32",
    "Embout mécanique PE63 PN10",
    "Embout mécanique PE90 PN10",
    "Mamelon Galva DN 15 à visser PN 16",
    "Mamelon PVC DN 15 PN16",
    "Mamelon AG DN 15 PN10"
  ],
  "Clapets anti-retour": [
    "Clapet anti retour DN 65 BB norme EN 1074-3",
    "Clapet anti retour BB DN80 EN 1074-3",
    "Clapet anti retour DN100 BB EN 1074-3",
    "Clapet anti-retour DN80 BB PN 16 EN 1074-3",
    "Clapet anti-retour DN150 BB PN 16 EN 1074-3"
  ],
  "Manometres": [
    "Manomètre 0 à 16 bars GL avec ses accessoires, norme EN 837-1"
  ],
  "Mecanique": [
    "Garniture mécanique",
    "Garniture à tresse",
    "Roulement",
    "Ventilateur",
    "Calle"
  ],
  "Moteurs electriques": [
    "Moteur asynchrone triphasé 0,18 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 0,25 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 0,37 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 0,55 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 0,75 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 1,1 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 1,5 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 2,2 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 3 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 4 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 5,5 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 7,5 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 11 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 15 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 18,5 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 22 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 30 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 37 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 45 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 55 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé 75 kW – 380/400 V – 50 Hz – IP55 – Classe F – B3 – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 0,18 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 0,25 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 0,37 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 0,55 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 0,75 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 1,1 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 1,5 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 2,2 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 3 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 4 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 5,5 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 7,5 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 11 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 15 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 18,5 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 22 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 30 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 37 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 45 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 55 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles",
    "Moteur asynchrone triphasé à bride B5 75 kW – 380/400 V – 50 Hz – IP55 – Classe F – 2 pôles"
  ],
  "Autre": [
    "Autre"
  ]
};

export default function Signaler() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brigades, setBrigades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');


  const [form, setForm] = useState({
    site: '',
    forage_concerne: '',
    type_forage: 'Forage profond',
    localisation: '',
    description: '',
    impact: 'Moyenne',
    type_defaillance: 'Vibrations excessives',
    cause_probable: 'Usure normale',
    plan_action_signe: false,
    brigade: user?.brigade || '',
    chef_brigade: '',
    pieces_rechange: '',
    code_gmao: '',
    observation: '',
    photo_url: '',
    date_declaration: new Date().toISOString().slice(0, 10),
  });


  useEffect(() => {
    getBrigades().then(r => setBrigades(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'site') {
      const siteData = SITES_DATA[value];
      setForm(prev => ({
        ...prev,
        site: value,
        forage_concerne: '',
        brigade: siteData ? siteData.brigade : prev.brigade
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadPhoto(formData);
      setForm(prev => ({ ...prev, photo_url: res.data.photo_url }));
      setPhoto(res.data.photo_url);
    } catch (err) {
      setError("Erreur lors de l'envoi de la photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.site || !form.description || !form.brigade || !form.cause_probable) {
      setError('Veuillez remplir tous les champs obligatoires (Site, Description, Brigade, Cause Probable)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createIncident(form);
      setSuccess(true);
      setForm({
        site: '', forage_concerne: '', type_forage: 'Forage profond',
        localisation: '', description: '', impact: 'Moyenne',
        type_defaillance: 'Vibrations excessives', cause_probable: 'Usure normale', plan_action_signe: false,
        brigade: user?.brigade || '', chef_brigade: '', pieces_rechange: '',
        code_gmao: '', observation: '', photo_url: '',
        date_declaration: new Date().toISOString().slice(0, 10),
      });
      setPhoto(null);

      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la creation');
    } finally {
      setLoading(false);
    }
  };

  const forageDuSite = form.site && SITES_DATA[form.site] ? SITES_DATA[form.site].forages : [];
  const tousLesSites = Object.keys(SITES_DATA).sort();

  return (
    <Layout>
      <div className="page-header">
        <h2>Signaler un incident</h2>
        <p>Remplissez le formulaire pour declarer une panne ou anomalie</p>
      </div>

      {success && (
        <div className="alert alert-success">
          Incident signale avec succes !
          <button className="btn btn-outline btn-sm" style={{ marginLeft: 16 }} onClick={() => navigate('/incidents')}>
            Voir mes incidents
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label>Date de declaration *</label>
              <input type="date" name="date_declaration" value={form.date_declaration} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Impact sur la production *</label>
              <select name="impact" value={form.impact} onChange={handleChange}>
                {IMPACTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Site * <span style={{color:'#A0AEC0', fontWeight:400}}>(selection automatique de la brigade)</span></label>
              <select name="site" value={form.site} onChange={handleChange} required>
                <option value="">-- Selectionner un site --</option>
                {tousLesSites.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Forage / Equipement concerne *</label>
              <select name="forage_concerne" value={form.forage_concerne} onChange={handleChange}>
                <option value="">-- Selectionner un forage --</option>
                {forageDuSite.map(f => <option key={f} value={f}>{f}</option>)}
                <option value="Autre">Autre</option>
              </select>
            </div>



            <div className="form-group">
              <label>Type de defaillance *</label>
              <select name="type_defaillance" value={form.type_defaillance} onChange={handleChange}>
                {Object.entries(TYPES_DEF_GROUPES).map(([groupName, options]) => (
                  <optgroup key={groupName} label={groupName}>
                    {options.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cause probable *</label>
              <select name="cause_probable" value={form.cause_probable} onChange={handleChange}>
                {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Localisation precise</label>
              <input type="text" name="localisation" placeholder="Ex: Zone nord, forage F12, Wad Naga"
                value={form.localisation} onChange={handleChange} />
            </div>


            <div className="form-group">
              <label>Plan d'action signe</label>
              <select
                value={form.plan_action_signe ? "oui" : "non"}
                onChange={e => setForm(p => ({ ...p, plan_action_signe: e.target.value === "oui" }))}
              >
                <option value="non">Non</option>
                <option value="oui">Oui</option>
              </select>
            </div>

            <div className="form-group full">
              <label>Description de la defaillance * <span style={{color:'#A0AEC0', fontWeight:400}}>(symptomes et pre-diagnostic)</span></label>
              <textarea name="description" required rows={4}
                placeholder="Decrivez precisement le probleme observe : symptomes, conditions d'apparition, pre-diagnostic..."
                value={form.description} onChange={handleChange} />
            </div>

            <div className="form-group full">
              <label>Pieces de rechange utilisees</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select 
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', outline: 'none' }} 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value="">-- Choisir une categorie de pieces --</option>
                    {Object.keys(PIECES_PAR_CATEGORIE).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  {selectedCategory && (
                    <select 
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', outline: 'none' }} 
                      onChange={e => {
                        if (e.target.value) {
                          setForm(prev => ({
                            ...prev,
                            pieces_rechange: prev.pieces_rechange 
                              ? prev.pieces_rechange + ", " + e.target.value 
                              : e.target.value
                          }));
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">-- Selectionner la piece --</option>
                      {PIECES_PAR_CATEGORIE[selectedCategory].map(piece => (
                        <option key={piece} value={piece}>{piece}</option>
                      ))}
                    </select>
                  )}
                </div>
                <input 
                  type="text" 
                  name="pieces_rechange"
                  placeholder="Marque, designation ou selectionnez ci-dessus"
                  value={form.pieces_rechange} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Code GMAO</label>
              <input type="text" name="code_gmao" placeholder="Code GMAO si disponible"
                value={form.code_gmao} onChange={handleChange} />
            </div>

            <div className="form-group full">
              <label>Observation</label>
              <textarea name="observation" rows={3}
                placeholder="Remarques supplementaires..."
                value={form.observation} onChange={handleChange} />
            </div>

            <div className="form-group full">
              <label>Photo de l'incident</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} />
              {uploading && <div style={{ fontSize: 12, color: '#2E75B6', marginTop: 4 }}>Envoi de la photo en cours...</div>}
              {photo && (
                <div style={{ marginTop: 10 }}>
                  <img src={`http://localhost:5000/api${photo}`} alt="Incident" style={{ maxHeight: 150, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                </div>
              )}
            </div>

          </div>


          {(form.impact === 'Critique' || form.impact === 'Majeure') && (
            <div className="alert alert-error" style={{ marginTop: 16 }}>
              Impact {form.impact.toUpperCase()} - Une alerte sera envoyee automatiquement au chef de brigade et a la direction.
            </div>
          )}

          {form.site && SITES_DATA[form.site] && (
            <div className="alert alert-success" style={{ marginTop: 8 }}>
              Brigade assignee automatiquement : <strong>{SITES_DATA[form.site].brigade}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Soumettre l\'incident'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/incidents')}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

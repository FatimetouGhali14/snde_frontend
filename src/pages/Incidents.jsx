import React, { useState, useEffect, useCallback } from 'react';
import { listIncidents, updateIncident, deleteIncident } from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUTS = ['En attente', 'En cours', 'Acheve', 'Abandonne', 'Debloque apres 4h'];
const IMPACTS = ['Critique', 'Majeure', 'Moyenne', 'Mineure'];

const CAUSES = [
  'Usure normale', 'Mauvaise maintenance', 'Surcharge', 'Vieillissement', 'Corrosion',
  'Erreur humaine', 'Defaut fabrication', 'Mauvaise installation', 'Variation tension',
  'Conditions climatiques', 'Qualite eau', 'Vibrations', 'Mauvais dimensionnement',
  'Absence lubrification', 'Autre'
];

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

function badgeStatut(statut) {
  const map = {
    'En attente': 'badge-attente',
    'En cours': 'badge-cours',
    'Acheve': 'badge-acheve',
    'Abandonne': 'badge-abandonne',
    'Debloque apres 4h': 'badge-debloque',
  };
  return <span className={'badge ' + (map[statut] || 'badge-attente')}>{statut}</span>;
}

function badgeImpact(impact) {
  const map = {
    'Critique': 'impact-majeur',
    'Majeure': 'impact-moyen',
    'Moyenne': 'impact-faible',
    "Mineure": 'impact-aucun',
  };
  return <span className={'badge ' + (map[impact] || '')}>{impact}</span>;
}

function ModalVoir({ incident, onClose }) {
  const genererPDF = () => {
    const doc = new jsPDF();
    
    const finishPdf = (hasLogo = false, imgElement = null) => {
      // Header
      if (hasLogo && imgElement) {
        doc.addImage(imgElement, 'JPEG', 14, 15, 20, 20);
        doc.setFontSize(22);
        doc.setTextColor(31, 78, 121);
        doc.text('SNDE', 40, 24);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Direction de la Production', 40, 30);
        doc.text('Plateforme de Suivi des Incidents', 40, 35);
      } else {
        doc.setFontSize(22);
        doc.setTextColor(31, 78, 121);
        doc.text('SNDE', 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Direction de la Production', 14, 26);
        doc.text('Plateforme de Suivi des Incidents', 14, 32);
      }

      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('FICHE D\'INCIDENT', 105, 50, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Generee le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, 105, 56, { align: 'center' });

      // Details table
      const tableData = [
        ['Site', incident.site || '-'],
        ['Forage / Equipement', incident.forage_concerne || '-'],
        ['Type', incident.type_forage || '-'],
        ['Brigade', incident.brigade || '-'],
        ['Chef de brigade', incident.chef_brigade || '-'],
        ['Date de declaration', incident.date_declaration ? new Date(incident.date_declaration).toLocaleDateString('fr-FR') : '-'],
        ['Statut actuel', incident.statut || '-'],
        ['Impact sur production', incident.impact || '-'],
        ['Code GMAO', incident.code_gmao || '-'],
        ['Cause probable', incident.cause_probable || '-'],
      ];

      autoTable(doc, {
        startY: 62,
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          0: { fillColor: [247, 250, 252], fontStyle: 'bold', textColor: [113, 128, 150], cellWidth: 60 },
          1: { cellWidth: 130 }
        }
      });

      let yPos = doc.lastAutoTable.finalY + 15;

      // Description
      doc.setFontSize(12);
      doc.setTextColor(31, 78, 121);
      doc.setFont('helvetica', 'bold');
      doc.text('Description de la defaillance :', 14, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0);
      const splitDesc = doc.splitTextToSize(incident.description || 'Aucune description', 180);
      doc.text(splitDesc, 14, yPos + 7);
      
      yPos += 10 + (splitDesc.length * 5);

      // Action corrective
      if (incident.action_corrective) {
        doc.setFontSize(12);
        doc.setTextColor(31, 78, 121);
        doc.setFont('helvetica', 'bold');
        doc.text('Action corrective :', 14, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0);
        const splitAction = doc.splitTextToSize(incident.action_corrective, 180);
        doc.text(splitAction, 14, yPos + 7);
        
        yPos += 10 + (splitAction.length * 5);
      }

      // Pieces de rechange
      if (incident.pieces_rechange) {
        doc.setFontSize(12);
        doc.setTextColor(31, 78, 121);
        doc.setFont('helvetica', 'bold');
        doc.text('Pieces de rechange utilisees :', 14, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0);
        const splitPieces = doc.splitTextToSize(incident.pieces_rechange, 180);
        doc.text(splitPieces, 14, yPos + 7);
      }

      doc.save(`Incident_${incident.site}_${new Date().toISOString().slice(0,10)}.pdf`);
    };

    // Try loading logo
    const img = new Image();
    img.src = '/logo.jpg';
    img.onload = () => finishPdf(true, img);
    img.onerror = () => finishPdf(false, null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detail de l'incident</h3>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            ['Site', incident.site],
            ['Forage', incident.forage_concerne || '-'],
            ['Type forage', incident.type_forage || '-'],
            ['Brigade', incident.brigade],
            ['Chef de brigade', incident.chef_brigade || '-'],
            ['Date declaration', incident.date_declaration ? new Date(incident.date_declaration).toLocaleDateString('fr-FR') : '-'],
            ['Date cloture', incident.date_cloture ? new Date(incident.date_cloture).toLocaleDateString('fr-FR') : 'En cours'],
            ['Code GMAO', incident.code_gmao || '-'],
            ['Cause probable', incident.cause_probable || '-'],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#F7FAFC', padding: '8px 12px', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#718096' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Impact / Statut</div>
          {badgeImpact(incident.impact)}
          <span style={{ marginLeft: 8 }}>{badgeStatut(incident.statut)}</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Description</div>
          <div style={{ fontSize: 13, background: '#F7FAFC', padding: '10px 12px', borderRadius: 8 }}>
            {incident.description}
          </div>
        </div>
        {incident.action_corrective && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Action corrective</div>
            <div style={{ fontSize: 13, background: '#F0FFF4', padding: '10px 12px', borderRadius: 8 }}>
              {incident.action_corrective}
            </div>
          </div>
        )}
        {incident.observation && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Observation</div>
            <div style={{ fontSize: 13, background: '#F7FAFC', padding: '10px 12px', borderRadius: 8 }}>
              {incident.observation}
            </div>
          </div>
        )}
        {incident.photo_url && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Photo de l'incident</div>
            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${incident.photo_url}`} alt="Incident" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid #E2E8F0' }} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 10 }}>
          <button className="btn btn-primary" onClick={genererPDF}>Telecharger PDF</button>
          <button className="btn btn-outline" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

function ModalModifier({ incident, onClose, onUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [form, setForm] = useState({
    statut: incident.statut || 'En attente',
    action_corrective: incident.action_corrective || '',
    pieces_rechange: incident.pieces_rechange || '',
    observation: incident.observation || '',
    code_gmao: incident.code_gmao || '',
    impact: incident.impact || 'Moyenne',
    cause_probable: incident.cause_probable || 'Usure normale',
    chef_brigade: incident.chef_brigade || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateIncident(incident._id, form);
      onUpdate();
      onClose();
    } catch (e) {
      alert('Erreur lors de la mise a jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifier l'incident — {incident.site}</h3>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#EBF4FF', borderRadius: 8, fontSize: 12, color: '#1F4E79' }}>
          {incident.description?.slice(0, 80)}...
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}>
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Impact</label>
            <select value={form.impact} onChange={e => setForm(p => ({ ...p, impact: e.target.value }))}>
              {IMPACTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Cause probable</label>
            <select value={form.cause_probable} onChange={e => setForm(p => ({ ...p, cause_probable: e.target.value }))}>
              {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Chef de brigade</label>
            <input type="text" value={form.chef_brigade}
              onChange={e => setForm(p => ({ ...p, chef_brigade: e.target.value }))}
              placeholder="Nom du chef de brigade" />
          </div>
          <div className="form-group">
            <label>Code GMAO</label>
            <input type="text" value={form.code_gmao}
              onChange={e => setForm(p => ({ ...p, code_gmao: e.target.value }))} />
          </div>
          <div className="form-group full">
            <label>Action corrective</label>
            <textarea rows={3} value={form.action_corrective}
              onChange={e => setForm(p => ({ ...p, action_corrective: e.target.value }))}
              placeholder="Decrivez l'action realisee..." />
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
                value={form.pieces_rechange} 
                onChange={e => setForm(p => ({ ...p, pieces_rechange: e.target.value }))}
                placeholder="Marque, designation ou selectionnez ci-dessus" 
              />
            </div>
          </div>
          <div className="form-group full">
            <label>Observation</label>
            <textarea rows={2} value={form.observation}
              onChange={e => setForm(p => ({ ...p, observation: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalSupprimer({ incident, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteIncident(incident._id);
      onUpdate();
      onClose();
    } catch (e) {
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirmer la suppression</h3>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>
        <div style={{ padding: '16px 0' }}>
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: '#991B1B', marginBottom: 8 }}>Vous allez supprimer cet incident :</div>
            <div style={{ fontSize: 13, color: '#7F1D1D' }}>
              <div><strong>Site :</strong> {incident.site}</div>
              <div><strong>Forage :</strong> {incident.forage_concerne || '-'}</div>
              <div><strong>Brigade :</strong> {incident.brigade}</div>
              <div><strong>Description :</strong> {incident.description?.slice(0, 80)}...</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#718096' }}>
            Cette action est irreversible. L'incident sera definitivamente supprime de la base de donnees.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Oui, supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Incidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalVoir, setModalVoir] = useState(null);
  const [modalModifier, setModalModifier] = useState(null);
  const [modalSupprimer, setModalSupprimer] = useState(null);
  const [filtres, setFiltres] = useState({ statut: '', impact: '', search: '', brigade: '' });

  const isDirecteur = user?.role === 'directeur' || user?.role === 'admin';
  const canEdit = ['directeur', 'admin', 'chef_brigade'].includes(user?.role);
  const canDelete = ['directeur', 'admin'].includes(user?.role);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (filtres.statut) params.statut = filtres.statut;
      if (filtres.impact) params.impact = filtres.impact;
      if (filtres.search) params.search = filtres.search;
      if (filtres.brigade && isDirecteur) params.brigade = filtres.brigade;
      const res = await listIncidents(params);
      setIncidents(res.data.data);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filtres]);

  useEffect(() => { charger(); }, [charger]);

  const handleFiltreChange = (key, val) => {
    setFiltres(p => ({ ...p, [key]: val }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / 30);

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Incidents</h2>
          <p>{total.toLocaleString()} incident(s) trouve(s)</p>
        </div>
        {isDirecteur && (
          <div style={{ background: '#EBF4FF', border: '1px solid #2E75B6', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#1F4E79' }}>
            Mode Directeur — Modification et suppression actives
          </div>
        )}
      </div>

      <div className="filters-bar">
        <input placeholder="Rechercher (site, description...)"
          value={filtres.search}
          onChange={e => handleFiltreChange('search', e.target.value)}
          style={{ minWidth: 220 }} />
        <select value={filtres.statut} onChange={e => handleFiltreChange('statut', e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtres.impact} onChange={e => handleFiltreChange('impact', e.target.value)}>
          <option value="">Tous les impacts</option>
          {IMPACTS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        {isDirecteur && (
          <input placeholder="Filtrer par brigade..."
            value={filtres.brigade}
            onChange={e => handleFiltreChange('brigade', e.target.value)}
            style={{ minWidth: 180 }} />
        )}
        <button className="btn btn-outline btn-sm"
          onClick={() => { setFiltres({ statut: '', impact: '', search: '', brigade: '' }); setPage(1); }}>
          Reinitialiser
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ width: 36, height: 36, borderColor: '#1F4E79', borderTopColor: 'transparent', margin: '0 auto' }} />
          </div>
        ) : incidents.length === 0 ? (
          <div className="empty-state"><div className="icon">X</div><p>Aucun incident trouve</p></div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Site</th>
                    <th>Forage</th>
                    <th>Type de panne</th>
                    <th>Description</th>
                    <th>Impact</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(inc => {
                    const isOwner = user?.id === inc.declare_par;
                    const canEditThis = canEdit || (isOwner && inc.statut === 'En attente');
                    const canDeleteThis = canDelete || (isOwner && inc.statut === 'En attente');

                    return (
                      <tr key={inc._id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                          {inc.date_declaration ? new Date(inc.date_declaration).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td style={{ fontWeight: 600, color: '#1F4E79' }}>{inc.site}</td>
                        <td style={{ fontSize: 12, color: '#4A5568' }}>{inc.forage_concerne || '-'}</td>
                        <td style={{ fontSize: 12, fontWeight: 500 }}>{inc.type_defaillance || 'Autre'}</td>
                        <td style={{ maxWidth: 220 }}>
                          <span title={inc.description} style={{ fontSize: 13 }}>
                            {inc.description?.slice(0, 60)}{inc.description?.length > 60 ? '...' : ''}
                          </span>
                        </td>
                        <td>{badgeImpact(inc.impact)}</td>
                        <td>{badgeStatut(inc.statut)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: 11, padding: '4px 8px' }}
                              onClick={() => setModalVoir(inc)}
                              title="Voir le detail">
                              Voir
                            </button>
                            {canEditThis && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: 11, padding: '4px 8px', background: '#2E75B6' }}
                                onClick={() => setModalModifier(inc)}
                                title="Modifier l'incident">
                                Modifier
                              </button>
                            )}
                            {canDeleteThis && (
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ fontSize: 11, padding: '4px 8px' }}
                                onClick={() => setModalSupprimer(inc)}
                                title="Supprimer l'incident">
                                Supprimer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, alignItems: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  Precedent
                </button>
                <span style={{ fontSize: 13, color: '#718096' }}>Page {page} / {totalPages}</span>
                <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modalVoir && <ModalVoir incident={modalVoir} onClose={() => setModalVoir(null)} />}
      {modalModifier && <ModalModifier incident={modalModifier} onClose={() => setModalModifier(null)} onUpdate={charger} />}
      {modalSupprimer && <ModalSupprimer incident={modalSupprimer} onClose={() => setModalSupprimer(null)} onUpdate={charger} />}
    </Layout>
  );
}

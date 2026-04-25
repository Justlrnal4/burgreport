import type { Cote, GrandCru } from '@/types/burgreport';

const RED_DEFAULT = 'Historic Grand Cru climat with benchmark Pinot Noir pricing, producer variation, and vintage sensitivity.';
const WHITE_DEFAULT = 'Historic Grand Cru white Burgundy climat with high sensitivity to producer, vintage, and bottle condition.';

export const GRAND_CRUS: GrandCru[] = [
  { id: 1, slug: 'chambertin', name: 'Chambertin', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 13.0, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Armand Rousseau', 'Domaine Trapet', 'Domaine Rossignol-Trapet'] },
  { id: 2, slug: 'chambertin-clos-de-beze', name: 'Chambertin-Clos de Bèze', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 15.4, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Armand Rousseau', 'Drouhin-Laroze', 'Bruno Clair'] },
  { id: 3, slug: 'chapelle-chambertin', name: 'Chapelle-Chambertin', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 5.5, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Domaine Trapet', 'Rossignol-Trapet', 'Ponsot'] },
  { id: 4, slug: 'charmes-chambertin', name: 'Charmes-Chambertin', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 12.2, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Dujac', 'Domaine Arlaud', 'Claude Dugat'] },
  { id: 5, slug: 'griotte-chambertin', name: 'Griotte-Chambertin', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 2.7, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Ponsot', 'Domaine Fourrier', 'René Leclerc'] },
  { id: 6, slug: 'latricieres-chambertin', name: 'Latricières-Chambertin', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 7.0, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Domaine Leroy', 'Trapet', 'Camus'] },
  { id: 7, slug: 'mazis-chambertin', name: 'Mazis-Chambertin', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 9.1, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Domaine Faiveley', 'Bernard Dugat-Py', 'Armand Rousseau'] },
  { id: 8, slug: 'mazoyeres-chambertin', name: 'Mazoyères-Chambertin', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 1.8, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Domaine Taupenot-Merme', 'Camus', 'Perrot-Minot'] },
  { id: 9, slug: 'ruchottes-chambertin', name: 'Ruchottes-Chambertin', village: 'Gevrey-Chambertin', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 3.3, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Armand Rousseau', 'Mugneret-Gibourg', 'Georges Mugneret-Gibourg'] },
  { id: 10, slug: 'bonnes-mares', name: 'Bonnes Mares', village: 'Morey-St-Denis / Chambolle-Musigny', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 15.1, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Comte Georges de Vogüé', 'Dujac', 'Roumier'] },
  { id: 11, slug: 'clos-de-la-roche', name: 'Clos de la Roche', village: 'Morey-St-Denis', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 16.9, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Dujac', 'Ponsot', 'Armand Rousseau'] },
  { id: 12, slug: 'clos-de-tart', name: 'Clos de Tart', village: 'Morey-St-Denis', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 7.5, isMonopole: true, summary: 'Monopole Grand Cru of Morey-St-Denis with a distinctive pricing profile and high collector visibility.', keyProducers: ['Clos de Tart'] },
  { id: 13, slug: 'clos-des-lambrays', name: 'Clos des Lambrays', village: 'Morey-St-Denis', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 8.7, isMonopole: true, summary: 'Monopole Grand Cru known for estate-driven pricing and a distinct Morey-St-Denis market profile.', keyProducers: ['Domaine des Lambrays'] },
  { id: 14, slug: 'clos-saint-denis', name: 'Clos Saint-Denis', village: 'Morey-St-Denis', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 6.6, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Dujac', 'Lignier', 'Georges Lignier'] },
  { id: 15, slug: 'musigny', name: 'Musigny', village: 'Chambolle-Musigny', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 10.7, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Comte Georges de Vogüé', 'Roumier', 'Domaine Leroy'] },
  { id: 16, slug: 'clos-de-vougeot', name: 'Clos de Vougeot', village: 'Vougeot', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 50.6, isMonopole: false, summary: 'Large and producer-sensitive Grand Cru where market value depends heavily on parcel, domaine, and vintage.', keyProducers: ['Méo-Camuzet', 'Anne Gros', 'Domaine de la Vougeraie'] },
  { id: 17, slug: 'echezeaux', name: 'Échézeaux', village: 'Flagey-Échézeaux', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 37.7, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Domaine de la Romanée-Conti', 'Emmanuel Rouget', 'Mugneret-Gibourg'] },
  { id: 18, slug: 'grands-echezeaux', name: 'Grands Échézeaux', village: 'Flagey-Échézeaux', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 9.1, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Domaine de la Romanée-Conti', 'Mongeard-Mugneret', 'Joseph Drouhin'] },
  { id: 19, slug: 'la-grande-rue', name: 'La Grande Rue', village: 'Vosne-Romanée', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 1.6, isMonopole: true, summary: 'Rare Vosne-Romanée monopole with strong collector identity and limited market availability.', keyProducers: ['Domaine Lamarche'] },
  { id: 20, slug: 'la-romanee', name: 'La Romanée', village: 'Vosne-Romanée', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 0.85, isMonopole: true, summary: 'Tiny Vosne-Romanée monopole with extremely limited supply and highly sensitive pricing.', keyProducers: ['Liger-Belair'] },
  { id: 21, slug: 'la-tache', name: 'La Tâche', village: 'Vosne-Romanée', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 6.1, isMonopole: true, summary: 'Benchmark Vosne-Romanée monopole and one of the most visible global pricing references in Burgundy.', keyProducers: ['Domaine de la Romanée-Conti'] },
  { id: 22, slug: 'richebourg', name: 'Richebourg', village: 'Vosne-Romanée', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 8.0, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Domaine de la Romanée-Conti', 'Méo-Camuzet', 'Gros Frère et Sœur'] },
  { id: 23, slug: 'romanee-conti', name: 'Romanée-Conti', village: 'Vosne-Romanée', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 1.8, isMonopole: true, summary: 'Iconic Vosne-Romanée monopole with extreme scarcity and global benchmark pricing.', keyProducers: ['Domaine de la Romanée-Conti'] },
  { id: 24, slug: 'romanee-saint-vivant', name: 'Romanée-Saint-Vivant', village: 'Vosne-Romanée', cote: 'Côte de Nuits', color: 'Red', grape: 'Pinot Noir', sizeHa: 9.4, isMonopole: false, summary: RED_DEFAULT, keyProducers: ['Domaine de la Romanée-Conti', 'Domaine Leroy', 'Hudeles-Noëllat'] },
  { id: 25, slug: 'corton-red', name: 'Corton (red)', village: 'Aloxe-Corton', cote: 'Côte de Beaune', color: 'Red', grape: 'Pinot Noir', sizeHa: 97.0, isMonopole: false, summary: 'Large Côte de Beaune red Grand Cru with parcel and producer sensitivity.', keyProducers: ['Bouchard Père & Fils', 'Domaine de la Romanée-Conti', 'Domaine Faiveley'] },
  { id: 26, slug: 'corton-charlemagne', name: 'Corton-Charlemagne', village: 'Aloxe-Corton', cote: 'Côte de Beaune', color: 'White', grape: 'Chardonnay', sizeHa: 51.0, isMonopole: false, summary: WHITE_DEFAULT, keyProducers: ['Bonneau du Martray', 'Coche-Dury', 'Louis Latour'] },
  { id: 27, slug: 'charlemagne', name: 'Charlemagne', village: 'Aloxe-Corton', cote: 'Côte de Beaune', color: 'White', grape: 'Chardonnay', sizeHa: 3.1, isMonopole: false, summary: WHITE_DEFAULT, keyProducers: ['Bonneau du Martray', 'Domaine Leroy', 'Louis Latour'] },
  { id: 28, slug: 'batard-montrachet', name: 'Bâtard-Montrachet', village: 'Puligny/Chassagne', cote: 'Côte de Beaune', color: 'White', grape: 'Chardonnay', sizeHa: 11.9, isMonopole: false, summary: WHITE_DEFAULT, keyProducers: ['Leflaive', 'Ramonet', 'Domaine de la Vougeraie'] },
  { id: 29, slug: 'bienvenues-batard-montrachet', name: 'Bienvenues-Bâtard-Montrachet', village: 'Puligny-Montrachet', cote: 'Côte de Beaune', color: 'White', grape: 'Chardonnay', sizeHa: 3.7, isMonopole: false, summary: WHITE_DEFAULT, keyProducers: ['Leflaive', 'Ramonet', 'Paul Pernot'] },
  { id: 30, slug: 'chevalier-montrachet', name: 'Chevalier-Montrachet', village: 'Puligny-Montrachet', cote: 'Côte de Beaune', color: 'White', grape: 'Chardonnay', sizeHa: 7.3, isMonopole: false, summary: WHITE_DEFAULT, keyProducers: ['Leflaive', 'Bouchard Père & Fils', 'Domaine d’Auvenay'] },
  { id: 31, slug: 'criots-batard-montrachet', name: 'Criots-Bâtard-Montrachet', village: 'Chassagne-Montrachet', cote: 'Côte de Beaune', color: 'White', grape: 'Chardonnay', sizeHa: 1.6, isMonopole: false, summary: WHITE_DEFAULT, keyProducers: ['Ramonet', 'Blain-Gagnard', 'Hubert Lamy'] },
  { id: 32, slug: 'montrachet', name: 'Montrachet', village: 'Puligny/Chassagne', cote: 'Côte de Beaune', color: 'White', grape: 'Chardonnay', sizeHa: 8.0, isMonopole: false, summary: 'The benchmark white Burgundy Grand Cru with exceptional scarcity and producer-driven global pricing.', keyProducers: ['Domaine de la Romanée-Conti', 'Ramonet', 'Leflaive'] },
  { id: 33, slug: 'musigny-blanc', name: 'Musigny Blanc', village: 'Chambolle-Musigny', cote: 'Côte de Nuits', color: 'White', grape: 'Chardonnay', sizeHa: 0.65, isMonopole: false, summary: 'Rare white expression associated with Musigny; treat as a special case in data and pricing workflows.', keyProducers: ['Comte Georges de Vogüé'] }
];

export function getGrandCruBySlug(slug: string): GrandCru | undefined {
  return GRAND_CRUS.find((wine) => wine.slug === slug);
}

export function findGrandCruByName(name: string): GrandCru | undefined {
  const normalized = normalizeWineName(name);
  const alias = GRAND_CRU_ALIASES[normalized];
  return GRAND_CRUS.find((wine) => wine.slug === alias || normalizeWineName(wine.name) === normalized || normalizeWineName(wine.slug) === normalized);
}

export function relatedGrandCrus(target: GrandCru, limit = 4): GrandCru[] {
  return GRAND_CRUS.filter((wine) => wine.slug !== target.slug && (wine.village === target.village || wine.cote === target.cote)).slice(0, limit);
}

export function normalizeWineName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function coteForDisplay(cote: string | undefined): Cote | undefined {
  if (cote === 'Côte de Nuits' || cote === 'Cote de Nuits') return 'Côte de Nuits';
  if (cote === 'Côte de Beaune' || cote === 'Cote de Beaune') return 'Côte de Beaune';
  return undefined;
}

const GRAND_CRU_ALIASES: Record<string, string> = {
  'bonnes-mares': 'bonnes-mares',
  'clos-vougeot': 'clos-de-vougeot',
  'clos-de-vougeot': 'clos-de-vougeot',
  corton: 'corton-red',
  'corton-red': 'corton-red',
  'la-romanee-conti': 'romanee-conti',
  'romanee-conti': 'romanee-conti',
  'musigny-white': 'musigny-blanc',
  'musigny-blanc': 'musigny-blanc'
};

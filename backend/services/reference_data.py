import re
import unicodedata
from typing import Optional

GRAND_CRUS = [
    {"id": 1, "slug": "chambertin", "name": "Chambertin", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 13.0, "is_monopole": False, "aliases": ["Chambertin"]},
    {"id": 2, "slug": "chambertin-clos-de-beze", "name": "Chambertin-Clos de Bèze", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 15.4, "is_monopole": False, "aliases": ["Clos de Beze", "Clos de Bèze", "Chambertin Clos de Beze"]},
    {"id": 3, "slug": "chapelle-chambertin", "name": "Chapelle-Chambertin", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 5.5, "is_monopole": False, "aliases": ["Chapelle Chambertin"]},
    {"id": 4, "slug": "charmes-chambertin", "name": "Charmes-Chambertin", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 12.2, "is_monopole": False, "aliases": ["Charmes Chambertin"]},
    {"id": 5, "slug": "griotte-chambertin", "name": "Griotte-Chambertin", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 2.7, "is_monopole": False, "aliases": ["Griotte Chambertin"]},
    {"id": 6, "slug": "latricieres-chambertin", "name": "Latricières-Chambertin", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 7.0, "is_monopole": False, "aliases": ["Latricieres Chambertin", "Latricières Chambertin"]},
    {"id": 7, "slug": "mazis-chambertin", "name": "Mazis-Chambertin", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 9.1, "is_monopole": False, "aliases": ["Mazis Chambertin", "Mazy Chambertin"]},
    {"id": 8, "slug": "mazoyeres-chambertin", "name": "Mazoyères-Chambertin", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 1.8, "is_monopole": False, "aliases": ["Mazoyeres Chambertin", "Mazoyères Chambertin"]},
    {"id": 9, "slug": "ruchottes-chambertin", "name": "Ruchottes-Chambertin", "village": "Gevrey-Chambertin", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 3.3, "is_monopole": False, "aliases": ["Ruchottes Chambertin"]},
    {"id": 10, "slug": "bonnes-mares", "name": "Bonnes Mares", "village": "Morey-St-Denis / Chambolle-Musigny", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 15.1, "is_monopole": False, "aliases": ["Bonnes-Mares"]},
    {"id": 11, "slug": "clos-de-la-roche", "name": "Clos de la Roche", "village": "Morey-St-Denis", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 16.9, "is_monopole": False, "aliases": []},
    {"id": 12, "slug": "clos-de-tart", "name": "Clos de Tart", "village": "Morey-St-Denis", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 7.5, "is_monopole": True, "aliases": []},
    {"id": 13, "slug": "clos-des-lambrays", "name": "Clos des Lambrays", "village": "Morey-St-Denis", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 8.7, "is_monopole": True, "aliases": []},
    {"id": 14, "slug": "clos-saint-denis", "name": "Clos Saint-Denis", "village": "Morey-St-Denis", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 6.6, "is_monopole": False, "aliases": ["Clos St Denis", "Clos-Saint-Denis"]},
    {"id": 15, "slug": "musigny", "name": "Musigny", "village": "Chambolle-Musigny", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 10.7, "is_monopole": False, "aliases": []},
    {"id": 16, "slug": "clos-de-vougeot", "name": "Clos de Vougeot", "village": "Vougeot", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 50.6, "is_monopole": False, "aliases": ["Clos Vougeot"]},
    {"id": 17, "slug": "echezeaux", "name": "Échézeaux", "village": "Flagey-Échézeaux", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 37.7, "is_monopole": False, "aliases": ["Echezeaux"]},
    {"id": 18, "slug": "grands-echezeaux", "name": "Grands Échézeaux", "village": "Flagey-Échézeaux", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 9.1, "is_monopole": False, "aliases": ["Grands Echezeaux", "Grand Echezeaux"]},
    {"id": 19, "slug": "la-grande-rue", "name": "La Grande Rue", "village": "Vosne-Romanée", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 1.6, "is_monopole": True, "aliases": ["Grande Rue"]},
    {"id": 20, "slug": "la-romanee", "name": "La Romanée", "village": "Vosne-Romanée", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 0.85, "is_monopole": True, "aliases": ["La Romanee"]},
    {"id": 21, "slug": "la-tache", "name": "La Tâche", "village": "Vosne-Romanée", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 6.1, "is_monopole": True, "aliases": ["La Tache"]},
    {"id": 22, "slug": "richebourg", "name": "Richebourg", "village": "Vosne-Romanée", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 8.0, "is_monopole": False, "aliases": []},
    {"id": 23, "slug": "romanee-conti", "name": "Romanée-Conti", "village": "Vosne-Romanée", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 1.8, "is_monopole": True, "aliases": ["Romanee Conti", "Romanee-Conti", "La Romanée-Conti", "La Romanee Conti"]},
    {"id": 24, "slug": "romanee-saint-vivant", "name": "Romanée-Saint-Vivant", "village": "Vosne-Romanée", "cote": "Côte de Nuits", "color": "Red", "grape": "Pinot Noir", "size_ha": 9.4, "is_monopole": False, "aliases": ["Romanee Saint Vivant", "Romanée St Vivant"]},
    {"id": 25, "slug": "corton-red", "name": "Corton (red)", "village": "Aloxe-Corton", "cote": "Côte de Beaune", "color": "Red", "grape": "Pinot Noir", "size_ha": 97.0, "is_monopole": False, "aliases": ["Corton"]},
    {"id": 26, "slug": "corton-charlemagne", "name": "Corton-Charlemagne", "village": "Aloxe-Corton", "cote": "Côte de Beaune", "color": "White", "grape": "Chardonnay", "size_ha": 51.0, "is_monopole": False, "aliases": ["Corton Charlemagne"]},
    {"id": 27, "slug": "charlemagne", "name": "Charlemagne", "village": "Aloxe-Corton", "cote": "Côte de Beaune", "color": "White", "grape": "Chardonnay", "size_ha": 3.1, "is_monopole": False, "aliases": []},
    {"id": 28, "slug": "batard-montrachet", "name": "Bâtard-Montrachet", "village": "Puligny/Chassagne", "cote": "Côte de Beaune", "color": "White", "grape": "Chardonnay", "size_ha": 11.9, "is_monopole": False, "aliases": ["Batard Montrachet", "Bâtard Montrachet"]},
    {"id": 29, "slug": "bienvenues-batard-montrachet", "name": "Bienvenues-Bâtard-Montrachet", "village": "Puligny-Montrachet", "cote": "Côte de Beaune", "color": "White", "grape": "Chardonnay", "size_ha": 3.7, "is_monopole": False, "aliases": ["Bienvenues Batard Montrachet"]},
    {"id": 30, "slug": "chevalier-montrachet", "name": "Chevalier-Montrachet", "village": "Puligny-Montrachet", "cote": "Côte de Beaune", "color": "White", "grape": "Chardonnay", "size_ha": 7.3, "is_monopole": False, "aliases": ["Chevalier Montrachet"]},
    {"id": 31, "slug": "criots-batard-montrachet", "name": "Criots-Bâtard-Montrachet", "village": "Chassagne-Montrachet", "cote": "Côte de Beaune", "color": "White", "grape": "Chardonnay", "size_ha": 1.6, "is_monopole": False, "aliases": ["Criots Batard Montrachet"]},
    {"id": 32, "slug": "montrachet", "name": "Montrachet", "village": "Puligny/Chassagne", "cote": "Côte de Beaune", "color": "White", "grape": "Chardonnay", "size_ha": 8.0, "is_monopole": False, "aliases": []},
    {"id": 33, "slug": "musigny-blanc", "name": "Musigny Blanc", "village": "Chambolle-Musigny", "cote": "Côte de Nuits", "color": "White", "grape": "Chardonnay", "size_ha": 0.65, "is_monopole": False, "aliases": ["Musigny White"]},
]


def normalize_name(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value.lower())
    normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return normalized.strip("-")


def _index() -> dict[str, dict]:
    items: dict[str, dict] = {}
    for climat in GRAND_CRUS:
        for value in [climat["name"], climat["slug"], *climat.get("aliases", [])]:
            items[normalize_name(str(value))] = climat
    return items


GRAND_CRU_INDEX = _index()


def find_climat(name: str) -> Optional[dict]:
    return GRAND_CRU_INDEX.get(normalize_name(name))


def list_climats() -> list[dict]:
    return [dict(climat) for climat in GRAND_CRUS]

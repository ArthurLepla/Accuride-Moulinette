import { SankeyData, ProcessedData, TreemapData } from "@/types/sankey";
import { getColorByCategory } from "@/lib/utils";

interface ExcelRow {
  Secteur: string;
  Atelier: string;
  Machine: string;
  Type: string;
  [key: string]: any;
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
  value?: number;
}

export function processExcelData(data: ExcelRow[]): ProcessedData {
  // Préparation des données
  const nodes: Map<string, { id: string; name: string; category: 'machine' | 'sector' | 'workshop' }> = new Map();
  const links: Map<string, { source: string; target: string; value: number }> = new Map();
  
  // Compteurs pour le résumé
  const summary = {
    totalRows: data.length,
    totalSecteurs: new Set<string>(),
    totalAteliers: new Set<string>(),
    totalMachines: new Set<string>(),
  };

  // Fonction pour nettoyer les noms et générer des IDs valides
  const cleanName = (name: string): string => {
    return name.trim().replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '');
  };

  // Fonction pour générer un ID unique et valide
  const generateValidId = (prefix: string, name: string): string => {
    const cleanedName = cleanName(name);
    return `${prefix}${cleanedName.toLowerCase().replace(/\s+/g, '_')}`;
  };

  // Traitement des données
  data.forEach((row) => {
    const { Secteur, Atelier, Machine } = row;

    if (!Secteur && !Machine) return; // Ignorer les lignes sans secteur ni machine

    // Ajout des nœuds avec des IDs valides
    if (Secteur) {
      const cleanedSecteur = cleanName(Secteur);
      const sectorId = generateValidId('s_', cleanedSecteur);
      if (!nodes.has(sectorId)) {
        nodes.set(sectorId, { 
          id: sectorId, 
          name: cleanedSecteur, 
          category: 'sector' as const
        });
        summary.totalSecteurs.add(cleanedSecteur);
      }
    }

    if (Atelier) {
      const cleanedAtelier = cleanName(Atelier);
      const workshopId = generateValidId('w_', cleanedAtelier);
      if (!nodes.has(workshopId)) {
        nodes.set(workshopId, { 
          id: workshopId, 
          name: cleanedAtelier, 
          category: 'workshop' as const
        });
        summary.totalAteliers.add(cleanedAtelier);
      }
    }

    if (Machine) {
      const cleanedMachine = cleanName(Machine);
      const machineId = generateValidId('m_', cleanedMachine);
      if (!nodes.has(machineId)) {
        nodes.set(machineId, { 
          id: machineId, 
          name: cleanedMachine, 
          category: 'machine' as const
        });
        summary.totalMachines.add(cleanedMachine);
      }
    }

    // Ajout des liens avec vérification des IDs
    if (Secteur && Machine) {
      const sectorId = generateValidId('s_', cleanName(Secteur));
      const machineId = generateValidId('m_', cleanName(Machine));

      if (!Atelier) {
        // Lien direct Secteur -> Machine
        const linkId = `${sectorId}-${machineId}`;
        if (!links.has(linkId)) {
          links.set(linkId, {
            source: sectorId,
            target: machineId,
            value: 1
          });
        } else {
          const link = links.get(linkId)!;
          link.value += 1;
        }
      } else {
        const workshopId = generateValidId('w_', cleanName(Atelier));
        
        // Lien Secteur -> Atelier
        const sectorWorkshopLinkId = `${sectorId}-${workshopId}`;
        if (!links.has(sectorWorkshopLinkId)) {
          links.set(sectorWorkshopLinkId, {
            source: sectorId,
            target: workshopId,
            value: 1
          });
        } else {
          const link = links.get(sectorWorkshopLinkId)!;
          link.value += 1;
        }

        // Lien Atelier -> Machine
        const workshopMachineLinkId = `${workshopId}-${machineId}`;
        if (!links.has(workshopMachineLinkId)) {
          links.set(workshopMachineLinkId, {
            source: workshopId,
            target: machineId,
            value: 1
          });
        } else {
          const link = links.get(workshopMachineLinkId)!;
          link.value += 1;
        }
      }
    }
  });

  // Conversion des Maps en tableaux pour le format SankeyData
  const sankeyData: SankeyData = {
    nodes: Array.from(nodes.values()).map(node => ({
      ...node,
      itemStyle: {
        color: getColorByCategory(node.category)
      }
    })),
    links: Array.from(links.values()).map(link => ({
      ...link,
      lineStyle: {
        color: 'source',
        opacity: 0.4
      }
    }))
  };

  // Vérification de la validité des liens
  sankeyData.links = sankeyData.links.filter(link => {
    const sourceExists = sankeyData.nodes.some(node => node.id === link.source);
    const targetExists = sankeyData.nodes.some(node => node.id === link.target);
    return sourceExists && targetExists && link.source !== link.target;
  });

  // Construction des données pour le treemap
  const treeData = buildTreeData(sankeyData);
  const treemapData = buildTreemapData(sankeyData);

  return {
    sankeyData,
    treeData,
    treemapData,
    summary: {
      totalRows: summary.totalRows,
      totalSecteurs: summary.totalSecteurs.size,
      totalAteliers: summary.totalAteliers.size,
      totalMachines: summary.totalMachines.size,
    },
  };
}

function buildTreeData(sankeyData: SankeyData): TreeNode {
  const root: TreeNode = {
    name: "Entreprise",
    children: [],
  };

  // Grouper par secteur
  const sectors = new Map<string, TreeNode>();
  sankeyData.nodes.forEach((node) => {
    if (node.category === "sector") {
      sectors.set(node.id, {
        name: node.name,
        children: [],
      });
    }
  });

  // Ajouter les ateliers et machines
  sankeyData.links.forEach((link) => {
    const sourceNode = sankeyData.nodes.find((n) => n.id === link.source);
    const targetNode = sankeyData.nodes.find((n) => n.id === link.target);

    if (sourceNode?.category === "sector") {
      const sector = sectors.get(sourceNode.id);
      if (sector) {
        if (targetNode?.category === "workshop") {
          // Cas Secteur -> Atelier
          const workshop: TreeNode = {
            name: targetNode.name,
            children: [],
          };

          // Ajouter les machines liées à cet atelier
          sankeyData.links
            .filter((l) => l.source === targetNode.id)
            .forEach((l) => {
              const machine = sankeyData.nodes.find((n) => n.id === l.target);
              if (machine) {
                workshop.children?.push({
                  name: machine.name,
                  value: l.value,
                });
              }
            });

          sector.children?.push(workshop);
        } else if (targetNode?.category === "machine") {
          // Cas Secteur -> Machine (direct)
          sector.children?.push({
            name: targetNode.name,
            value: link.value,
          });
        }
      }
    }
  });

  root.children = Array.from(sectors.values());
  return root;
}

function buildTreemapData(sankeyData: SankeyData): TreemapData[] {
  const sectors = new Map<string, { name: string; value: number }>();
  
  sankeyData.links.forEach(link => {
    const sourceNode = sankeyData.nodes.find(node => node.id === link.source);
    if (sourceNode?.category === 'sector') {
      if (!sectors.has(sourceNode.id)) {
        sectors.set(sourceNode.id, { name: sourceNode.name, value: 0 });
      }
      const sector = sectors.get(sourceNode.id)!;
      sector.value += link.value;
    }
  });

  return Array.from(sectors.values());
}

export function validateExcelData(data: any[]): string[] {
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push("Le fichier Excel est vide");
    return errors;
  }

  // Vérifier les colonnes requises
  const requiredColumns = ["Machine", "Secteur", "Type"];
  const headers = Object.keys(data[0]);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    errors.push(`Colonnes manquantes : ${missingColumns.join(", ")}`);
    return errors;
  }

  // Vérifier chaque ligne
  const invalidRows: number[] = [];
  data.forEach((row, index) => {
    const lineNumber = index + 2; // +2 car Excel commence à 1 et la première ligne est l'en-tête
    const missingFields = [];

    if (!row.Machine || row.Machine.toString().trim() === "") {
      missingFields.push("Machine");
    }
    if (!row.Secteur || row.Secteur.toString().trim() === "") {
      missingFields.push("Secteur");
    }
    if (!row.Type || row.Type.toString().trim() === "") {
      missingFields.push("Type");
    } else {
      const validTypes = ["Elec", "Gaz", "Air", "Eau"];
      if (!validTypes.includes(row.Type)) {
        errors.push(`⚠️ Ligne ${lineNumber} : Type invalide "${row.Type}". Les types valides sont : ${validTypes.join(", ")}`);
      }
    }

    if (missingFields.length > 0) {
      invalidRows.push(lineNumber);
      errors.push(`⚠️ Ligne ${lineNumber} : ${missingFields.join(", ")} manquant(s)`);
    }
  });

  if (invalidRows.length > 0) {
    errors.unshift(`ℹ️ ${invalidRows.length} ligne(s) avec des données manquantes seront ignorées.`);
    const validRows = data.length - invalidRows.length;
    if (validRows > 0) {
      errors.push(`✅ ${validRows} ligne(s) valides seront traitées.`);
    }
  }

  return errors;
}

export function previewImportStructure(data: ExcelRow[]) {
  console.log('\n=== Structure qui sera créée dans l\'IIH ===');
  
  // Grouper par secteur
  const sectors = new Map<string, {
    workshops: Map<string, string[]>;
    machines: string[];
  }>();

  data.forEach(row => {
    const { Secteur, Atelier, Machine } = row;
    if (!Secteur) return;

    if (!sectors.has(Secteur)) {
      sectors.set(Secteur, {
        workshops: new Map(),
        machines: []
      });
    }

    const sector = sectors.get(Secteur)!;
    
    if (Atelier) {
      if (!sector.workshops.has(Atelier)) {
        sector.workshops.set(Atelier, []);
      }
      if (Machine) {
        sector.workshops.get(Atelier)!.push(Machine);
      }
    } else if (Machine) {
      sector.machines.push(Machine);
    }
  });

  // Afficher la structure
  let totalAssets = 0;
  let totalVariables = 0;
  let totalAggregations = 0;

  console.log('\nStructure hiérarchique qui sera créée:');
  for (const [sectorName, sectorData] of Array.from(sectors.entries())) {
    console.log(`\n🏭 Secteur: ${sectorName}`);
    totalAssets++; // Compter le secteur
    
    if (sectorData.machines.length > 0) {
      console.log('  └─ Machines directes:');
      sectorData.machines.forEach((machine: string) => {
        console.log(`     └─ 🔧 ${machine}`);
        console.log('        └─ 📊 Variable: Consommation (kW)');
        console.log('           └─ 📈 Agrégations: 5min, 1h, 4h, 8h, 24h');
        totalAssets++; // Compter la machine
        totalVariables++;
        totalAggregations += 5; // 5 agrégations par variable
      });
    }

    if (sectorData.workshops.size > 0) {
      console.log('  └─ Ateliers:');
      for (const [workshop, machines] of Array.from(sectorData.workshops.entries())) {
        console.log(`     └─ 🏢 ${workshop}`);
        totalAssets++; // Compter l'atelier
        machines.forEach((machine: string) => {
          console.log(`        └─ 🔧 ${machine}`);
          console.log('           └─ 📊 Variable: Consommation (kW)');
          console.log('              └─ 📈 Agrégations: 5min, 1h, 4h, 8h, 24h');
          totalAssets++; // Compter la machine
          totalVariables++;
          totalAggregations += 5; // 5 agrégations par variable
        });
      }
    }
  }

  console.log('\n=== Résumé ===');
  console.log(`Total des assets à créer: ${totalAssets}`);
  console.log(`Total des variables à créer: ${totalVariables}`);
  console.log(`Total des agrégations à créer: ${totalAggregations}`);
  console.log('\nCliquez sur "Importer" pour procéder à la création.');

  return sectors;
} 
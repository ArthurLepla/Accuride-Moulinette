"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

interface DataTableProps {
  data: any[];
}

export function DataTable({ data }: DataTableProps) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  // Filtrage des données
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Barre de recherche et pagination */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Précédent
          </button>
          <span className="text-slate-600 dark:text-slate-400">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300"
                  >
                    {row[header]?.toString() || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info pagination */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Affichage de {Math.min(filteredData.length, startIndex + 1)} à{" "}
        {Math.min(filteredData.length, startIndex + itemsPerPage)} sur {filteredData.length} entrées
      </div>
    </div>
  );
} 
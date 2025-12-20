import { useState, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { TabNavigation } from "@/components/dashboard/TabNavigation";
import { Filters } from "@/components/dashboard/Filters";
import { IndicatorsGrid } from "@/components/dashboard/IndicatorsGrid";
import { DataTable } from "@/components/dashboard/DataTable";
import { TABS_CONFIG } from "@/config/tabs";
import { useHealthData } from "@/hooks/useHealthData";
import { FilterState } from "@/types/health";
import { generatePDF } from "@/utils/pdfExport";

const INITIAL_FILTERS: FilterState = {
  equipe: [],
  microarea: [],
  statusBoasPraticas: [],
  statusVacinas: [],
  prioridade: [],
  quadrimestre: [],
  searchName: "",
};

const Index = () => {
  const [activeTabId, setActiveTabId] = useState(TABS_CONFIG[0].id);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const activeTab = TABS_CONFIG.find((t) => t.id === activeTabId) || TABS_CONFIG[0];
  const { data, loading, error, filterOptions, indicators, headers } = useHealthData(activeTab, filters);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSearchNameChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchName: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setFilters(INITIAL_FILTERS);
    setSortColumn(null);
    setSortDirection(null);
  }, []);

  const handleSortChange = useCallback((column: string | null, direction: "asc" | "desc" | null) => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  const handleExportPDF = useCallback(() => {
    generatePDF(activeTab.label, data, indicators, filters, headers, sortColumn, sortDirection);
  }, [activeTab.label, data, indicators, filters, headers, sortColumn, sortDirection]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <TabNavigation
          tabs={TABS_CONFIG}
          activeTab={activeTabId}
          onTabChange={handleTabChange}
        />

        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onExportPDF={handleExportPDF}
          activeTabId={activeTabId}
          options={filterOptions}
        />

        <IndicatorsGrid
          indicators={indicators}
          loading={loading}
          error={error}
          totalRecords={data.length}
        />

        {!loading && !error && data.length > 0 && (
          <DataTable 
            data={data} 
            headers={headers} 
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            searchName={filters.searchName}
            onSearchNameChange={handleSearchNameChange}
            selectedEquipes={filters.equipe}
          />
        )}
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Secretaria Municipal de Saúde de Varjota - {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;

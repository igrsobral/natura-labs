"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useUIStore } from "@/store";
import { DashboardHeader } from "@/features/dashboard";
import { LazyResponsiveChartContainer } from "@/features/charts/components/LazyChartContainer";
import { EmptyState, DashboardSkipLinks } from "@/shared/components";
import { Container, LoadingSpinner, SidebarProvider } from "@/components/ui";
import { LazyTableContainer } from "@/features/tables";
import LazyAIAssistant from "@/features/ai-assistant/components/LazyAIAssistant";
import { useInitializationStatus } from "@/components/DataInitializer";
import { AppSidebar } from "@/components/app-sidebar";

export default function Page() {
  const activeTab = useUIStore(state => state.uiState.activeTab);
  const setActiveTab = useUIStore(state => state.setActiveTab);
  const { isLoading, hasData } = useInitializationStatus();

  const renderActiveContent = () => {
    if (isLoading) {
      return (
        <div
          className="flex items-center justify-center py-12"
          role="status"
          aria-live="polite"
        >
          <LoadingSpinner size="lg" ariaLabel="Loading dashboard data" />
          <div className="ml-4">Loading sales data...</div>
        </div>
      );
    }

    if (!hasData && !isLoading) {
      return (
        <EmptyState
          title="No data available"
          description="Unable to load sales data. Please try refreshing the page."
        />
      );
    }

    switch (activeTab) {
      case "charts":
        return (
          <div className="space-y-6 mt-4">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold  mb-1">
                Sales Data Visualization
              </h2>
              <p className="text-lg text-muted-foreground">
                Interactive charts with advanced analytics and comparison modes
              </p>
            </div>

            <div className="w-full">
              <LazyResponsiveChartContainer
                title=""
                showControls={true}
                showFormulas={true}
                minHeight={400}
                maxHeight={600}
              />
            </div>
          </div>
        );

      case "tables":
        return (
          <div className="space-y-6 mt-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold  mb-1">
                  Sales Data Table
                </h2>
                <p className="text-sm text-gray-500">
                  Filterable pivot table with totals
                </p>
              </div>
            </div>

            <div className="w-full">
              <LazyTableContainer />
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold  mb-1 mt-4">
                  BrandAI Assistant
                </h2>
                <p className="text-sm text-gray-500">
                  Mock AI interface for data insights
                </p>
              </div>
            </div>

            <div className="w-full max-w-none">
              <LazyAIAssistant />
            </div>
          </div>
        );

      default:
        return (
          <EmptyState
            title="Feature not available"
            description="This feature is currently under development."
          />
        );
    }
  };
  return (
    <>
      <DashboardSkipLinks />
      <DashboardLayout>
        <SidebarProvider>
          <AppSidebar />

          <Container>
            <div id="navigation">
              <DashboardHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
            <main id="main-content" role="main">
              <div id="dashboard-content">{renderActiveContent()}</div>
            </main>
          </Container>
        </SidebarProvider>
      </DashboardLayout>
    </>
  );
}

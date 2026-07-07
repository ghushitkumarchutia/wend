/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StatsBar } from '@/components/shared/stats-bar';
import { TemplateDirectory } from '@/features/templates/template-directory';

export const Route = createFileRoute('/_authenticated/templates/')({
  component: TemplatesDirectoryPage,
});

function TemplatesDirectoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>
      
      <StatsBar />
      <TemplateDirectory />
    </div>
  );
}

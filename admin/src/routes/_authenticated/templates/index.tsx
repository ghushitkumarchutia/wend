/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/templates/')({
  component: TemplatesDirectory,
});

function TemplatesDirectory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <Button>
          New Template
        </Button>
      </div>
      <div className="rounded-md border bg-white p-8 text-center text-gray-500 shadow-sm">
        Template directory will go here.
      </div>
    </div>
  );
}

import { useTemplateFormStore } from '@/stores/template-form-store';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateGeneralInfo } from './template-general-info';
import { TemplateMetadata } from './template-metadata';
import { TemplateBudgetBreakdown } from './template-budget-breakdown';
import { TemplateItineraryBuilder } from './template-itinerary-builder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { Save, ChevronLeft } from 'lucide-react';
import type { Template } from '@/types/models';

interface Props {
  onSave: (data: Partial<Template>) => void;
  isSaving: boolean;
}

export function TemplateForm({ onSave, isSaving }: Props) {
  const { data, isDirty } = useTemplateFormStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <Link 
            to="/templates" 
            className={buttonVariants({ variant: 'ghost', size: 'sm', className: '-ml-3 text-muted-foreground' })}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            {(data as Template).id ? 'Edit Template' : 'New Template'}
          </h2>
          <Button onClick={() => onSave(data)} disabled={!isDirty || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="budget">Budget Breakdown</TabsTrigger>
          <TabsTrigger value="itinerary" disabled={!(data as Template).id}>Itinerary</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent>
              <TabsContent value="general" className="m-0">
                <TemplateGeneralInfo />
              </TabsContent>
              <TabsContent value="metadata" className="m-0">
                <TemplateMetadata />
              </TabsContent>
              <TabsContent value="budget" className="m-0">
                <TemplateBudgetBreakdown />
              </TabsContent>
              <TabsContent value="itinerary" className="m-0">
                {(data as Template).id ? <TemplateItineraryBuilder templateId={(data as Template).id!} /> : null}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}

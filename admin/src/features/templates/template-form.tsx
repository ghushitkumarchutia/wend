import { useTemplateFormStore } from '@/stores/template-form-store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateGeneralInfo } from './template-general-info';
import { TemplateMetadata } from './template-metadata';
import { TemplateBudgetBreakdown } from './template-budget-breakdown';
import { TemplateItineraryBuilder } from './template-itinerary-builder';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto font-manrope pb-24">
      <div className="flex flex-col space-y-4 md:space-y-6">
        <div>
          <Link 
            to="/templates" 
            className="inline-flex items-center text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" strokeWidth={2.5} />
            Back to Templates
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 font-syne">
            {(data as Template).id ? 'Edit Template' : 'New Template'}
          </h2>
          <Button 
            onClick={() => onSave(data)} 
            disabled={!isDirty || isSaving}
            className="rounded-full h-10 md:h-11 px-5 md:px-6 font-semibold shadow-md transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
              boxShadow: `
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
                0 6px 16px -2px rgba(16, 185, 129, 0.45),
                0 3px 6px 0 rgba(0, 0, 0, 0.12)
              `,
            }}
          >
            <Save className="mr-2 h-4 w-4 md:h-4.5 md:w-4.5" />
            <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="inline-flex h-auto md:h-14 items-center justify-center rounded-2xl md:rounded-full bg-[#F5F5F7] p-1.5 md:p-2 w-full md:w-auto overflow-x-auto shadow-inner border border-black/5">
          <TabsTrigger 
            value="general" 
            className="rounded-xl md:rounded-full px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-black/5 flex-1"
          >
            General Info
          </TabsTrigger>
          <TabsTrigger 
            value="metadata" 
            className="rounded-xl md:rounded-full px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-black/5 flex-1"
          >
            Metadata
          </TabsTrigger>
          <TabsTrigger 
            value="budget" 
            className="rounded-xl md:rounded-full px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-black/5 flex-1"
          >
            Budget Breakdown
          </TabsTrigger>
          <TabsTrigger 
            value="itinerary" 
            disabled={!(data as Template).id}
            className="rounded-xl md:rounded-full px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-black/5 flex-1 disabled:opacity-40"
          >
            Itinerary
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-8">
          <Card className="rounded-[24px] md:rounded-[32px] border-neutral-200/60 shadow-xl bg-white overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <TabsContent value="general" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
                <TemplateGeneralInfo />
              </TabsContent>
              <TabsContent value="metadata" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
                <TemplateMetadata />
              </TabsContent>
              <TabsContent value="budget" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
                <TemplateBudgetBreakdown />
              </TabsContent>
              <TabsContent value="itinerary" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
                {(data as Template).id ? <TemplateItineraryBuilder templateId={(data as Template).id!} /> : null}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}

import { useTemplateFormStore } from '@/stores/template-form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function TemplateGeneralInfo() {
  const data = useTemplateFormStore((state) => state.data);
  const updateGeneralInfo = useTemplateFormStore((state) => state.updateGeneralInfo);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. 7 Days in Kyoto"
          value={data.title || ''}
          onChange={(e) => updateGeneralInfo({ title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          placeholder="e.g. Kyoto, Japan"
          value={data.destination || ''}
          onChange={(e) => updateGeneralInfo({ destination: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Write a brief overview of the trip..."
          className="min-h-[120px]"
          value={data.description || ''}
          onChange={(e) => updateGeneralInfo({ description: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="coverUrl">Cover Image URL</Label>
        <Input
          id="coverUrl"
          placeholder="https://..."
          value={data.coverImageUrl || ''}
          onChange={(e) => updateGeneralInfo({ coverImageUrl: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">In a full implementation, this would be an S3 image uploader.</p>
      </div>
    </div>
  );
}

import { useTemplateFormStore } from '@/stores/template-form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TemplateVisibility, DifficultyLevel } from '@/types/models';

export function TemplateMetadata() {
  const data = useTemplateFormStore((state) => state.data);
  const updateMetadata = useTemplateFormStore((state) => state.updateMetadata);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={data.visibility}
            onValueChange={(val: string | null) => val && updateMetadata({ visibility: val as TemplateVisibility })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={data.difficultyLevel || ''}
            onValueChange={(val: string | null) => val && updateMetadata({ difficultyLevel: val as DifficultyLevel })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="challenging">Challenging</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minGroup">Min Group Size</Label>
          <Input
            id="minGroup"
            type="number"
            min={1}
            value={data.recommendedGroupSizeMin || ''}
            onChange={(e) => updateMetadata({ recommendedGroupSizeMin: parseInt(e.target.value, 10) || null })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxGroup">Max Group Size</Label>
          <Input
            id="maxGroup"
            type="number"
            min={1}
            value={data.recommendedGroupSizeMax || ''}
            onChange={(e) => updateMetadata({ recommendedGroupSizeMax: parseInt(e.target.value, 10) || null })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categories">Categories (comma separated)</Label>
        <Input
          id="categories"
          placeholder="e.g. Nature, Adventure, Cultural"
          value={data.categories?.join(', ') || ''}
          onChange={(e) => {
            const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
            updateMetadata({ categories: arr });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bestSeason">Best Seasons (comma separated)</Label>
        <Input
          id="bestSeason"
          placeholder="e.g. Spring, Autumn"
          value={data.bestSeason?.join(', ') || ''}
          onChange={(e) => {
            const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
            updateMetadata({ bestSeason: arr });
          }}
        />
      </div>
    </div>
  );
}

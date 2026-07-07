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
import { TemplateVisibility, TemplateDifficulty, TemplateSeason } from '@/types/enums';

export function TemplateMetadata() {
  const data = useTemplateFormStore((state) => state.data);
  const updateMetadata = useTemplateFormStore((state) => state.updateMetadata);

  const toggleSeason = (season: string) => {
    const current = data.bestSeason ?? [];
    const updated = current.includes(season)
      ? current.filter((s) => s !== season)
      : [...current, season];
    updateMetadata({ bestSeason: updated.length > 0 ? updated : null });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={data.visibility}
            onValueChange={(val) =>
              val && updateMetadata({ visibility: val as (typeof TemplateVisibility)[number] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              {TemplateVisibility.map((v) => (
                <SelectItem key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={data.difficultyLevel ?? ''}
            onValueChange={(val) =>
              val && updateMetadata({ difficultyLevel: val as (typeof TemplateDifficulty)[number] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {TemplateDifficulty.map((d) => (
                <SelectItem key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </SelectItem>
              ))}
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
            value={data.recommendedGroupSizeMin ?? ''}
            onChange={(e) =>
              updateMetadata({ recommendedGroupSizeMin: parseInt(e.target.value, 10) || null })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxGroup">Max Group Size</Label>
          <Input
            id="maxGroup"
            type="number"
            min={1}
            value={data.recommendedGroupSizeMax ?? ''}
            onChange={(e) =>
              updateMetadata({ recommendedGroupSizeMax: parseInt(e.target.value, 10) || null })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categories">Categories (comma separated)</Label>
        <Input
          id="categories"
          placeholder="e.g. Nature, Adventure, Cultural"
          value={data.categories?.join(', ') ?? ''}
          onChange={(e) => {
            const arr = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            updateMetadata({ categories: arr });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Best Seasons</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Select the recommended travel seasons for this template.
        </p>
        <div className="flex flex-wrap gap-2">
          {TemplateSeason.map((season) => {
            const isActive = data.bestSeason?.includes(season) ?? false;
            return (
              <button
                key={season}
                type="button"
                onClick={() => toggleSeason(season)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
    updateMetadata({ bestSeason: updated.length > 0 ? updated : undefined });
  };

  const inputClass = "bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5 md:h-11 px-4 text-sm font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 shadow-2xs";
  const labelClass = "text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="visibility" className={labelClass}>Visibility</Label>
          <Select
            value={data.visibility}
            onValueChange={(val) =>
              val && updateMetadata({ visibility: val as (typeof TemplateVisibility)[number] })
            }
          >
            <SelectTrigger className="bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5! md:h-11! px-4 text-sm font-manrope font-semibold text-neutral-900 transition-all duration-200 w-full cursor-pointer! shadow-2xs">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl font-manrope">
              {TemplateVisibility.map((v) => (
                <SelectItem key={v} value={v} className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="difficulty" className={labelClass}>Difficulty Level</Label>
          <Select
            value={data.difficultyLevel ?? ''}
            onValueChange={(val) =>
              val && updateMetadata({ difficultyLevel: val as (typeof TemplateDifficulty)[number] })
            }
          >
            <SelectTrigger className="bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5! md:h-11! px-4 text-sm font-manrope font-semibold text-neutral-900 transition-all duration-200 w-full cursor-pointer! shadow-2xs">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl font-manrope">
              {TemplateDifficulty.map((d) => (
                <SelectItem key={d} value={d} className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minGroup" className={labelClass}>Min Group Size</Label>
          <Input
            id="minGroup"
            type="number"
            min={1}
            value={data.recommendedGroupSizeMin ?? ''}
            onChange={(e) =>
              updateMetadata({ recommendedGroupSizeMin: parseInt(e.target.value, 10) || undefined })
            }
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxGroup" className={labelClass}>Max Group Size</Label>
          <Input
            id="maxGroup"
            type="number"
            min={1}
            value={data.recommendedGroupSizeMax ?? ''}
            onChange={(e) =>
              updateMetadata({ recommendedGroupSizeMax: parseInt(e.target.value, 10) || undefined })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categories" className={labelClass}>Categories (comma separated)</Label>
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
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className={labelClass}>Best Seasons</Label>
        <p className="text-[13px] text-neutral-500 font-manrope mb-1">
          Select the recommended travel seasons for this template.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {TemplateSeason.map((season) => {
            const isActive = data.bestSeason?.includes(season) ?? false;
            return (
              <button
                key={season}
                type="button"
                onClick={() => toggleSeason(season)}
                className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-200 shadow-sm ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
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

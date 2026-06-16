import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ExplorePage } from '@/features/explore/explore-page';
import { TemplatePreviewModal } from '@/features/explore/template-preview-modal';

export const Route = createFileRoute('/explore/templates/$templateId')({
  component: TemplateDeepLinkPage,
});

function TemplateDeepLinkPage() {
  const { templateId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <div className="relative h-full">
      <ExplorePage />
      <TemplatePreviewModal
        templateId={templateId}
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            navigate({ to: '/explore' });
          }
        }}
      />
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import type { TemplateListResponse } from '@/types/api';
import { TemplateTableRow } from './template-table-row';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function TemplateDirectory() {
  const { data, isLoading, error } = useQuery<TemplateListResponse>({
    queryKey: ['templates'],
    queryFn: () => fetcher('/admin/templates'),
  });

  const handleEdit = (id: string) => {
    console.log('Edit', id);
  };

  const handleDuplicate = async (id: string) => {
    console.log('Duplicate', id);
  };

  const handleDelete = async (id: string) => {
    console.log('Delete', id);
  };

  const handleChangeVisibility = async (id: string, current: string) => {
    console.log('Change visibility', id, current);
  };

  if (error) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-8 text-center text-destructive">
        Failed to load templates. Please try again later.
      </div>
    );
  }

  const templates = data?.data || [];

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Clones</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[80px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[40px]" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No templates found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TemplateTableRow
                key={template.id}
                template={template}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onChangeVisibility={handleChangeVisibility}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

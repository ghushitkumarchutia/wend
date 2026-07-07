import type { Template } from '@/types/models';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Copy, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  template: Template;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeVisibility: (id: string, current: string) => void;
}

export function TemplateTableRow({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onChangeVisibility,
}: Props) {
  const getBadgeVariant = (visibility: string) => {
    switch (visibility) {
      case 'published':
        return 'default';
      case 'featured':
        return 'default';
      case 'hidden':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getBadgeClass = (visibility: string) => {
    if (visibility === 'featured') return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    if (visibility === 'published') return 'bg-green-100 text-green-800 hover:bg-green-100';
    return '';
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{template.title}</TableCell>
      <TableCell>{template.destination}</TableCell>
      <TableCell>
        <Badge
          variant={getBadgeVariant(template.visibility)}
          className={getBadgeClass(template.visibility)}
        >
          {template.visibility.charAt(0).toUpperCase() + template.visibility.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(template.updatedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>{template.cloneCount}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          {/* @ts-expect-error asChild type issue from shadcn */}
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(template.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeVisibility(template.id, template.visibility)}>
              <Eye className="mr-2 h-4 w-4" />
              Visibility
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(template.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

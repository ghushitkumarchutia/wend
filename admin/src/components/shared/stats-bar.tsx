import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import type { ApiResponse, TemplateStatsResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Globe, Star, EyeOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsBar() {
  const { data, isLoading, error } = useQuery<ApiResponse<TemplateStatsResponse>>({
    queryKey: ['template-stats'],
    queryFn: () => fetcher('/admin/templates/stats'),
  });

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
        Failed to load statistics.
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[60px]" />
          ) : (
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published</CardTitle>
          <Globe className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[60px]" />
          ) : (
            <div className="text-2xl font-bold">{stats?.published || 0}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Featured</CardTitle>
          <Star className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[60px]" />
          ) : (
            <div className="text-2xl font-bold">{stats?.featured || 0}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hidden</CardTitle>
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[60px]" />
          ) : (
            <div className="text-2xl font-bold">{stats?.hidden || 0}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

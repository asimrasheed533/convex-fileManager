import { parseAsString, useQueryState } from 'nuqs';
import { ReactNode } from 'react';

export default function FilesWrapper({ children }: { children: ReactNode }) {
  const [viewMode] = useQueryState('view', parseAsString.withDefault('grid'));

  return viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div> : <div className="space-y-2">{children}</div>;
}

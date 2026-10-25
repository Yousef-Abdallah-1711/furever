'use client';
import { useEffect, useRef } from 'react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { EmptyState } from '../EmptyState';
import { Icon } from '../Icon';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  totalCount: number;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  rowKey: (row: T) => string;
  onQueryChange?: (query: { page: number; sortKey?: string; sortDirection?: 'asc' | 'desc' }) => void;
}

export function DataTable<T>({ columns, rows, totalCount, pageSize = 20, loading = false, emptyMessage, rowKey, onQueryChange }: DataTableProps<T>) {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [sort, setSort] = useQueryState('sort', parseAsString);
  const [dir, setDir] = useQueryState('dir', parseAsString);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Capture the latest onQueryChange via a ref (updated in its own effect, never during
  // render) so this effect only fires when page/sort/dir actually change - not on every
  // parent re-render that happens to pass a fresh inline callback.
  const onQueryChangeRef = useRef(onQueryChange);
  useEffect(() => {
    onQueryChangeRef.current = onQueryChange;
  }, [onQueryChange]);
  useEffect(() => {
    onQueryChangeRef.current?.({ page, ...(sort ? { sortKey: sort } : {}), ...(dir === 'asc' || dir === 'desc' ? { sortDirection: dir } : {}) });
  }, [page, sort, dir]);

  const handleSort = async (columnKey: string) => {
    const nextDirection = sort === columnKey && dir === 'asc' ? 'desc' : 'asc';
    await Promise.all([setSort(columnKey), setDir(nextDirection), setPage(1)]);
  };

  const renderCell = (column: DataTableColumn<T>, row: T) => {
    if (column.render) return column.render(row);
    return String((row as Record<string, unknown>)[column.key]);
  };

  return (
    <div className="flex flex-col gap-sp-4">
      <div className={loading ? 'opacity-50 pointer-events-none' : undefined}>
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th key={column.key} scope="col" className="ps-sp-4 pe-sp-4 py-sp-3 text-start text-fs-caption font-medium text-text-secondary">
                  {column.sortable ? (
                    <button type="button" className="inline-flex items-center gap-sp-2 text-start" onClick={() => void handleSort(column.key)} aria-label={`Sort by ${column.label}`}>
                      {column.label}
                      {sort === column.key ? <Icon name={dir === 'desc' ? 'chevron-down' : 'chevron-up'} size={16} /> : null}
                    </button>
                  ) : column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr><td colSpan={columns.length} className="py-sp-6"><EmptyState icon="inbox" title={emptyMessage ?? 'Nothing here yet'} /></td></tr>
            ) : rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border">
                {columns.map((column) => <td key={column.key} className="ps-sp-4 pe-sp-4 py-sp-3 text-start text-fs-body text-text-primary">{renderCell(column, row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="flex items-center justify-between gap-sp-4" aria-label="Table pagination">
        <button type="button" className="rounded-r-control border border-border ps-sp-4 pe-sp-4 py-sp-2 text-fs-button text-text-primary disabled:opacity-50" onClick={() => void setPage(Math.max(1, page - 1))} disabled={page <= 1}>Previous</button>
        <span className="text-fs-caption text-text-secondary">Page {page} of {totalPages}</span>
        <button type="button" className="rounded-r-control border border-border ps-sp-4 pe-sp-4 py-sp-2 text-fs-button text-text-primary disabled:opacity-50" onClick={() => void setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</button>
      </nav>
    </div>
  );
}

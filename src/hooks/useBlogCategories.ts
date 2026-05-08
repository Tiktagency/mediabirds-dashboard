import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogCategory {
  id: string;
  company_id: string;
  label: string;
  value: string;
  created_at: string;
}

export const useBlogCategories = (companyId: string | null) => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!companyId) {
      setCategories([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching blog categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (label: string, value: string) => {
    if (!companyId) {
      return { success: false, error: 'No company selected' };
    }

    try {
      const { error: insertError } = await supabase
        .from('blog_categories')
        .insert({
          company_id: companyId,
          label,
          value,
        });

      if (insertError) {
        throw insertError;
      }

      await fetchCategories();
      return { success: true, error: null };
    } catch (err) {
      console.error('Error adding blog category:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add category' };
    }
  }, [companyId, fetchCategories]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', categoryId);

      if (deleteError) {
        throw deleteError;
      }

      await fetchCategories();
      return { success: true, error: null };
    } catch (err) {
      console.error('Error deleting blog category:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete category' };
    }
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    addCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};

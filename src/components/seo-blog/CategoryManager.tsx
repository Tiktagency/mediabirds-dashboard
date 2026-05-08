import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { useBlogCategories } from '@/hooks/useBlogCategories';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CategoryManagerProps {
  companyId: string | null;
  isAdmin: boolean;
  onCategoryChange?: () => void;
}

export const CategoryManager = ({ companyId, isAdmin, onCategoryChange }: CategoryManagerProps) => {
  const { categories, isLoading, addCategory, deleteCategory } = useBlogCategories(companyId);
  const [newLabel, setNewLabel] = useState('');
  const [newId, setNewId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; label: string } | null>(null);

  if (!isAdmin) return null;

  const handleAddCategory = async () => {
    if (!newLabel.trim() || !newId.trim()) {
      toast.error('Vul zowel label als ID in');
      return;
    }

    setIsAdding(true);
    
    // Create the formatted label and value
    const formattedLabel = `${newLabel.trim()} (ID ${newId.trim()})`;
    const formattedValue = `${newLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${newId.trim()}`;

    const result = await addCategory(formattedLabel, formattedValue);
    
    if (result.success) {
      toast.success('Categorie toegevoegd');
      setNewLabel('');
      setNewId('');
      onCategoryChange?.();
    } else {
      toast.error(result.error || 'Fout bij toevoegen categorie');
    }
    
    setIsAdding(false);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setDeletingId(categoryToDelete.id);
    const result = await deleteCategory(categoryToDelete.id);
    
    if (result.success) {
      toast.success('Categorie verwijderd');
      onCategoryChange?.();
    } else {
      toast.error(result.error || 'Fout bij verwijderen categorie');
    }
    
    setDeletingId(null);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm text-muted-foreground">Categorieën beheren</Label>
      
      {/* Existing categories */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Laden...
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Geen categorieën gevonden. Voeg hieronder een categorie toe.
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-2 p-2 bg-white/5 rounded-md"
            >
              <span className="text-sm text-foreground">{category.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setCategoryToDelete({ id: category.id, label: category.label })}
                disabled={deletingId === category.id}
              >
                {deletingId === category.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add new category */}
      <div className="pt-3 border-t border-white/10 space-y-3">
        <p className="text-xs text-muted-foreground">Nieuwe categorie toevoegen</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Label (bijv. Begrijpen / uitleg)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="w-24">
            <Input
              placeholder="ID"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <Button
            size="sm"
            onClick={handleAddCategory}
            disabled={isAdding || !newLabel.trim() || !newId.trim()}
            className="whitespace-nowrap"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Toevoegen
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Voorbeeld: Label "Begrijpen / uitleg" + ID "6" → "Begrijpen / uitleg (ID 6)"
        </p>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Categorie verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de categorie "{categoryToDelete?.label}" wilt verwijderen? 
              Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

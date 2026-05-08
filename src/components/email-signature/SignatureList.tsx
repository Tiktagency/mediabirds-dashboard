import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Trash2, Mail, Plus } from 'lucide-react';
import { EmailSignatureSettings } from '@/hooks/useEmailSignatureSettings';

interface SignatureListProps {
  signatures: EmailSignatureSettings[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  isCreatingNew: boolean;
  onCancelNew: () => void;
}

export const SignatureList = ({
  signatures,
  selectedId,
  onSelect,
  onDelete,
  isCreatingNew,
  onCancelNew,
}: SignatureListProps) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showCancelNewConfirm, setShowCancelNewConfirm] = useState(false);

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleConfirmCancelNew = () => {
    onCancelNew();
    setShowCancelNewConfirm(false);
  };

  return (
    <>
      <div className="space-y-2">
        {/* Nieuw handtekening placeholder */}
        {isCreatingNew && (
          <Card className="bg-white/5 border-white/10 p-4 ring-2 ring-primary border-primary">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-white/50" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">Nieuwe handtekening</p>
                  <p className="text-sm text-white/50">Vul het formulier in</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/40 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0"
                onClick={() => setShowCancelNewConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}
        
        {signatures.length === 0 && !isCreatingNew ? (
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="text-center text-white/50">
              <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nog geen handtekeningen</p>
              <p className="text-sm mt-1">Maak je eerste handtekening aan</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {signatures.map((signature) => (
              <Card
                key={signature.id}
                className={`bg-white/5 border-white/10 p-4 cursor-pointer transition-all hover:bg-white/10 ${
                  selectedId === signature.id ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => onSelect(signature.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {signature.profile_photo_url ? (
                      <img
                        src={signature.profile_photo_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-medium"
                        style={{ backgroundColor: signature.background_color }}
                      >
                        {signature.first_name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate">{signature.name}</p>
                      <p className="text-sm text-white/50 truncate">
                        {signature.first_name} {signature.last_name}
                      </p>
                      <p className="text-xs text-white/40 truncate">{signature.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/40 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(signature.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bevestiging voor verwijderen bestaande handtekening */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Handtekening verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze handtekening wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bevestiging voor annuleren nieuwe handtekening */}
      <AlertDialog open={showCancelNewConfirm} onOpenChange={setShowCancelNewConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nieuwe handtekening annuleren?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je het aanmaken van een nieuwe handtekening wilt annuleren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Terug</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancelNew}>
              Annuleren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

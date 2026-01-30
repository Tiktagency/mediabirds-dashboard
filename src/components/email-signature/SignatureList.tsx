import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Mail } from 'lucide-react';
import { EmailSignatureSettings } from '@/hooks/useEmailSignatureSettings';

interface SignatureListProps {
  signatures: EmailSignatureSettings[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
}

export const SignatureList = ({
  signatures,
  selectedId,
  onSelect,
  onDelete,
}: SignatureListProps) => {
  return (
    <div className="space-y-2">
      {signatures.length === 0 ? (
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
                    onDelete(signature.id);
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
  );
};

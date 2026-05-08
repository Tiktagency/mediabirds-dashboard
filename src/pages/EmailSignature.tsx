import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmailSignatureForm } from '@/components/email-signature/EmailSignatureForm';
import { SignatureList } from '@/components/email-signature/SignatureList';
import { useEmailSignatureSettings } from '@/hooks/useEmailSignatureSettings';
import { Loader2 } from 'lucide-react';

const EmailSignature = () => {
  const {
    signatures,
    selectedSignature,
    isLoading,
    isSaving,
    selectSignature,
    createNewSignature,
    saveSettings,
    deleteSignature,
    uploadProfilePhoto,
  } = useEmailSignatureSettings();

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="w-full flex flex-col items-center justify-start pt-8 pb-16 px-6">
        <h1 className="hero-title text-white mb-4 fade-in-up text-center">
          Email Handtekening
        </h1>
        <p className="text-white/50 text-lg mb-8 text-center max-w-lg">
          Genereer een professionele email handtekening met profielfoto
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            {/* Left: Signature List */}
            <div className="order-2 lg:order-1">
              <SignatureList
                signatures={signatures}
                selectedId={selectedSignature?.id || null}
                onSelect={selectSignature}
                onDelete={deleteSignature}
                onCreateNew={createNewSignature}
              />
            </div>

            {/* Right: Form */}
            <div className="order-1 lg:order-2">
              <EmailSignatureForm
                selectedSignature={selectedSignature}
                isSaving={isSaving}
                onSave={saveSettings}
                onUploadPhoto={uploadProfilePhoto}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSignature;

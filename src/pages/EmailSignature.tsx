import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmailSignatureForm } from '@/components/email-signature/EmailSignatureForm';
import { SignatureList } from '@/components/email-signature/SignatureList';
import { useEmailSignatureSettings } from '@/hooks/useEmailSignatureSettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check } from 'lucide-react';

const EmailSignature = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const {
    signatures,
    selectedSignature,
    isLoading,
    isSaving,
    selectSignature,
    createNewSignature,
    saveSettings,
    deleteSignature,
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
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[280px_1fr_1fr] gap-6">
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

            {/* Middle: Form */}
            <div className="order-1 lg:order-2">
              <EmailSignatureForm
                selectedSignature={selectedSignature}
                isSaving={isSaving}
                onSave={saveSettings}
                onHtmlGenerated={(html) => setGeneratedHtml(html)}
                onGeneratingChange={(generating) => setIsGenerating(generating)}
              />
            </div>

            {/* Right: HTML Output */}
            <div className="order-3">
              <Card className="bg-white/5 border-white/10 h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">HTML Code</CardTitle>
                    <CardDescription className="text-white/50">
                      Kopieer deze code naar je email programma
                    </CardDescription>
                  </div>
                  {generatedHtml && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                      onClick={async () => {
                        await navigator.clipboard.writeText(generatedHtml);
                        setIsCopied(true);
                        toast({
                          title: 'Gekopieerd',
                          description: 'HTML code is naar het klembord gekopieerd',
                        });
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Gekopieerd
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Kopieer
                        </>
                      )}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 min-h-[300px] max-h-[500px] overflow-auto">
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>HTML code genereren...</span>
                      </div>
                    ) : generatedHtml ? (
                      <pre className="whitespace-pre-wrap break-all">{generatedHtml}</pre>
                    ) : (
                      <span className="text-white/30">
                        Vul het formulier in en klik op "Handtekening genereren" om de HTML code te zien.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSignature;

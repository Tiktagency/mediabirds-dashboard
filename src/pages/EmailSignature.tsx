import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmailSignatureForm } from '@/components/email-signature/EmailSignatureForm';
import { SignatureList } from '@/components/email-signature/SignatureList';
import { useEmailSignatureSettings } from '@/hooks/useEmailSignatureSettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check, Plus } from 'lucide-react';

const cleanHtmlForCopy = (html: string): string => {
  let cleaned = html;
  
  // Verwijder "Met vriendelijke groet, Kind Regards" en variaties
  cleaned = cleaned.replace(/Met vriendelijke groet,?\s*Kind Regards\s*/gi, '');
  
  // Verwijder lege paragrafen en divs met alleen whitespace
  cleaned = cleaned.replace(/<p[^>]*>\s*(&nbsp;|\s)*\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*>\s*(&nbsp;|\s)*\s*<\/div>/gi, '');
  
  // Verwijder dubbele &nbsp; en overtollige witruimte
  cleaned = cleaned.replace(/(&nbsp;\s*){3,}/gi, '&nbsp;');
  
  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

const EmailSignature = () => {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    signatures,
    selectedSignature,
    isLoading,
    isSaving,
    isCreatingNew,
    selectSignature,
    createNewSignature,
    cancelNewSignature,
    saveSettings,
    deleteSignature,
  } = useEmailSignatureSettings();

  // Laad opgeslagen HTML wanneer handtekening wijzigt
  useEffect(() => {
    if (selectedSignature?.generated_html) {
      setGeneratedHtml(selectedSignature.generated_html);
    } else {
      setGeneratedHtml(null);
    }
  }, [selectedSignature]);

  // Forceer selecteerbaarheid via JavaScript na render
  useEffect(() => {
    if (previewRef.current && generatedHtml) {
      const allElements = previewRef.current.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.setProperty('user-select', 'text', 'important');
        htmlEl.style.setProperty('-webkit-user-select', 'text', 'important');
        htmlEl.style.setProperty('cursor', 'text', 'important');
        htmlEl.style.setProperty('pointer-events', 'auto', 'important');
      });
    }
  }, [generatedHtml]);

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
          <div className="w-full max-w-7xl space-y-6">
            {/* Header above columns */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Mijn Handtekeningen</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={createNewSignature}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nieuw
              </Button>
            </div>

            {/* Three columns aligned at top */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_1fr] gap-6 items-start">
              {/* Left: Signature List */}
              <div className="order-2 md:order-1">
                <SignatureList
                  signatures={signatures}
                  selectedId={selectedSignature?.id || null}
                  onSelect={selectSignature}
                  onDelete={deleteSignature}
                  isCreatingNew={isCreatingNew}
                  onCancelNew={cancelNewSignature}
                />
              </div>

              {/* Middle: Form */}
            <div className="order-1 md:order-2">
              <EmailSignatureForm
                selectedSignature={selectedSignature}
                isSaving={isSaving}
                onSave={saveSettings}
                onHtmlGenerated={(html) => {
                  setGeneratedHtml(html);
                }}
                onGeneratingChange={(generating) => setIsGenerating(generating)}
              />
            </div>

            {/* Right: HTML Output */}
            <div className="order-3 flex flex-col gap-4">
              {/* HTML Preview */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg">Preview</CardTitle>
                  {generatedHtml && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                      onClick={async () => {
                        try {
                          const cleanedHtml = cleanHtmlForCopy(generatedHtml!);
                          const blob = new Blob([cleanedHtml], { type: 'text/html' });
                          const clipboardItem = new ClipboardItem({ 'text/html': blob });
                          await navigator.clipboard.write([clipboardItem]);
                          
                          toast({
                            title: 'Gekopieerd',
                            description: 'Handtekening is gekopieerd met opmaak - plak direct in je e-mail',
                          });
                        } catch (err) {
                          const cleanedHtml = cleanHtmlForCopy(generatedHtml!);
                          await navigator.clipboard.writeText(cleanedHtml);
                          toast({
                            title: 'Gekopieerd',
                            description: 'HTML code gekopieerd (plak in bronweergave van je e-mail)',
                          });
                        }
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Kopieer
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 min-h-[200px] overflow-hidden">
                    {isGenerating ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Preview laden...</span>
                      </div>
                    ) : generatedHtml ? (
                  <div 
                    ref={previewRef}
                    className="origin-top-left scale-[0.65] select-text cursor-text"
                    style={{ width: '154%' }}
                    dangerouslySetInnerHTML={{ __html: generatedHtml }} 
                  />
                    ) : (
                      <span className="text-gray-400">
                        Genereer een handtekening om de preview te zien.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* HTML Code */}
              <Card className="bg-white/5 border-white/10">
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
                <CardContent>
                  <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 min-h-[200px] max-h-[300px] overflow-auto">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSignature;

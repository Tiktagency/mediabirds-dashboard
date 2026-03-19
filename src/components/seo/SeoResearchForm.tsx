import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  blogTopic: string;
  audienceIntent: string;
  businessDescription: string;
  extraInstructions: string;
}

const steps = [
  {
    id: 1,
    title: 'Blog Onderwerp',
    description: 'Waar moeten de SEO blogs over gaan?',
    placeholder: 'Bijv. duurzame energie, digitale marketing, gezonde voeding...',
    field: 'blogTopic' as keyof FormData,
    optional: false,
  },
  {
    id: 2,
    title: 'Doelgroep & Intentie',
    description: 'Voor wie schrijven we en wat is het doel van deze content?',
    placeholder: 'Bijv. MKB-ondernemers die hun online zichtbaarheid willen vergroten...',
    field: 'audienceIntent' as keyof FormData,
    optional: false,
  },
  {
    id: 3,
    title: 'Bedrijfsomschrijving',
    description: 'Beschrijf de producten of diensten van de organisatie.',
    placeholder: 'Bijv. Wij zijn een full-service marketing bureau gespecialiseerd in...',
    field: 'businessDescription' as keyof FormData,
    optional: false,
  },
  {
    id: 4,
    title: 'Extra Instructies',
    description: 'Voeg eventuele aanvullende notities toe voor de AI agent.',
    placeholder: 'Bijv. Focus op Nederlandse markt, vermijd technisch jargon...',
    field: 'extraInstructions' as keyof FormData,
    optional: true,
  },
];

interface SeoResearchFormProps {
  seoResearchWebhook: string;
}

const SeoResearchForm = ({ seoResearchWebhook }: SeoResearchFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    blogTopic: '',
    audienceIntent: '',
    businessDescription: '',
    extraInstructions: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalSteps = steps.length + 1; // +1 for summary
  const progress = (currentStep / totalSteps) * 100;

  const currentStepData = steps.find(s => s.id === currentStep);
  const isSummary = currentStep === totalSteps;

  const canProceed = () => {
    if (isSummary) return true;
    if (!currentStepData) return false;
    if (currentStepData.optional) return true;
    return formData[currentStepData.field].trim().length > 0;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleInputChange = (value: string) => {
    if (currentStepData) {
      setFormData(prev => ({
        ...prev,
        [currentStepData.field]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(seoResearchWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogTopic: formData.blogTopic,
          audienceIntent: formData.audienceIntent,
          businessDescription: formData.businessDescription,
          extraInstructions: formData.extraInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error('Webhook request failed');
      }

      toast({
        title: 'SEO Onderzoek gestart',
        description: 'Je aanvraag is succesvol verzonden. Het onderzoek wordt nu uitgevoerd.',
        duration: 7000,
      });

      // Reset form after successful submission
      setFormData({
        blogTopic: '',
        audienceIntent: '',
        businessDescription: '',
        extraInstructions: '',
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error submitting SEO research:', error);
      toast({
        title: 'Er is iets misgegaan',
        description: 'Het SEO onderzoek kon niet worden gestart. Probeer het opnieuw.',
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between text-sm text-white/50 mb-3 tracking-wide">
          <span>Stap {currentStep} van {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="seo-card p-8 md:p-12 animate-fade-in">
        {!isSummary && currentStepData ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {currentStepData.title}
                </h2>
                {currentStepData.optional && (
                  <span className="px-3 py-1 text-xs font-medium bg-white/10 text-white/60 rounded-full">
                    Optioneel
                  </span>
                )}
              </div>
              <p className="text-white/60 text-lg font-light tracking-wide">
                {currentStepData.description}
              </p>
            </div>

            <textarea
              value={formData[currentStepData.field]}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentStepData.placeholder}
              className="seo-input w-full min-h-[140px] resize-none"
              autoFocus
            />
          </div>
        ) : (
          /* Summary Screen */
          <div className="space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Overzicht
              </h2>
              <p className="text-white/60 text-base font-light tracking-wide">
                Controleer je invoer voordat je het onderzoek start
              </p>
            </div>

            <div className="space-y-2">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xs font-semibold text-white/80 tracking-wide uppercase">
                          {step.title}
                        </h3>
                        {step.optional && (
                          <span className="text-xs text-white/40">(Optioneel)</span>
                        )}
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed break-words line-clamp-2">
                        {formData[step.field] || (
                          <span className="text-white/30 italic">Niet ingevuld</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className="text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors shrink-0"
                    >
                      Wijzig
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              "text-white/60 hover:text-white hover:bg-white/10 gap-2 transition-all",
              currentStep === 1 && "opacity-0 pointer-events-none"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Terug
          </Button>

          {!isSummary ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="seo-button gap-2"
            >
              Volgende
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="seo-button-primary gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Bezig...
                </>
              ) : (
              <>
                  <Sparkles className="w-4 h-4" />
                  Start SEO onderzoek
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index + 1)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              currentStep === index + 1
                ? "bg-gradient-to-r from-purple-500 to-orange-500 w-8"
                : currentStep > index + 1
                ? "bg-purple-500/60"
                : "bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default SeoResearchForm;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Star } from "lucide-react";

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  rating?: number;
  imageUrl?: string;
}

interface ProfessionalSelectorProps {
  selectedProfessionalId: string | null;
  onProfessionalSelect: (professionalId: string | null) => void;
  professionals: Professional[];
  onContinue: () => void;
  mode: 'any' | 'per-service' | 'specific';
  onModeChange: (mode: 'any' | 'per-service' | 'specific') => void;
}

export default function ProfessionalSelector({
  selectedProfessionalId,
  onProfessionalSelect,
  professionals,
  onContinue,
  mode,
  onModeChange,
}: ProfessionalSelectorProps) {
  const handleAnyProfessional = () => {
    onModeChange('any');
    onProfessionalSelect(null);
  };

  const handlePerService = () => {
    onModeChange('per-service');
    onProfessionalSelect(null);
  };

  const handleSpecificProfessional = (id: string) => {
    onModeChange('specific');
    onProfessionalSelect(id);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`p-6 cursor-pointer hover-elevate active-elevate-2 transition-all ${
          mode === 'any' ? 'ring-2 ring-primary' : ''
        }`}
        onClick={handleAnyProfessional}
        data-testid="professional-option-any"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Any professional</h4>
              <p className="text-sm text-muted-foreground">for maximum availability</p>
            </div>
          </div>
          <Button
            variant={mode === 'any' ? 'default' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              handleAnyProfessional();
            }}
          >
            Select
          </Button>
        </div>
      </Card>

      <Card
        className={`p-6 cursor-pointer hover-elevate active-elevate-2 transition-all ${
          mode === 'per-service' ? 'ring-2 ring-primary' : ''
        }`}
        onClick={handlePerService}
        data-testid="professional-option-per-service"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Select professional per service</h4>
            </div>
          </div>
          <Button
            variant={mode === 'per-service' ? 'default' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              handlePerService();
            }}
          >
            Select
          </Button>
        </div>
      </Card>

      <div className="space-y-3 mt-6">
        {professionals.map((professional) => {
          const isSelected = mode === 'specific' && selectedProfessionalId === professional.id;

          return (
            <Card
              key={professional.id}
              className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSpecificProfessional(professional.id)}
              data-testid={`professional-card-${professional.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={professional.imageUrl} alt={professional.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {professional.rating && (
                      <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full px-2 py-0.5 flex items-center gap-1">
                        <span className="text-sm font-semibold">{professional.rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{professional.name}</h4>
                    <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                  </div>
                </div>
                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpecificProfessional(professional.id);
                  }}
                >
                  Select
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {(mode !== null) && (
        <Button
          onClick={onContinue}
          className="w-full mt-6"
          size="lg"
          data-testid="button-continue-to-time"
        >
          Continue
        </Button>
      )}
    </div>
  );
}

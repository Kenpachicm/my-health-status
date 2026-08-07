import { useState, useEffect } from 'react';
import SelectResults from './SelectResults';
import ConfigureShare from './ConfigureShare';
import GeneratedShare from './GeneratedShare';

interface ShareWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialResultIds?: string[];
  userId: string;
  memberId: string;
}

export type ShareType = 'qr_code' | 'secure_link';

export interface ShareConfig {
  shareType: ShareType;
  expirationHours: number;
  requireAccessCode: boolean;
  accessCode: string;
  notifyOnAccess: boolean;
  singleViewOnly: boolean;
  personalMessage: string;
}

export interface GeneratedShareData {
  shareId: string;
  shareToken: string;
  shareUrl: string;
  shareType: ShareType;
  expiresAt: string;
  accessCode: string | null;
  resultCount: number;
}

export default function ShareWizard({ isOpen, onClose, initialResultIds = [], userId, memberId }: ShareWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>(initialResultIds);
  const [shareConfig, setShareConfig] = useState<ShareConfig>({
    shareType: 'qr_code',
    expirationHours: 24,
    requireAccessCode: false,
    accessCode: '',
    notifyOnAccess: false,
    singleViewOnly: false,
    personalMessage: '',
  });
  const [generatedShare, setGeneratedShare] = useState<GeneratedShareData | null>(null);

  useEffect(() => {
    if (isOpen && initialResultIds.length > 0) {
      setSelectedResultIds(initialResultIds);
      setStep(2);
    } else if (isOpen) {
      setStep(1);
    }
  }, [isOpen, initialResultIds]);

  const handleClose = () => {
    setStep(1);
    setSelectedResultIds([]);
    setShareConfig({
      shareType: 'qr_code',
      expirationHours: 24,
      requireAccessCode: false,
      accessCode: '',
      notifyOnAccess: false,
      singleViewOnly: false,
      personalMessage: '',
    });
    setGeneratedShare(null);
    onClose();
  };

  const handleSelectResults = (resultIds: string[]) => {
    setSelectedResultIds(resultIds);
    setStep(2);
  };

  const handleConfigureShare = (config: ShareConfig) => {
    setShareConfig(config);
  };

  const handleShareGenerated = (share: GeneratedShareData) => {
    setGeneratedShare(share);
    setStep(3);
  };

  const handleCreateAnother = () => {
    setStep(1);
    setSelectedResultIds([]);
    setShareConfig({
      shareType: 'qr_code',
      expirationHours: 24,
      requireAccessCode: false,
      accessCode: '',
      notifyOnAccess: false,
      singleViewOnly: false,
      personalMessage: '',
    });
    setGeneratedShare(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <SelectResults
            onClose={handleClose}
            onContinue={handleSelectResults}
            userId={userId}
          />
        )}
        {step === 2 && (
          <ConfigureShare
            selectedResultIds={selectedResultIds}
            onBack={() => setStep(1)}
            onClose={handleClose}
            onGenerate={handleShareGenerated}
            userId={userId}
            initialConfig={shareConfig}
            onConfigChange={handleConfigureShare}
          />
        )}
        {step === 3 && generatedShare && (
          <GeneratedShare
            share={generatedShare}
            memberId={memberId}
            onClose={handleClose}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </div>
    </div>
  );
}

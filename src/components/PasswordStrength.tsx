interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;

    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { score: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const checkRequirement = (test: boolean) => test ? 'text-green-600' : 'text-gray-400';

  const hasMinLength = password.length >= 12;
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const strength = password ? calculateStrength(password) : null;

  return (
    <div className="space-y-3">
      {strength && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Password Strength:</span>
            <span className={`font-medium ${
              strength.score === 1 ? 'text-red-600' :
              strength.score === 2 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {strength.label}
            </span>
          </div>
          <div className="flex gap-2">
            <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-gray-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-gray-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-gray-200'}`} />
          </div>
        </div>
      )}

      <div className="text-sm space-y-1.5">
        <p className="font-medium text-gray-700 mb-2">Password Requirements:</p>
        <div className={`flex items-center gap-2 ${checkRequirement(hasMinLength)}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Minimum 12 characters</span>
        </div>
        <div className={`flex items-center gap-2 ${checkRequirement(hasUpperAndLower)}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Include uppercase and lowercase</span>
        </div>
        <div className={`flex items-center gap-2 ${checkRequirement(hasNumber)}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Include numbers</span>
        </div>
        <div className={`flex items-center gap-2 ${checkRequirement(hasSpecial)}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Include special characters</span>
        </div>
      </div>
    </div>
  );
}

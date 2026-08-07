import { Star } from 'lucide-react';
import { useState } from 'react';

interface QuestionProps {
  question: {
    id: string;
    question_text: string;
    question_type: string;
    required: boolean;
    options?: string[];
    scale_min?: number;
    scale_max?: number;
    scale_labels?: { minLabel?: string; maxLabel?: string };
    char_limit?: number;
    help_text?: string;
  };
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function MultipleChoiceSingle({ question, value, onChange, error }: QuestionProps) {
  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label
          key={index}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 text-blue-600"
          />
          <span className="text-gray-900">{option}</span>
        </label>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function MultipleChoiceMulti({ question, value = [], onChange, error }: QuestionProps) {
  const handleToggle = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((v: string) => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label
          key={index}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input
            type="checkbox"
            checked={value.includes(option)}
            onChange={() => handleToggle(option)}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <span className="text-gray-900">{option}</span>
        </label>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function RatingStars({ question, value = 0, onChange, error }: QuestionProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={40}
              className={`${
                star <= (hover || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-4 text-lg font-semibold text-gray-700">
            {value} out of 5
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function RatingScale({ question, value = 0, onChange, error }: QuestionProps) {
  const min = question.scale_min || 1;
  const max = question.scale_max || 10;
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>{question.scale_labels?.minLabel || 'Min'}</span>
        <span>{question.scale_labels?.maxLabel || 'Max'}</span>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {numbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`p-3 rounded-lg border-2 font-semibold transition-all ${
              value === num
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 hover:border-blue-300 text-gray-700'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export function YesNo({ question, value, onChange, error }: QuestionProps) {
  return (
    <div className="space-y-3">
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => onChange('Yes')}
          className={`flex-1 p-4 rounded-lg border-2 font-semibold transition-all ${
            value === 'Yes'
              ? 'border-green-600 bg-green-600 text-white'
              : 'border-gray-200 hover:border-green-300 text-gray-700'
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange('No')}
          className={`flex-1 p-4 rounded-lg border-2 font-semibold transition-all ${
            value === 'No'
              ? 'border-red-600 bg-red-600 text-white'
              : 'border-gray-200 hover:border-red-300 text-gray-700'
          }`}
        >
          No
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function TextShort({ question, value = '', onChange, error }: QuestionProps) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your answer"
        maxLength={question.char_limit || 200}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {question.char_limit && (
        <p className="text-xs text-gray-500 text-right">
          {value.length} / {question.char_limit}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function TextLong({ question, value = '', onChange, error }: QuestionProps) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your answer"
        rows={6}
        maxLength={question.char_limit || 500}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      {question.char_limit && (
        <p className="text-xs text-gray-500 text-right">
          {value.length} / {question.char_limit}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Likert({ question, value, onChange, error }: QuestionProps) {
  const options = question.options || [
    'Strongly Disagree',
    'Disagree',
    'Neutral',
    'Agree',
    'Strongly Agree',
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(option)}
            className={`p-4 rounded-lg border-2 font-medium text-sm transition-all ${
              value === option
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 hover:border-blue-300 text-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export function renderQuestion(question: any, value: any, onChange: (value: any) => void, error?: string) {
  const props = { question, value, onChange, error };

  switch (question.question_type) {
    case 'multiple_choice_single':
      return <MultipleChoiceSingle {...props} />;
    case 'multiple_choice_multi':
      return <MultipleChoiceMulti {...props} />;
    case 'rating_stars':
      return <RatingStars {...props} />;
    case 'rating_scale':
      return <RatingScale {...props} />;
    case 'yes_no':
      return <YesNo {...props} />;
    case 'text_short':
      return <TextShort {...props} />;
    case 'text_long':
      return <TextLong {...props} />;
    case 'likert':
      return <Likert {...props} />;
    default:
      return <div>Unsupported question type</div>;
  }
}

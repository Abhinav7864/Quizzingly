
'use client';

import React, { useState, useEffect } from 'react';
import { Question, Option } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApi } from '@/hooks/useApi';
import { Plus } from 'lucide-react';

interface QuestionFormProps {
  quizId: string;
  questionToEdit?: Question | null;
  onQuestionSaved: (savedQuestion: Question) => void;
  onCancelEdit: () => void;
}

const initialOptions = [
  { text: '', isCorrect: true },
  { text: '', isCorrect: false },
];

export const QuestionForm = ({ quizId, questionToEdit, onQuestionSaved, onCancelEdit }: QuestionFormProps) => {
  const [text, setText] = useState('');
  const [timeLimit, setTimeLimit] = useState<number | string>(20);
  const [options, setOptions] = useState<Partial<Option>[]>(initialOptions);
  const { isLoading, exec: saveQuestion } = useApi<Question>();

  useEffect(() => {
    if (questionToEdit) {
      setText(questionToEdit.text);
      setTimeLimit(questionToEdit.timeLimit);
      setOptions(questionToEdit.options);
    } else {
      resetForm();
    }
  }, [questionToEdit]);

  const resetForm = () => {
    setText('');
    setTimeLimit(20);
    setOptions(initialOptions);
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...options];
    if (field === 'isCorrect') {
      newOptions.forEach((opt, i) => opt.isCorrect = i === index);
    } else {
      (newOptions[index] as any)[field] = value;
    }
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) setOptions([...options, { text: '', isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = questionToEdit ? `/questions/${questionToEdit.id}` : `/${quizId}/questions`;
    const method = questionToEdit ? 'PUT' : 'POST';
    const saved = await saveQuestion(endpoint, { method, body: { text, timeLimit, options } });
    if (saved) {
      onQuestionSaved(saved);
      if (!questionToEdit) resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input id="question-text" label="Question Text" value={text} onChange={(e) => setText(e.target.value)} required />
      <Input
        id="time-limit"
        label="Time Limit (seconds)"
        type="number"
        value={timeLimit}
        onChange={(e) => setTimeLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
        required
      />

      <div>
        <h3 className="text-[14px] font-black text-[#1E1E1E] mb-1 uppercase tracking-wider">Options</h3>
        <p className="text-[12px] text-[#6B6B6B] font-bold mb-5">Select the correct answer by clicking the indicator.</p>
        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="correct-option"
                checked={option.isCorrect}
                onChange={() => handleOptionChange(index, 'isCorrect', true)}
                className="h-5 w-5 accent-[#F55CA7]"
              />
              <Input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                className="w-10 h-10 p-0 rounded-xl"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={addOption} disabled={options.length >= 6} className="mt-4 gap-2">
          <Plus size={14} /> Add Option
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t-2 border-black">
        {questionToEdit && (
          <Button type="button" variant="ghost" onClick={onCancelEdit}>Cancel Edit</Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {questionToEdit ? 'Update Question' : 'Save Question'}
        </Button>
      </div>
    </form>
  );
};


'use client';

import React, { useState, useEffect } from 'react';
import { Question, Option } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApi } from '@/hooks/useApi';

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
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };
  
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = questionToEdit 
      ? `/questions/${questionToEdit.id}` 
      : `/${quizId}/questions`;
      
    const method = questionToEdit ? 'PUT' : 'POST';

    const saved = await saveQuestion(endpoint, {
      method,
      body: { text, timeLimit, options },
    });
    
    if (saved) {
      onQuestionSaved(saved);
      if (!questionToEdit) {
        resetForm();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="question-text"
        label="Question Text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <Input
        id="time-limit"
        label="Time Limit (seconds)"
        type="number"
        value={timeLimit}
        onChange={(e) => setTimeLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
        required
      />
      <div>
        <h3 className="text-lg font-medium mb-2">Options</h3>
        <p className="text-sm text-gray-400 mb-3">Select the correct answer by clicking the radio button.</p>
        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name="correct-option"
                checked={option.isCorrect}
                onChange={() => handleOptionChange(index, 'isCorrect', true)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-700 bg-gray-800"
              />
              <Input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                className="flex-grow"
              />
              <Button type="button" onClick={() => removeOption(index)} disabled={options.length <= 2} className="bg-red-800 hover:bg-red-700 text-xs px-2 py-1">
                X
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" onClick={addOption} disabled={options.length >= 6} className="mt-4 bg-gray-700 hover:bg-gray-600">
          Add Option
        </Button>
      </div>
      <div className="flex justify-end space-x-4">
        {questionToEdit && <Button type="button" onClick={onCancelEdit} className="bg-gray-600 hover:bg-gray-500">Cancel Edit</Button>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (questionToEdit ? 'Update Question' : 'Save Question')}
        </Button>
      </div>
    </form>
  );
};

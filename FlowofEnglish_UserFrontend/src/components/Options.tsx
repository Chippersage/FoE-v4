import React from "react";
import { Option as OptionType } from "../types/types";

interface OptionsProps {
  options: OptionType[];
  selectedOptions: string[];
  isMultiple: boolean;
  isChecked: boolean;
  onSelect: (optionId: string) => void;
}

const Options: React.FC<OptionsProps> = ({
  options,
  selectedOptions,
  isMultiple,
  isChecked,
  onSelect,
}) => {
  const getOptionClass = (option: OptionType) => {
    const isSelected = selectedOptions.includes(option.id);

    let baseClass =
      "border rounded-md p-4 flex items-center cursor-pointer transition-all duration-300 hover:border-green-700";

    if (!isChecked) {
      return `${baseClass} ${
        isSelected ? "border-green-700 bg-green-50" : "border-gray-200"
      }`;
    }

    if (isSelected && option.isCorrect) {
      return `${baseClass} border-green-600 bg-green-100 text-green-800`;
    } else if (isSelected && !option.isCorrect) {
      return `${baseClass} border-red-600 bg-red-100 text-red-800`;
    } else if (!isSelected && option.isCorrect) {
      return `${baseClass} border-green-600 bg-green-50 text-green-800 opacity-70`;
    }

    return `${baseClass} border-gray-200 opacity-70`;
  };

  const letterMapping: Record<number, string> = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
  };

  return (
    <div className="space-y-3 mt-4">
      {options.map((option, index) => (
        <div
          key={option.id}
          className={getOptionClass(option)}
          onClick={() => !isChecked && onSelect(option.id)}
        >
          <div className="mr-3 font-medium w-6">{letterMapping[index]}.</div>
          <div className="flex-grow">{option.text}</div>
        </div>
      ))}
    </div>
  );
};

export default Options;

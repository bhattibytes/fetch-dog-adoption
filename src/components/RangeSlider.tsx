import React from 'react';
import { motion } from 'framer-motion';

interface RangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (values: { min: number; max: number }) => void;
}

export const RangeSlider = ({ min, max, minValue, maxValue, onChange }: RangeSliderProps) => {
  const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null);

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleMouseDown = (handle: 'min' | 'max') => {
    setIsDragging(handle);
  };

  React.useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const slider = document.getElementById('range-slider');
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const value = Math.round(percentage * (max - min) + min);

      if (isDragging === 'min') {
        onChange({ min: Math.min(value, maxValue), max: maxValue });
      } else {
        onChange({ min: minValue, max: Math.max(value, minValue) });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, max, maxValue, min, minValue, onChange]);

  return (
    <div className="relative pt-6 pb-2">
      <div id="range-slider" className="h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{
            left: `${getPercentage(minValue)}%`,
            right: `${100 - getPercentage(maxValue)}%`,
          }}
        />
        <motion.div
          className="absolute w-4 h-4 -mt-1 -ml-2 bg-white border-2 border-blue-500 rounded-full cursor-pointer"
          style={{ left: `${getPercentage(minValue)}%` }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseDown={() => handleMouseDown('min')}
        />
        <motion.div
          className="absolute w-4 h-4 -mt-1 -ml-2 bg-white border-2 border-blue-500 rounded-full cursor-pointer"
          style={{ left: `${getPercentage(maxValue)}%` }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseDown={() => handleMouseDown('max')}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>{minValue} years</span>
        <span>{maxValue} years</span>
      </div>
    </div>
  );
}; 
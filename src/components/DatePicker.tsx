import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isValid } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useLang } from '../contexts/LangContext';
import 'react-day-picker/dist/style.css';
import './DatePicker.css';

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, t } = useLang();
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentLocale = lang === 'zh' ? zhCN : enUS;

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDaySelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    setIsOpen(false);
  };

  return (
    <div className="custom-datepicker" ref={popoverRef}>
      <button
        type="button"
        className={`datepicker-trigger ${date ? 'has-date' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={t.dueDatePlaceholder}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="calendar-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        <span>
          {date && isValid(date) 
            ? format(date, 'MMM d, yyyy', { locale: currentLocale }) 
            : t.dueDatePlaceholder}
        </span>
      </button>

      {isOpen && (
        <div className="datepicker-popover">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleDaySelect}
            locale={currentLocale}
            showOutsideDays
            className="anthropic-calendar"
          />
        </div>
      )}
    </div>
  );
}

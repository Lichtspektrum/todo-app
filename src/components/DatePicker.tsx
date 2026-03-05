import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isValid } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
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
        <CalendarIcon size={14} className="calendar-icon" />
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
            classNames={{
              root: 'rdp-root',
              months: 'rdp-months',
              month: 'rdp-month',
              caption: 'rdp-caption',
              caption_label: 'rdp-caption_label',
              nav: 'rdp-nav',
              nav_button: 'rdp-nav_button',
              nav_button_previous: 'rdp-nav_button_previous',
              nav_button_next: 'rdp-nav_button_next',
              table: 'rdp-table',
              head_row: 'rdp-head_row',
              head_cell: 'rdp-head_cell',
              row: 'rdp-row',
              cell: 'rdp-cell',
              day: 'rdp-day',
              day_selected: 'rdp-day_selected',
              day_today: 'rdp-day_today',
              day_outside: 'rdp-day_outside',
              day_disabled: 'rdp-day_disabled',
              day_hidden: 'rdp-day_hidden',
            }}
          />
        </div>
      )}
    </div>
  );
}

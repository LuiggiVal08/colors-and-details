import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerInputProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  error?: string | null;
}

function toLongDate(date: Date): string {
  return date.toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function toShortDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

export default function DatePickerInput({ value, onChange, label, error }: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (_event.type === 'dismissed') setShow(false);
    if (selectedDate) onChange(selectedDate);
  };

  return (
    <View className="flex-1">
      {label && <Text className="mb-1 text-xs text-slate-500 dark:text-slate-400">{label}</Text>}
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:bg-primary-dark dark:border-slate-700">
        <Ionicons name="calendar-outline" size={20} color="#4DB6AC" />
        <View className="flex-1">
          <Text className="text-sm font-medium text-slate-900 dark:text-white">{toShortDate(value)}</Text>
          <Text className="text-xs text-slate-400 dark:text-slate-500">{toLongDate(value)}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#94A3B8" />
      </TouchableOpacity>
      {error && <Text className="mt-1 text-xs text-rose-600">{error}</Text>}
      {show && (
        <View>
          {Platform.OS === 'ios' && (
            <View className="flex-row justify-end pt-2">
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text className="font-semibold text-info">Listo</Text>
              </TouchableOpacity>
            </View>
          )}
          <DateTimePicker
            value={value}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={handleChange}
          />
        </View>
      )}
    </View>
  );
}

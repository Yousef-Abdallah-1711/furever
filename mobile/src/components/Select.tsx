import * as React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon } from './Icon';
export interface SelectOption { value: string; label: string; disabled?: boolean; }
export interface SelectProps { value?: string; onChange: (value: string) => void; options: SelectOption[]; label?: string; placeholder?: string; hint?: string; error?: string; disabled?: boolean; }
export function Select({ value, onChange, options, label, placeholder, hint, error, disabled = false }: SelectProps) {
 const [isOpen, setIsOpen] = React.useState(false);
 const selected = options.find((option) => option.value === value), message = error ?? hint;
 const choose = (option: SelectOption) => { if (!option.disabled) { onChange(option.value); setIsOpen(false); } };
 return <View className="w-full gap-sp-2">
  {label ? <Text className="text-fs-caption text-text-primary">{label}</Text> : null}
  <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, expanded: isOpen }} disabled={disabled} onPress={() => setIsOpen(true)} className={`min-h-sp-12 flex-row items-center justify-between rounded-r-control border px-sp-4 py-sp-3 ${error ? 'border-danger' : 'border-default'} ${disabled ? 'bg-surface-secondary opacity-50' : 'bg-surface'}`}>
   <Text className={`flex-1 text-start text-fs-body ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>{selected?.label ?? placeholder ?? ''}</Text><Icon name="chevron-down" />
  </Pressable>
  {message ? <Text className={`text-fs-caption ${error ? 'text-danger' : 'text-text-secondary'}`}>{message}</Text> : null}
  <Modal transparent animationType="slide" visible={isOpen} onRequestClose={() => setIsOpen(false)}>
   <View className="flex-1 justify-end bg-overlay">
    <Pressable accessibilityLabel="Close options" className="absolute inset-0" onPress={() => setIsOpen(false)} />
    <View className="max-h-3/4 gap-sp-2 rounded-r-sheet bg-surface p-sp-4 shadow-sheet">
     {label ? <Text className="text-fs-h3 text-text-primary">{label}</Text> : null}
     <ScrollView>{options.map((option) => { const active = option.value === value; return <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ disabled: Boolean(option.disabled), selected: active }} disabled={option.disabled} onPress={() => choose(option)} className={`min-h-sp-12 flex-row items-center justify-between rounded-r-control px-sp-4 py-sp-3 ${option.disabled ? 'opacity-50' : ''}`}>
      <Text className="text-fs-body text-text-primary">{option.label}</Text>{active ? <Icon name="check" /> : null}
     </Pressable>; })}</ScrollView>
    </View>
   </View>
  </Modal>
 </View>;
}

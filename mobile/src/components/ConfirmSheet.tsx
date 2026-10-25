import * as React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from './Button';

export interface ConfirmSheetProps { title: string; body?: string; confirm: string; cancel: string; destructive?: boolean; onConfirm?: () => void; onCancel?: () => void; children?: React.ReactNode; }
export function ConfirmSheet({ title, body, confirm, cancel, destructive, onConfirm, onCancel, children }: ConfirmSheetProps) {
 return <Modal transparent animationType="slide" visible={true} onRequestClose={onCancel}><View className="flex-1 justify-end bg-overlay"><Pressable className="absolute inset-0" onPress={onCancel} /><View className="gap-sp-4 rounded-r-sheet bg-surface p-sp-6 shadow-sheet"><Text className="text-text-primary text-fs-h3">{title}</Text>{body != null && <Text className="text-text-secondary text-fs-body">{body}</Text>}{children}<View className="flex-row gap-sp-3"><Button variant="ghost" style={{ flex: 1 }} onClick={onCancel}>{cancel}</Button><Button variant={destructive ? "destructive" : "primary"} style={{ flex: 1 }} onClick={onConfirm}>{confirm}</Button></View></View></View></Modal>;
}

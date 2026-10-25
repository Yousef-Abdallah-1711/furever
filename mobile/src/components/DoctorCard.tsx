import { Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { Card } from './Card';
export interface DoctorCardProps { name: string; specialty?: string; experience?: string; photo?: string; onClick?: () => void; selected?: boolean; }
export function DoctorCard({ name, specialty, experience, photo, onClick, selected = false }: DoctorCardProps) {
 const details = [specialty, experience].filter(Boolean).join(' · ');
 return <Card tint={selected} onClick={onClick}><View className="flex-row items-center"><View className="me-sp-3"><Avatar src={photo} name={name} size={48} /></View><View className="flex-1"><Text className="text-fs-h3 font-semibold text-text-primary">{name}</Text>{details ? <Text className="text-fs-body text-text-secondary">{details}</Text> : null}</View></View></Card>;
}

import { useState } from 'react';
import type React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/Avatar';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { Chip } from '@/components/Chip';
import { ClinicCard } from '@/components/ClinicCard';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { DateField } from '@/components/DateField';
import { DoctorCard } from '@/components/DoctorCard';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Input } from '@/components/Input';
import { ListRow } from '@/components/ListRow';
import { OtpInput } from '@/components/OtpInput';
import { PetCard } from '@/components/PetCard';
import { PhaseTag } from '@/components/PhaseTag';
import { PhoneInput } from '@/components/PhoneInput';
import { Rating } from '@/components/Rating';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { Select } from '@/components/Select';
import { Skeleton } from '@/components/Skeleton';
import { SlotChip } from '@/components/SlotChip';
import { StatusBadge } from '@/components/StatusBadge';
import { Stepper } from '@/components/Stepper';
import { Toast } from '@/components/Toast';

const noop = () => {};
export default function GalleryScreen() {
 const { locale, setLocale } = useLocale();
 const { theme, setTheme } = useTheme();
 const dark = theme === 'dark';
 const [rating, setRating] = useState(3);
 const [phone, setPhone] = useState('100 123 4567');
 const [otp, setOtp] = useState('123');
 const [search, setSearch] = useState('vaccination');
 const [selection, setSelection] = useState('general');
 const [date, setDate] = useState('2026-10-25');
 const [confirmVisible, setConfirmVisible] = useState(false);
 const section = (title: string, children: React.ReactNode) => <View className="gap-sp-3"><Text className="mt-sp-6 text-fs-h2 text-text-primary">{title}</Text>{children}</View>;
 return <View className={'flex-1 bg-background ' + (dark ? 'dark' : '')} data-theme={theme}>
  <ScrollView className="flex-1" contentContainerClassName="gap-sp-4 p-sp-4">
   <Text className="text-fs-h1 text-text-primary">Mobile component gallery</Text>
   <View className="flex-row gap-sp-4">
    <Pressable testID="locale-switch" accessibilityRole="button" onPress={() => void setLocale(locale === 'en' ? 'ar' : 'en')}><Text className="text-text-primary">{locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}</Text></Pressable>
    <Pressable testID="theme-switch" accessibilityRole="button" onPress={() => void setTheme(dark ? 'light' : 'dark')}><Text className="text-text-primary">{dark ? 'Switch to light' : 'Switch to dark'}</Text></Pressable>
   </View>
   {section('Core', <View className="gap-sp-4">
    <View className="flex-row gap-sp-3"><Avatar name="Maya Hassan" /><Avatar name="Maya Hassan" src="https://images.unsplash.com/photo-1543852786-1cf6624b9987" /></View>
    <View className="gap-sp-2"><Banner tone="info">Clinic hours updated</Banner><Banner tone="warning">Appointment reminder</Banner><Banner tone="danger">Payment needs attention</Banner><Banner tone="success">Profile saved</Banner></View>
    <View className="flex-row flex-wrap gap-sp-2"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Destructive</Button><Button variant="outline">Outline</Button><Button loading>Loading</Button><Button disabled>Disabled</Button></View>
    <View className="gap-sp-2"><Card><Text className="text-text-primary">Plain card</Text></Card><Card tint><Text className="text-text-primary">Tinted card</Text></Card></View>
    <View className="flex-row gap-sp-2"><Chip on>Selected</Chip><Chip>Unselected</Chip><Chip icon="heart" on>Favorite</Chip></View>
    <View className="gap-sp-2"><EmptyState icon="calendar" title="No appointments" body="Upcoming visits appear here." /><EmptyState icon="circle-alert" tone="danger" title="Unable to load" body="Please try again." /></View>
    <View className="flex-row gap-sp-4"><Icon name="calendar" /><Icon name="star" /><Icon name="chevron-left" /></View>
    <View className="flex-row gap-sp-3"><IconButton icon="bell" label="Notifications" /><IconButton icon="settings" label="Settings" plain /><IconButton icon="heart" label="Favorites" badge={3} /></View>
    <View className="gap-sp-3"><Input label="Name" placeholder="Enter your name" /><Input label="Email" error="Enter a valid email" value="not-an-email" /><Input label="Search" icon="search" placeholder="Find a clinic" /></View>
    <View className="flex-row gap-sp-3"><PhaseTag /><PhaseTag phase={3} /></View>
    <View className="gap-sp-2"><Rating value={4} /><Rating value={rating} onChange={setRating} /></View>
    <View className="flex-row gap-sp-3"><Skeleton /><Skeleton w="50%" /></View>
    <View className="flex-row flex-wrap gap-sp-2">{(['pending','confirmed','checked_in','in_progress','completed','cancelled','no_show','up_to_date','due_soon','overdue','verified','self_reported'] as const).map(status => <StatusBadge key={status} status={status}>{status.replace('_', ' ')}</StatusBadge>)}</View>
   </View>)}
   {section('Domain', <View className="gap-sp-3">
    <ClinicCard name="Paws & Care Clinic" distance="1.2 km" rating="4.9 (128)" next="Today, 3:30 PM" nextLabel="Next available" badge={<StatusBadge status="verified">Verified</StatusBadge>} />
    <Button onClick={() => setConfirmVisible(true)}>Show confirm sheet</Button>
    <PetCard name="Luna" breed="Golden Retriever" age="3 years" status="due_soon" statusLabel="Due soon" />
    <View className="flex-row gap-sp-2"><SlotChip time="9:30 AM" on /><SlotChip time="10:00 AM" /></View>
    <Stepper steps={['Pet','Service','Time','Confirm']} current={1} />
   </View>)}
   {section('Built-from-pattern', <View className="gap-sp-4">
    <PhoneInput label="Phone number" value={phone} onChange={event => setPhone(event.target.value)} />
    <OtpInput label="Verification code" value={otp} onChange={setOtp} />
    <SearchBar value={search} onChange={event => setSearch(event.target.value)} onClear={() => setSearch('')} placeholder="Search services" />
    <Select label="Appointment type" value={selection} onChange={setSelection} options={[{value:'general',label:'General checkup'},{value:'dental',label:'Dental care'},{value:'grooming',label:'Grooming'}]} />
    <DateField label="Appointment date" value={date} onChange={setDate} placeholder="Choose a date" />
    <View className="flex-row gap-sp-3"><CategoryCard icon="stethoscope" label="Health" /><CategoryCard icon="heart" label="Urgent care" tone="danger" /></View>
    <View className="gap-sp-2"><DoctorCard name="Dr. Sara Ahmed" specialty="Veterinarian" experience="8 years experience" /><DoctorCard name="Dr. Omar Khalil" specialty="Veterinarian" experience="12 years experience" selected /></View>
    <View className="rounded-r-card bg-surface px-sp-4"><ListRow icon="calendar" label="Upcoming visit" value="Today, 3:30 PM" /><ListRow icon="map-pin" label="Clinic location" value="Downtown" /><ListRow label="Contact clinic" value="Available now" showDivider={false} /></View>
    <Toast message="Your changes have been saved" tone="success" />
    <View className="gap-sp-3"><ScreenHeader title="Appointments" sub="Your upcoming visits" back={noop} /><ScreenHeader title="Book an appointment" phase /></View>
   </View>)}
  </ScrollView>
  {confirmVisible ? <ConfirmSheet title="Confirm appointment" body="Would you like to book this visit?" confirm="Confirm" cancel="Cancel" onConfirm={() => setConfirmVisible(false)} onCancel={() => setConfirmVisible(false)} /> : null}
 </View>;
}
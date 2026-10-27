import { Stack } from 'expo-router';
import { ProtectedRouteLayout } from '@/components/ProtectedRouteLayout';

export default function PetsLayout() {
  return <ProtectedRouteLayout><Stack screenOptions={{ headerShown: false }} /></ProtectedRouteLayout>;
}

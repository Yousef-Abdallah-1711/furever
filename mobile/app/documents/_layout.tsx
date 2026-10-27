import { Stack } from 'expo-router';
import { ProtectedRouteLayout } from '@/components/ProtectedRouteLayout';

export default function DocumentsLayout() {
  return <ProtectedRouteLayout><Stack screenOptions={{ headerShown: false }} /></ProtectedRouteLayout>;
}

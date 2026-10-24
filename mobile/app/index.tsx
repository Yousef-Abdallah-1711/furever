import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="rounded-r-card bg-primary p-sp-4">
        <Text className="text-on-primary">FurEver token smoke SDK 57 workspace</Text>
      </View>
    </View>
  );
}

import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // O la librería de iconos que uses
import { useRouter } from 'expo-router';

const HelpButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push('/help')}
      activeOpacity={0.7}
      className="elevation-5 absolute bottom-10 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#4DB6AC] shadow-lg">
      <Text className="text-2xl font-bold text-white">?</Text>
      {/* O si prefieres un icono real:
      <FontAwesome name="question" size={24} color="white" />
      */}
    </TouchableOpacity>
  );
};

export default HelpButton;

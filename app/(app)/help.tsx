import { Linking, View, Text, TouchableOpacity, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { BASE_URL } from '@/constants';

const developers = [
  {
    name: 'Leonela González',
    phone: '0414-7085241',
  },
  {
    name: 'Pavid Bracamonte',
    phone: '0426-2445359',
  },
  {
    name: 'Pedro González',
    phone: '0424-7159785',
  },
];

export default function HelpScreen() {
  return (
    <ScreenLayout>
      <ScrollView className="w-full px-4 py-6">
        <View className="mb-6 min-w-[280px] flex-1 rounded-[32px]  bg-white bg-gradient-to-r from-pink-100 via-white to-slate-50 p-6 dark:bg-primary-dark ">
          <Text className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Centro de soporte</Text>
          <Text className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Encuentra la documentación esencial, casos de uso y opciones de contacto técnico para Colores y Detalles.
          </Text>
        </View>

        <View className="mb-6 flex-row flex-wrap items-start justify-between gap-6">
          <View className="min-w-[280px] flex-1 rounded-[32px] bg-white p-6 shadow-lg shadow-slate-200/80 dark:bg-primary-dark">
            <Text className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">Manual técnico</Text>
            <View className="mb-4 rounded-[30px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-primary-dark">
              <View className="h-48 rounded-[24px] bg-white shadow-sm dark:bg-primary-dark">
                <Image source={require('../../assets/manual.png')} className="h-48 w-full rounded-[24px]" />
              </View>
            </View>
            <Text className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              La guía de desarrollo y mantenimiento del sistema, diseñada para soporte técnico y desarrolladores.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(BASE_URL + '/docs/manual.pdf')}
              className="inline-flex rounded-full bg-rose-500 px-5 py-3 shadow-md shadow-rose-200/50">
              <Text className="text-base font-semibold text-white">Descargar manual en PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="space-y-5">
          <View className="flex gap-4">
            {developers.map((developer) => (
              <View key={developer.name} className="rounded-[32px] bg-white p-6 shadow-lg shadow-slate-200/80 dark:bg-primary-dark">
                <View className="flex-row items-center gap-4">
                  <View className="h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                    <Text className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                      {developer.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-xl font-semibold text-slate-900 dark:text-white">{developer.name}</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="call-outline" size={16} color="#64748b" />
                      <Text className="text-sm text-slate-500 dark:text-slate-400">{developer.phone}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

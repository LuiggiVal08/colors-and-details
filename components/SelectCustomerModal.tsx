import { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import clientService from '@/services/client.service';
import { impactLight } from '@/helpers/haptics';

interface SelectCustomerModalProps {
  onDismiss: () => void;
  onSelect: (cliente: { id: number; nombre: string }) => void;
}

export interface SelectCustomerModalRef {
  present: () => void;
  dismiss: () => void;
}

const SelectCustomerModal = forwardRef<SelectCustomerModalRef, SelectCustomerModalProps>(
  ({ onDismiss, onSelect }, ref) => {
    const colorScheme = useColorScheme();
    const [search, setSearch] = useState('');

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['50%', '95%'], []);

    useImperativeHandle(ref, () => ({
      present: () => {
        setSearch('');
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    const { data: clients, isLoading } = useQuery({
      queryKey: ['customers', 'search', search],
      queryFn: () => clientService.search(search, 1, 30),
      enabled: search.length > 0,
    });

    const results = useMemo(() => {
      if (search.length === 0) return [];
      return clients || [];
    }, [clients, search.length]);

    const handleSelect = (client: (typeof results)[0]) => {
      impactLight();
      const nombre = `${client.nombre} ${client.apellido}`;
      onSelect({ id: Number(client.id), nombre });
      bottomSheetRef.current?.dismiss();
    };

    const handleGeneric = () => {
      impactLight();
      onSelect({ id: 0, nombre: 'Cliente Genérico' });
      bottomSheetRef.current?.dismiss();
    };

    const isDark = colorScheme === 'dark';

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        keyboardBehavior="extend"
        enablePanDownToClose={false}
        onDismiss={onDismiss}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}
        backgroundStyle={{
          backgroundColor: isDark ? '#1E293B' : '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 48, height: 5 }}>
        <BottomSheetScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">Seleccionar Cliente</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleGeneric}
            className="mb-4 flex-row items-center gap-3 rounded-2xl border-2 border-dashed border-[#4DB6AC] bg-[#4DB6AC]/5 p-4">
            <Ionicons name="person" size={24} color="#4DB6AC" />
            <Text className="font-semibold text-[#4DB6AC]">Cliente Genérico</Text>
          </TouchableOpacity>

          <View className="mb-4 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-primary-dark">
            <Ionicons name="search" size={20} color="#94A3B8" />
            <BottomSheetTextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre o cédula..."
              className="ml-3 flex-1 text-base text-slate-900 dark:text-white"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#4DB6AC" className="py-8" />
          ) : (
            <FlashList
              data={results}
              estimatedItemSize={70}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className="mb-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                      <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {item.nombre.charAt(0)}
                        {item.apellido.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-semibold text-slate-900 dark:text-white">
                        {item.nombre} {item.apellido}
                      </Text>
                      <Text className="text-sm text-slate-500 dark:text-slate-400">{item.cedula}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="py-8">
                  <Text className="text-center text-slate-500 dark:text-slate-400">
                    {search.length > 0 ? 'Sin resultados' : 'Escribe para buscar...'}
                  </Text>
                </View>
              }
            />
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

SelectCustomerModal.displayName = 'SelectCustomerModal';

export default SelectCustomerModal;

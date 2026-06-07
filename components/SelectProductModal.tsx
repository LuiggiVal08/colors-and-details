import { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import productService from '@/services/product.service';
import { useExchangeRateStore } from '@/store/exchangeRate';
import type { CartItem } from '@/feature/shopping/types';
import { impactLight, selection } from '@/helpers/haptics';

interface SelectProductModalProps {
  onDismiss: () => void;
  onSelect: (item: CartItem) => void;
  existingIds?: number[];
}

export interface SelectProductModalRef {
  present: () => void;
  dismiss: () => void;
}

const SelectProductModal = forwardRef<SelectProductModalRef, SelectProductModalProps>(
  ({ onDismiss, onSelect, existingIds }, ref) => {
    const colorScheme = useColorScheme();
    const [search, setSearch] = useState('');
    const [selectedQty, setSelectedQty] = useState<Record<string, number>>({});
    const tasa = useExchangeRateStore((state) => state.tasa);

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['50%', '95%'], []);

    useImperativeHandle(ref, () => ({
      present: () => {
        setSearch('');
        setSelectedQty({});
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    const { data: products, isLoading } = useQuery({
      queryKey: ['products', 'pos', search],
      queryFn: () => productService.getAll({ search, limit: 50 }),
    });

    const filtered = useMemo(() => {
      if (!products) return [];
      return products.filter((p) => !existingIds?.includes(Number(p.id)));
    }, [products, existingIds]);

    const handleSelectProduct = (product: (typeof filtered)[0]) => {
      impactLight();
      const id = Number(product.id);
      const qty = selectedQty[id] || 1;
      onSelect({
        producto_id: id,
        codigo: product.codigo,
        nombre: product.nombre,
        cantidad: qty,
        precioUnitario: product.precio,
        subtotal: product.precio * qty,
        stockDisponible: product.stock,
      });
      setSelectedQty((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
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
            <Text className="text-xl font-bold text-slate-900 dark:text-white">Seleccionar Producto</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="mb-4 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-primary-dark">
            <Ionicons name="search" size={20} color="#94A3B8" />
            <BottomSheetTextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre o código..."
              className="ml-3 flex-1 text-base text-slate-900 dark:text-white"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#94A3B8"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#4DB6AC" className="py-8" />
          ) : (
            <FlashList
              data={filtered}
              estimatedItemSize={80}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const id = Number(item.id);
                const qty = selectedQty[id] || 1;
                return (
                  <View className="mb-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
                    <View className="flex-row items-center justify-between">
                      <View className="min-w-0 flex-1">
                        <Text className="text-base font-semibold text-slate-900 dark:text-white">{item.nombre}</Text>
                        <Text className="text-sm text-slate-500 dark:text-slate-400">Código: {item.codigo}</Text>
                        <View className="mt-1 flex-row items-center gap-4">
                          <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                            ${item.precio.toLocaleString('es-VE')}
                          </Text>
                          {tasa && (
                            <Text className="text-sm text-slate-500 dark:text-slate-400">
                              Bs. {(item.precio * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </Text>
                          )}
                          <Text
                            className={`text-xs ${item.stock < 5 ? 'font-semibold text-rose-600' : 'text-slate-500 dark:text-slate-400'}`}>
                            Stock: {item.stock}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end gap-2">
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => {
                              selection();
                              setSelectedQty((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }));
                            }}
                            className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Ionicons name="remove" size={16} color="#475569" />
                          </TouchableOpacity>
                          <Text className="min-w-[24px] text-center font-semibold text-slate-900 dark:text-white">{qty}</Text>
                          <TouchableOpacity
                            onPress={() => {
                              selection();
                              if (qty < item.stock) {
                                setSelectedQty((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
                              }
                            }}
                            className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Ionicons name="add" size={16} color="#475569" />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleSelectProduct(item)}
                          disabled={item.stock < 1}
                          className="rounded-full bg-[#4DB6AC] px-4 py-1.5">
                          <Text className="text-xs font-semibold text-white">Agregar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View className="py-8">
                  <Text className="text-center text-slate-500 dark:text-slate-400">
                    {search ? 'Sin resultados' : 'Cargando productos...'}
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

SelectProductModal.displayName = 'SelectProductModal';

export default SelectProductModal;

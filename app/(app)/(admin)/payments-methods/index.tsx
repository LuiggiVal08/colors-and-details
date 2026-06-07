import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent, View, Modal } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ExpandableFAB from '@/components/ExpandableFAB';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import BarToSearchPaymentMethod from '@/feature/payment-methods/components/BarToSearchPaymentMethod';
import ListPaymentMethods from '@/feature/payment-methods/components/ListPaymentMethods';
import paymentMethodService from '@/services/paymentMethod.service';
import debounce from 'lodash.debounce';
import type { PaymentMethod } from '@/types/paymentMethod';
import { EditPaymentMethodForm } from '@/feature/payment-methods/components/EditPaymentMethodForm';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function PaymentsMethodsScreen() {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

  // Valor animado que controla la posición del header.
  const headerTranslate = useSharedValue(0);
  // Ref para recordar la posición anterior del scroll.
  const lastScrollY = useRef(0);
  // En PaymentsMethodsScreen
  const [headerHeight, setHeaderHeight] = useState(0);

  const router = useRouter();

  const {
    data: paymentMethods = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['paymentMethods', search, tipo],
    queryFn: () =>
      search.trim() || tipo ? paymentMethodService.search(search.trim(), tipo) : paymentMethodService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const debouncedSetSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearch(query);
      }, 400),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setInputValue(text);
      debouncedSetSearch(text);
    },
    [debouncedSetSearch]
  );

  const handleTipoChange = useCallback((newTipo: string) => {
    setTipo(newTipo);
  }, []);

  const handleEdit = useCallback((paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Maneja eventos de scroll para animar el header.
  const scrollY = useSharedValue(0);

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      scrollY.value = currentY;
      const deltaY = currentY - lastScrollY.current;

      let targetTranslateY = Math.min(0, -currentY); // Sticky por defecto

      if (currentY >= headerHeight) {
        if (deltaY > 0) {
          targetTranslateY = -headerHeight; // Ocultar al bajar
        } else if (deltaY < 0) {
          targetTranslateY = 0; // Mostrar al subir
        } else {
          // Mantener el estado actual
          targetTranslateY = headerTranslate.value;
        }
      }

      const duration = currentY < headerHeight ? 0 : 180; // Instantáneo para sticky, animado para condicional
      headerTranslate.value = withTiming(targetTranslateY, { duration });

      lastScrollY.current = currentY;
    },
    [headerHeight, headerTranslate, scrollY]
  );

  // Estilo animado derivado del valor compartido.
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslate.value }],
    opacity: headerTranslate.value === 0 ? 1 : 0.95,
  }));

  return (
    <>
      <Stack.Screen options={{ title: 'Formas de pago' }} />
      <ScreenLayout scrollEnabled={false}>
        <View className="relative w-full flex-1">
          {/* Header animado con la barra de búsqueda y filtro. */}
          <Animated.View
            pointerEvents="box-none"
            style={animatedHeaderStyle}
            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
            className="absolute left-0 right-0 top-0 z-20">
            <BarToSearchPaymentMethod
              value={inputValue}
              onChangeText={handleSearchChange}
              tipo={tipo}
              onTipoChange={handleTipoChange}
            />
          </Animated.View>
          {isLoading ? (
            <View className="mt-36 px-4">
              <SkeletonLoader count={3} />
            </View>
          ) : error ? (
            <View className="mt-36 px-4">
              <ErrorRetryCard
                message="No se pudieron cargar los métodos de pago. Intenta de nuevo."
                onRetry={refetch}
              />
            </View>
          ) : (
            <ListPaymentMethods
              paddingTop={headerHeight}
              paymentMethods={paymentMethods}
              onEdit={handleEdit}
              onScroll={handleListScroll}
              refreshing={isRefetching}
              onRefresh={handleRefresh}
            />
          )}
        </View>
        <ExpandableFAB
          icon={<Ionicons name="add" size={24} color="white" />}
          label="Nuevo Método"
          tooltipText="Crear nuevo método de pago"
          onPress={() => router.push('/payments-methods/create')}
          delay={3500}
          bgColorClass="bg-[#4DB6AC]"
        />
        <Modal
          visible={!!editingPaymentMethod}
          animationType="slide"
          statusBarTranslucent={true}
          onDismiss={() => setEditingPaymentMethod(null)}
          onRequestClose={() => setEditingPaymentMethod(null)}>
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            <View className="flex-1">
              {editingPaymentMethod && (
                <EditPaymentMethodForm
                  initialData={editingPaymentMethod}
                  onClose={() => setEditingPaymentMethod(null)}
                  onSuccess={() => refetch()}
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScreenLayout>
    </>
  );
}

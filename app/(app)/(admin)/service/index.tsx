import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent, View, Modal } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ExpandableFAB from '@/components/ExpandableFAB';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import BarToSearchService from '@/feature/service/components/BarToSearchService';
import ListServices from '@/feature/service/components/ListServices';
import serviceService from '@/services/service.service';
import debounce from 'lodash.debounce';
import type { Servicio } from '@/types/service';
import { EditServiceForm } from '@/feature/service/components/EditServiceForm';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function ServicesScreen() {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  const headerTranslate = useSharedValue(0);
  const lastScrollY = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const router = useRouter();

  const {
    data: servicios = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['servicios', search],
    queryFn: () => (search.trim() ? serviceService.search(search.trim()) : serviceService.getAll()),
    staleTime: 5 * 60 * 1000,
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

  const handleEdit = useCallback((servicio: Servicio) => {
    setEditingServicio(servicio);
  }, []);

  const handlePress = useCallback(
    (servicio: Servicio) => {
      router.push(`/service/${servicio.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const scrollY = useSharedValue(0);

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      scrollY.value = currentY;
      const deltaY = currentY - lastScrollY.current;

      let targetTranslateY = Math.min(0, -currentY);

      if (currentY >= headerHeight) {
        if (deltaY > 0) {
          targetTranslateY = -headerHeight;
        } else if (deltaY < 0) {
          targetTranslateY = 0;
        } else {
          targetTranslateY = headerTranslate.value;
        }
      }

      const duration = currentY < headerHeight ? 0 : 180;
      headerTranslate.value = withTiming(targetTranslateY, { duration });

      lastScrollY.current = currentY;
    },
    [headerHeight, headerTranslate, scrollY]
  );

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslate.value }],
    opacity: headerTranslate.value === 0 ? 1 : 0.95,
  }));

  return (
    <>
      <Stack.Screen options={{ title: 'Servicios' }} />
      <ScreenLayout scrollEnabled={false}>
        <View className="relative w-full flex-1">
          <Animated.View
            pointerEvents="box-none"
            style={animatedHeaderStyle}
            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
            className="absolute left-0 right-0 top-0 z-20">
            <BarToSearchService value={inputValue} onChangeText={handleSearchChange} />
          </Animated.View>
          {isLoading ? (
            <View className="mt-36 px-4">
              <SkeletonLoader count={3} />
            </View>
          ) : error ? (
            <View className="mt-36 px-4">
              <ErrorRetryCard message="No se pudieron cargar los servicios. Intenta de nuevo." onRetry={refetch} />
            </View>
          ) : (
            <ListServices
              paddingTop={headerHeight}
              servicios={servicios}
              onEdit={handleEdit}
              onPress={handlePress}
              onScroll={handleListScroll}
              refreshing={isRefetching}
              onRefresh={handleRefresh}
            />
          )}
        </View>
        <ExpandableFAB
          icon={<Ionicons name="add" size={24} color="white" />}
          label="Nuevo Servicio"
          tooltipText="Crear nuevo servicio"
          onPress={() => router.push('/service/create')}
          delay={3500}
          bgColorClass="bg-[#4DB6AC]"
        />
        <Modal
          visible={!!editingServicio}
          animationType="slide"
          statusBarTranslucent={true}
          onDismiss={() => setEditingServicio(null)}
          onRequestClose={() => setEditingServicio(null)}>
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            <View className="flex-1">
              {editingServicio && (
                <EditServiceForm
                  initialData={editingServicio}
                  onClose={() => setEditingServicio(null)}
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

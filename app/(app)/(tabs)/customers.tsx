import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ExpandableFAB from '@/components/ExpandableFAB';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import BarToSearchClient from '@/feature/clients/components/BarToSearchClient';
import ListClients from '@/feature/clients/components/ListClients';
import clientService from '@/services/client.service';
import debounce from 'lodash.debounce';
import type { Client } from '@/types/client';
import { Format } from '@/helpers/Formats';

export default function CustomersScreen() {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const headerTranslate = useSharedValue(0);
  const lastScrollY = useRef(0);
  const router = useRouter();

  const {
    data: clients = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => (search.trim() ? clientService.search(search.trim()) : clientService.getAll()),
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
      let formattedValue = text;

      // 1. Verificamos si el string contiene solo números para aplicar formato DNI
      // Usamos regex /^\d+$/ para saber si son solo dígitos
      if (/\d/.test(text) && text.length > 0) {
        formattedValue = Format.dni(text);
      }
      // 2. Si no son solo números, asumimos que es un nombre
      else if (text.length > 0) {
        formattedValue = Format.name(text);
      }

      setInputValue(formattedValue);
      debouncedSetSearch(formattedValue);
    },
    [debouncedSetSearch]
  );

  const handleClientPress = useCallback(
    (client: Client) => {
      router.push(`/customers/${client.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const deltaY = currentY - lastScrollY.current;

      if (currentY <= 0) {
        headerTranslate.value = withTiming(0, { duration: 180 });
      } else if (deltaY > 0) {
        headerTranslate.value = withTiming(-110, { duration: 180 });
      } else if (deltaY < 0) {
        headerTranslate.value = withTiming(0, { duration: 180 });
      }

      lastScrollY.current = currentY;
    },
    [headerTranslate]
  );

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslate.value }],
    opacity: headerTranslate.value === 0 ? 1 : 0.95,
  }));

  return (
    <ScreenLayout scrollEnabled={false}>
      <View className="relative w-full  flex-1">
        <Animated.View style={animatedHeaderStyle} className="absolute left-0 right-0 top-0 z-20">
          <BarToSearchClient value={inputValue} onChangeText={handleSearchChange} />
        </Animated.View>

        {isLoading ? (
          <View className="mt-8 items-center justify-center">
            <ActivityIndicator size="large" color="#4DB6AC" />
          </View>
        ) : (
          <ListClients
            clients={clients}
            onClientPress={handleClientPress}
            onScroll={handleListScroll}
            refreshing={isRefetching}
            onRefresh={handleRefresh}
          />
        )}
        {error ? (
          <Text className="mt-6 text-center text-sm text-rose-600">
            No se pudieron cargar los clientes. Intenta de nuevo.
          </Text>
        ) : null}
      </View>
      <ExpandableFAB
        icon={<Ionicons name="add" size={24} color="white" />}
        label="Nuevo Cliente"
        tooltipText="Crear nuevo cliente"
        onPress={() => router.push('/customers/create')}
        delay={3500}
        bgColorClass="bg-[#4DB6AC]"
      />
    </ScreenLayout>
  );
}

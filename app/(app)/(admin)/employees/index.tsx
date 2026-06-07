import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import ExpandableFAB from '@/components/ExpandableFAB';
import { Ionicons } from '@expo/vector-icons';
import BarToSearchEmployee from '@/feature/employees/components/BarToSearchEmployee';
import { EmployeeCard } from '@/feature/employees/components/EmployeeCard';
import employeeService from '@/services/employee.service';
import debounce from 'lodash.debounce';
import type { Employee } from '@/types/employee';
import { Format } from '@/helpers/Formats';

export default function EmployeeManagementScreen() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const headerTranslate = useSharedValue(0);
  const lastScrollY = useRef(0);

  const {
    data: employees = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['employees', search],
    queryFn: () => (search.trim() ? employeeService.search(search.trim()) : employeeService.getAll()),
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

  const handleEmployeePress = useCallback(
    (employee: Employee) => {
      router.push(`/employees/${employee.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => await refetch(), [refetch]);

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const deltaY = currentY - lastScrollY.current;

      if (currentY <= 0) {
        headerTranslate.value = withTiming(0, { duration: 180 });
      } else if (deltaY > 0 && currentY > 50) {
        headerTranslate.value = withTiming(-120, { duration: 180 });
      } else if (deltaY < 0) {
        headerTranslate.value = withTiming(0, { duration: 180 });
      }

      lastScrollY.current = currentY;
    },
    [headerTranslate]
  );

  const sections = useMemo(
    () => [
      {
        title: 'Empleados activos',
        data: employees.filter((item) => item.activo),
      },
      {
        title: 'Empleados inactivos',
        data: employees.filter((item) => !item.activo),
      },
    ],
    [employees]
  );

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: headerTranslate.value === 0 ? 80 : 0,
    opacity: headerTranslate.value === 0 ? 1 : 0,
    overflow: 'hidden',
  }));

  if (error) {
    return (
      <ScreenLayout>
        <View className="flex-1 items-center justify-center">
          <Text>Error al cargar empleados</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="text-blue-500">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Empleados' }} />
      <ScreenLayout scrollEnabled={false}>
        <View className="relative w-full flex-1">
          <Animated.View style={animatedHeaderStyle} className="absolute left-0 right-0 top-0 z-20">
            <BarToSearchEmployee value={inputValue} onChangeText={handleSearchChange} />
          </Animated.View>
          <View className="mt-16 w-full max-w-5xl px-4 py-6">
            <Card className="mb-6 p-5">
              <View className="gap-2">
                <Text className="text-lg font-semibold text-slate-900">Empleados registrados</Text>
                <Text className="text-sm text-slate-500">{employees.length} empleados en total.</Text>
              </View>
            </Card>
            {isLoading ? (
              <View className="mt-8 items-center justify-center">
                <ActivityIndicator size="large" color="#4DB6AC" />
              </View>
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderSectionHeader={({ section: { title } }) => (
                  <Text className="mb-3 mt-6 text-xl font-bold text-slate-900">{title}</Text>
                )}
                renderItem={({ item }) => <EmployeeCard employee={item} onPress={() => handleEmployeePress(item)} />}
                contentContainerStyle={{ paddingBottom: 120 }}
                ItemSeparatorComponent={() => <View className="h-3" />}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
                onScroll={handleListScroll}
                scrollEventThrottle={16}
              />
            )}
          </View>
        </View>
        <ExpandableFAB
          icon={<Ionicons name="add" size={24} color="white" />}
          label="Crear empleado"
          tooltipText="Crear nuevo empleado"
          onPress={() => router.push('/employees/create')}
          delay={3500}
        />
      </ScreenLayout>
    </>
  );
}

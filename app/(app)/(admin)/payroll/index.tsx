import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import ExpandableFAB from '@/components/ExpandableFAB';
import nominaService from '@/services/nomina.service';
import type { Nomina } from '@/types/nomina';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ControlledInput } from '@/components/ControlledInput';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-paper';
import { getSocket } from '@/services/socket';

const generateSchema = z.object({
  periodo_inicio: z.string().min(1, 'Requerido').regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  periodo_fin: z.string().min(1, 'Requerido').regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
});

type GenerateFormData = z.infer<typeof generateSchema>;

const estadoConfig: Record<string, { label: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  completed: { label: 'Completada', bg: 'bg-emerald-100', icon: 'checkmark-circle' },
  processing: { label: 'En proceso', bg: 'bg-amber-100', icon: 'time' },
  failed: { label: 'Fallida', bg: 'bg-red-100', icon: 'close-circle' },
};

export default function PayrollListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const { data: nominas = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['nominas'],
    queryFn: () => nominaService.getAll(),
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['nominas'] });
      setSnackbar({ visible: true, message: 'Nómina generada exitosamente' });
    };

    socket.on('nomina_generada', handler);
    return () => { socket.off('nomina_generada', handler); };
  }, [queryClient]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    mode: 'onChange',
  });

  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startPolling = () => {
    let attempts = 0;
    const maxAttempts = 12;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await nominaService.getAll();
        const processing = res.filter((n) => n.estado === 'processing');
        if (processing.length === 0 || attempts >= maxAttempts) {
          if (pollRef.current) clearInterval(pollRef.current);
          queryClient.invalidateQueries({ queryKey: ['nominas'] });
          if (attempts >= maxAttempts) {
            setSnackbar({ visible: true, message: 'La nómina podría estar lista, refresca la lista' });
          }
        }
      } catch {
        if (attempts >= maxAttempts && pollRef.current) {
          clearInterval(pollRef.current);
        }
      }
    }, 5000);
  };

  const generateMutation = useMutation({
    mutationFn: (data: GenerateFormData) => nominaService.generate(data),
    onSuccess: () => {
      setShowGenerate(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['nominas'] });
      setSnackbar({ visible: true, message: 'Nómina en proceso de generación...' });
      startPolling();
    },
    onError: (error: Error) => {
      setSnackbar({ visible: true, message: error.message || 'Error al generar nómina' });
    },
  });

  const onSubmitGenerate = (data: GenerateFormData) => {
    generateMutation.mutate(data);
  };

  const renderItem = useCallback(
    ({ item }: { item: Nomina }) => {
      const estado = estadoConfig[item.estado] || estadoConfig.failed;
      return (
        <TouchableOpacity onPress={() => router.push(`/payroll/${item.id}`)}>
          <Card className="mb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">
                  {item.periodo_inicio} — {item.periodo_fin}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <View className={`rounded-full px-2 py-0.5 ${estado.bg}`}>
                    <Text className="text-xs font-medium capitalize">{estado.label}</Text>
                  </View>
                  <Text className="text-xs text-slate-500">
                    {item.total_empleados} empleados
                  </Text>
                </View>
                <Text className="mt-1 text-sm text-slate-600">
                  Bs. {Number(item.total_monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [router]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Nóminas' }} />
      <ScreenLayout scrollEnabled={false}>
        {isLoading ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4DB6AC" />
          </View>
        ) : (
          <FlatList
            data={nominas}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            className="w-full max-w-5xl px-4 py-6"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListHeaderComponent={
              <View className="mb-4">
                <Text className="text-2xl font-bold text-slate-900">Nóminas Generadas</Text>
              </View>
            }
            ListEmptyComponent={
              <View className="mt-20 items-center justify-center">
                <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
                <Text className="mt-4 text-center text-lg font-medium text-slate-600">
                  No hay nóminas generadas
                </Text>
                <Text className="mt-2 text-center text-sm text-slate-500">
                  Genera la primera nómina para un período
                </Text>
              </View>
            }
          />
        )}
        <ExpandableFAB
          icon={<Ionicons name="add" size={24} color="white" />}
          label="Generar Nómina"
          tooltipText="Generar nueva nómina"
          onPress={() => setShowGenerate(true)}
          delay={3500}
        />
      </ScreenLayout>

      <Modal visible={showGenerate} animationType="slide" statusBarTranslucent={true}>
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
              <TouchableOpacity onPress={() => { setShowGenerate(false); reset(); }}>
                <Text className="text-[#4DB6AC]">Cancelar</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold">Generar Nómina</Text>
              <TouchableOpacity
                onPress={handleSubmit(onSubmitGenerate)}
                disabled={!isValid || generateMutation.isPending}>
                <Text className="font-bold text-[#4DB6AC]">
                  {generateMutation.isPending ? 'Generando...' : 'Generar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <Card className="mb-6">
                <Text className="mb-4 text-xl font-bold text-slate-900">Período de Nómina</Text>
                <ControlledInput
                  name="periodo_inicio"
                  label="Fecha Inicio (YYYY-MM-DD)"
                  control={control}
                  error={errors.periodo_inicio?.message}
                  placeholder="2024-11-01"
                />
                <ControlledInput
                  name="periodo_fin"
                  label="Fecha Fin (YYYY-MM-DD)"
                  control={control}
                  error={errors.periodo_fin?.message}
                  placeholder="2024-11-30"
                />
              </Card>

              {generateMutation.isError && (
                <View className="mb-4 rounded-lg bg-red-50 p-3">
                  <Text className="text-sm text-red-600">
                    {generateMutation.error instanceof Error
                      ? generateMutation.error.message
                      : 'Error al generar nómina'}
                  </Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={4000}
        action={{ label: 'OK', onPress: () => setSnackbar({ visible: false, message: '' }) }}>
        {snackbar.message}
      </Snackbar>
    </>
  );
}

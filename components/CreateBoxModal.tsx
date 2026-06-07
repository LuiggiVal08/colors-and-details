import { useState, useMemo, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Keyboard, useColorScheme } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import boxRegisterService from '@/services/boxRegister.service';
import type { BoxRegister } from '@/types/boxRegister';
import { impactLight } from '@/helpers/haptics';

interface CreateBoxModalProps {
  onCreated?: () => void;
}

export interface CreateBoxModalRef {
  present: () => void;
  dismiss: () => void;
}

const CreateBoxModal = forwardRef<CreateBoxModalRef, CreateBoxModalProps>(({ onCreated }, ref) => {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [montoInicial, setMontoInicial] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%', '95%'], []);
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();

  useImperativeHandle(ref, () => ({
    present: () => {
      setNombre('');
      setUbicacion('');
      setMontoInicial('');
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
    },
  }));

  const createMutation = useMutation({
    mutationFn: (payload: Partial<BoxRegister>) =>
      boxRegisterService.create(payload),
    onSuccess: () => {
      impactLight();
      Keyboard.dismiss();
      queryClient.invalidateQueries({ queryKey: ['box-register'] });
      onCreated?.();
      bottomSheetRef.current?.dismiss();
      setSnackbar({ visible: true, message: 'Caja creada' });
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al crear la caja' });
    },
  });

  const handleCreate = useCallback(() => {
    if (!nombre.trim()) {
      setSnackbar({ visible: true, message: 'El nombre es obligatorio' });
      return;
    }
    Keyboard.dismiss();
    createMutation.mutate({
      nombre: nombre.trim(),
      ubicacion: ubicacion.trim() || undefined,
      descripcion: ubicacion.trim() || undefined,
      monto_inicial: parseFloat(montoInicial) || 0,
    });
  }, [nombre, ubicacion, montoInicial, createMutation]);

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        keyboardBehavior="extend"
        enablePanDownToClose={false}
        enableDismissOnClose={false}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}
        backgroundStyle={{
          backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#fff',
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
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              Nueva Caja
            </Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Nombre
            </Text>
            <BottomSheetTextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre de la caja"
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-primary-dark dark:text-white"
            />
          </View>

          <View className="mb-3">
            <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Ubicación
            </Text>
            <BottomSheetTextInput
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholder="Ej: oficina, local, etc."
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-primary-dark dark:text-white"
            />
          </View>

          <View className="mb-6">
            <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Monto Inicial (Bs.)
            </Text>
            <BottomSheetTextInput
              value={montoInicial}
              onChangeText={setMontoInicial}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-primary-dark dark:text-white"
            />
          </View>

          <View className="flex-row gap-3 border-t border-slate-100 pt-3 dark:border-slate-700">
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.dismiss()}
              className="flex-1 items-center rounded-2xl border border-slate-200 py-3.5 dark:border-slate-600">
              <Text className="font-medium text-slate-600 dark:text-slate-300">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreate}
              disabled={createMutation.isPending}
              className={`flex-1 items-center rounded-2xl py-3.5 ${
                createMutation.isPending ? 'bg-slate-300 dark:bg-slate-600' : 'bg-info'
              }`}>
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-bold text-white">Crear</Text>
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-error">
        {snackbar.message}
      </Snackbar>
    </>
  );
});

CreateBoxModal.displayName = 'CreateBoxModal';

export default CreateBoxModal;

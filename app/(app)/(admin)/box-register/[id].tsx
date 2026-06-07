import { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, RefreshControl, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, Stack } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Menu, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import boxRegisterService from '@/services/boxRegister.service';
import cashMovementService from '@/services/cashMovement.service';
import { useBoxRegisterStore } from '@/store/boxRegister';

import EditBoxModal, { type EditBoxModalRef } from '@/components/EditBoxModal';
import { impactLight, selection } from '@/helpers/haptics';

export default function BoxControlScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { loadActiveBox } = useBoxRegisterStore();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [refreshing, setRefreshing] = useState(false);
  const editModalRef = useRef<EditBoxModalRef>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [cierreMonto, setCierreMonto] = useState('');
  const [showMovModal, setShowMovModal] = useState(false);
  const [movTipo, setMovTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [movMonto, setMovMonto] = useState('');
  const [movDesc, setMovDesc] = useState('');

  const { data: box, isLoading: boxLoading } = useQuery({
    queryKey: ['box-register', id],
    queryFn: () => boxRegisterService.getById(id!),
    enabled: !!id,
  });

  const { data: controles } = useQuery({
    queryKey: ['box-register-controls', id],
    queryFn: () => boxRegisterService.getControlesByBox(id!),
    enabled: !!id,
  });

  const activeControl = controles?.find((c) => c.activo) || (box?.controlActual?.activo ? box.controlActual : null);

  const { data: movimientos } = useQuery({
    queryKey: ['cash-movements', activeControl?.id],
    queryFn: () => cashMovementService.getByControl(String(activeControl!.id)),
    enabled: !!activeControl?.id,
  });

  const openMutation = useMutation({
    mutationFn: () => boxRegisterService.apertura(id!),
    onSuccess: async () => {
      impactLight();
      setShowOpenModal(false);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['box-register-controls', id] }),
        queryClient.refetchQueries({ queryKey: ['cash-movements'] }),
      ]);
      loadActiveBox();
      setSnackbar({ visible: true, message: 'Caja abierta exitosamente' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
      const serverMsg = axiosErr?.response?.data?.message || axiosErr?.response?.data?.error;
      const msg = serverMsg || 'Error al abrir la caja';
      setSnackbar({ visible: true, message: String(msg) });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => boxRegisterService.cierre(id!, parseFloat(cierreMonto) || 0),
    onSuccess: async () => {
      impactLight();
      setShowCloseModal(false);
      setCierreMonto('');
      await queryClient.refetchQueries({ queryKey: ['box-register-controls', id] });
      loadActiveBox();
      setSnackbar({ visible: true, message: 'Caja cerrada exitosamente' });
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al cerrar la caja' });
    },
  });

  const movMutation = useMutation({
    mutationFn: () =>
      cashMovementService.create({
        caja_id: id!,
        tipo: movTipo,
        monto: movMonto,
        descripcion: movDesc,
      }),
    onSuccess: async () => {
      impactLight();
      setShowMovModal(false);
      setMovMonto('');
      setMovDesc('');
      setMovTipo('ingreso');
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['cash-movements', activeControl?.id] }),
        queryClient.refetchQueries({ queryKey: ['box-register-controls', id] }),
      ]);
      setSnackbar({ visible: true, message: 'Movimiento registrado' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
      const serverMsg = axiosErr?.response?.data?.message || axiosErr?.response?.data?.error;
      const msg = serverMsg || (err instanceof Error ? err.message : 'Error desconocido');
      setSnackbar({ visible: true, message: String(msg) });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['box-register-controls', id] }),
      queryClient.refetchQueries({ queryKey: ['cash-movements', activeControl?.id] }),
    ]);
    setRefreshing(false);
  }, [queryClient, id, activeControl?.id]);

  const fmt = (n: number) => {
    if (isNaN(n)) return '0,00';
    return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('es-VE');
  };

  const totalIngresos = useMemo(() => {
    if (!movimientos) return 0;
    return movimientos.filter((m) => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0);
  }, [movimientos]);

  const totalEgresos = useMemo(() => {
    if (!movimientos) return 0;
    return movimientos.filter((m) => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0);
  }, [movimientos]);

  const saldoEsperado = useMemo(() => {
    const apertura = activeControl?.monto_apertura ?? 0;
    return apertura + totalIngresos - totalEgresos;
  }, [activeControl?.monto_apertura, totalIngresos, totalEgresos]);

  const ubicacion = box?.ubicacion || box?.descripcion || '—';

  const safeTime = (d?: string) => {
    if (!d) return 0;
    const date = new Date(d);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const controlesSorted = useMemo(() => {
    if (!controles) return [];
    return [...controles].sort((a, b) => safeTime(b.apertura) - safeTime(a.apertura));
  }, [controles]);

  const lastControl = activeControl || box?.controlActual || controlesSorted[0] || null;

  if (boxLoading) {
    return (
      <ScreenLayout className="items-center justify-center">
        <ActivityIndicator size={32} color="#4DB6AC" />
      </ScreenLayout>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: box?.nombre || 'Caja',
          headerRight: () =>
            box ? (
              <Menu
                visible={menuVisible}
                anchorPosition="bottom"
                onDismiss={() => setMenuVisible(false)}
                theme={{ colors: { elevation: { level2: '#fff' } } }}
                anchor={
                  <TouchableOpacity onPress={() => setMenuVisible(true)} className="mr-3">
                    <Ionicons name="ellipsis-vertical" size={24} color="#4DB6AC" />
                  </TouchableOpacity>
                }>
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(false);
                    editModalRef.current?.present();
                  }}
                  leadingIcon="pencil"
                  title="Editar caja"
                />
              </Menu>
            ) : null,
        }}
      />
      <ScreenLayout className="px-4 pt-2" scrollEnabled={false}>
        <View className="w-full flex-1">
          <FlashList
            style={{ flex: 1 }}
            data={movimientos || []}
            keyExtractor={(item) => String(item.id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={
              <View>
                {/* --- Status Badge --- */}
                <View
                  className={`mb-4 flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                    activeControl ? 'bg-success/10' : 'bg-slate-100 dark:bg-primary-dark'
                  }`}>
                  <View className="flex-row items-center gap-2">
                    <View className={`h-2.5 w-2.5 rounded-full ${activeControl ? 'bg-success' : 'bg-slate-400'}`} />
                    <Text
                      className={`text-sm font-semibold ${
                        activeControl ? 'text-success' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                      {activeControl ? 'Caja Abierta' : 'Caja Cerrada'}
                    </Text>
                  </View>
                  {activeControl && (
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(activeControl.apertura)}
                    </Text>
                  )}
                </View>

                {/* --- Active control: open / close buttons --- */}
                {activeControl && (
                  <View className="mb-4 flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setShowCloseModal(true)}
                      className="flex-1 items-center rounded-2xl border border-error/20 bg-white py-3 dark:bg-primary-dark">
                      <Ionicons name="lock-closed-outline" size={20} color="#FF5C93" />
                      <Text className="mt-1 text-sm font-medium text-error">Cerrar Caja</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        selection();
                        setShowMovModal(true);
                      }}
                      className="flex-1 items-center rounded-2xl bg-info py-3">
                      <Ionicons name="swap-vertical-outline" size={20} color="#fff" />
                      <Text className="mt-1 text-sm font-medium text-white">Movimiento</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!activeControl && (
                  <TouchableOpacity
                    onPress={() => setShowOpenModal(true)}
                    className="mb-4 items-center rounded-2xl bg-info py-4">
                    <Ionicons name="lock-open-outline" size={22} color="#fff" />
                    <Text className="mt-1 text-base font-bold text-white">Abrir Caja</Text>
                  </TouchableOpacity>
                )}

                {/* --- Información General (merged) --- */}
                <Card className="mx-0 mb-3 p-4" onPress={undefined}>
                  <View className="mb-3 flex-row items-center gap-2">
                    <Ionicons name="information-circle-outline" size={18} color="#64748B" />
                    <Text className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Información General
                    </Text>
                  </View>
                  <InfoRow label="ID" value={String(box?.id ?? '—')} />
                  <InfoRow label="Nombre" value={box?.nombre || '—'} />
                  <InfoRow label="Ubicación" value={ubicacion} />
                  <InfoRow
                    label="Estado"
                    value={activeControl ? 'Abierta' : 'Inactiva'}
                    valueClass={activeControl ? 'text-success' : 'text-slate-500'}
                  />
                  {box?.empresa_id && <InfoRow label="ID Empresa" value={String(box.empresa_id)} />}
                  {activeControl && (
                    <>
                      <View className="my-2 border-t border-slate-100 dark:border-slate-700" />
                      <View className="mb-2 mt-2 flex-row items-center gap-2">
                        <Ionicons name="cash-outline" size={16} color="#4DB6AC" />
                        <Text className="text-xs font-medium uppercase tracking-wide text-info">Saldo Actual</Text>
                      </View>
                      <Text className="text-2xl font-bold text-info">
                        Bs. {fmt(activeControl.caja?.monto ?? box?.monto ?? 0)}
                      </Text>
                      {(totalIngresos > 0 || totalEgresos > 0) && (
                        <View className="mt-2 flex-row justify-between">
                          <Text className="text-xs text-slate-500 dark:text-slate-400">
                            Ingresos: Bs. {fmt(totalIngresos)}
                          </Text>
                          <Text className="text-xs text-slate-500 dark:text-slate-400">
                            Egresos: Bs. {fmt(totalEgresos)}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </Card>

                {/* --- Estado Actual --- */}
                <Card className="mx-0 mb-3 p-4" onPress={undefined}>
                  <View className="mb-3 flex-row items-center gap-2">
                    <Ionicons name="pulse-outline" size={18} color="#64748B" />
                    <Text className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Estado Actual
                    </Text>
                  </View>
                  <InfoRow label="Última Apertura" value={formatDate(lastControl?.apertura)} />
                  <InfoRow
                    label="Último Cierre"
                    value={formatDate(lastControl?.cierre)}
                    valueClass={!lastControl?.cierre ? 'text-slate-400' : undefined}
                  />
                  <InfoRow
                    label="Estado"
                    value={activeControl ? 'Abierto' : 'Cerrado'}
                    valueClass={activeControl ? 'text-success' : 'text-slate-500'}
                  />
                  {activeControl && (
                    <>
                      <View className="my-2 border-t border-slate-100 dark:border-slate-700" />
                      <InfoRow label="Monto Apertura" value={`Bs. ${fmt(activeControl.monto_apertura)}`} />
                      <InfoRow label="Total Ingresos" value={`Bs. ${fmt(totalIngresos)}`} />
                      <InfoRow label="Total Egresos" value={`Bs. ${fmt(totalEgresos)}`} />
                      <InfoRow label="Saldo Esperado" value={`Bs. ${fmt(saldoEsperado)}`} valueClass="text-info font-bold" />
                      {activeControl.monto_cierre != null && (
                        <InfoRow label="Monto Cierre" value={`Bs. ${fmt(activeControl.monto_cierre)}`} />
                      )}
                      <InfoRow
                        label="Abrió"
                        value={activeControl.usuario_nombre || activeControl.usuario?.username || '—'}
                      />
                    </>
                  )}
                </Card>

                {/* --- Controles de Caja --- */}
                {controlesSorted.length > 0 && (
                  <Card className="mb-3">
                    <View className="mb-3 flex-row items-center gap-2">
                      <Ionicons name="timer-outline" size={18} color="#64748B" />
                      <Text className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Controles de Caja
                      </Text>
                      <Text className="text-xs text-slate-400">({controlesSorted.length})</Text>
                    </View>
                    {controlesSorted.map((ctl) => (
                      <View
                        key={ctl.id}
                        className={`mb-2 rounded-2xl p-3 ${
                          ctl.activo ? 'border border-success/20 bg-success/5' : 'bg-white dark:bg-primary-dark'
                        }`}>
                        <View className="mb-1.5 flex-row items-center justify-between">
                          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Apertura</Text>
                          <View
                            className={`rounded-full px-2 py-0.5 ${
                              ctl.activo ? 'bg-success/10' : 'bg-slate-100 dark:bg-primary-dark'
                            }`}>
                            <Text
                              className={`text-[10px] font-semibold ${ctl.activo ? 'text-success' : 'text-slate-500'}`}>
                              {ctl.activo ? 'Abierto' : 'Cerrado'}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatDate(ctl.apertura)}
                        </Text>
                        <View className="mt-2 flex-row justify-between">
                          <Text className="text-xs text-slate-500 dark:text-slate-400">
                            Monto Apertura: Bs. {fmt(ctl.monto_apertura)}
                          </Text>
                          {ctl.monto_cierre != null && (
                            <Text className="text-xs text-slate-500 dark:text-slate-400">
                              Cierre: Bs. {fmt(ctl.monto_cierre)}
                            </Text>
                          )}
                        </View>
                        <Text className="mt-1 text-xs text-slate-400">
                          {ctl.usuario_nombre || ctl.usuario?.username || '—'}
                        </Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* --- Movimientos header --- */}
                <View className="mb-3 mt-1 flex-row items-center gap-2">
                  <Ionicons name="receipt-outline" size={18} color="#64748B" />
                  <Text className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Movimientos de Caja del día
                  </Text>
                  {movimientos && movimientos.length > 0 && (
                    <Text className="text-xs text-slate-400">({movimientos.length})</Text>
                  )}
                </View>
              </View>
            }
            ListEmptyComponent={
              activeControl ? (
                <View className="items-center py-8">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-primary-dark">
                    <Ionicons name="receipt-outline" size={28} color="#94a3b8" />
                  </View>
                  <Text className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    Sin movimientos en esta apertura
                  </Text>
                </View>
              ) : (
                <View className="items-center py-8">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-primary-dark">
                    <Ionicons name="receipt-outline" size={28} color="#94a3b8" />
                  </View>
                  <Text className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    Abre la caja para registrar movimientos
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <View className="mb-2 rounded-2xl bg-white p-3 dark:bg-primary-dark">
                <View className="flex-row items-center justify-between">
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-2">
                      <View className={`h-2 w-2 rounded-full ${item.tipo === 'ingreso' ? 'bg-success' : 'bg-error'}`} />
                      <Text className="text-sm font-medium capitalize text-slate-900 dark:text-white">{item.tipo}</Text>
                      {item.usuario?.username && (
                        <Text className="text-[10px] text-slate-400">por {item.usuario.username}</Text>
                      )}
                    </View>
                    <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.descripcion}</Text>
                    <Text className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(item.fecha || item.created_at)}
                    </Text>
                  </View>
                  <Text className={`text-sm font-semibold ${item.tipo === 'ingreso' ? 'text-success' : 'text-error'}`}>
                    {item.tipo === 'ingreso' ? '+' : '-'}Bs. {fmt(item.monto)}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      </ScreenLayout>

      {/* --- Edit Box Modal --- */}
      {box && <EditBoxModal ref={editModalRef} box={box} />}

      {/* --- Open Box Modal --- */}
      <Modal visible={showOpenModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-primary-dark">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Abrir Caja</Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              ¿Estás seguro de abrir {box?.nombre}?
            </Text>
            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowOpenModal(false)}
                className="flex-1 items-center rounded-2xl border border-slate-200 py-3 dark:border-slate-700">
                <Text className="font-medium text-slate-600 dark:text-slate-300">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openMutation.mutate()}
                disabled={openMutation.isPending}
                className="flex-1 items-center rounded-2xl bg-info py-3">
                {openMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-bold text-white">Abrir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Close Box Modal --- */}
      <Modal visible={showCloseModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <View className="flex-1 bg-black/40">
            <View className="flex-1 justify-center px-6">
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View className="w-full max-w-sm self-center rounded-3xl bg-white p-6 dark:bg-primary-dark">
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">Cerrar Caja</Text>
                  <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ingresa el monto final en efectivo</Text>
                  {activeControl && (
                    <View className="mt-3 rounded-xl bg-warning/10 p-3">
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-warning">Saldo esperado</Text>
                        <Text className="text-sm font-semibold text-warning">
                          Bs. {fmt(saldoEsperado)}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View className="mt-3">
                    <TextInput
                      value={cierreMonto}
                      onChangeText={setCierreMonto}
                      placeholder="Monto de cierre"
                      keyboardType="decimal-pad"
                      className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-primary-dark dark:text-white"
                    />
                  </View>
                  <View className="mt-4 flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        setShowCloseModal(false);
                        setCierreMonto('');
                      }}
                      className="flex-1 items-center rounded-2xl border border-slate-200 py-3 dark:border-slate-700">
                      <Text className="font-medium text-slate-600 dark:text-slate-300">Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const monto = parseFloat(cierreMonto) || 0;
                        if (Math.abs(monto - saldoEsperado) > 0.01) {
                          Alert.alert(
                            'Monto no cuadra',
                            `El saldo esperado es Bs. ${fmt(saldoEsperado)} pero ingresaste Bs. ${fmt(monto)}. ¿Cerrar de todas formas?`,
                            [
                              { text: 'Revisar', style: 'cancel' },
                              { text: 'Cerrar igual', style: 'destructive', onPress: () => closeMutation.mutate() },
                            ],
                          );
                        } else {
                          closeMutation.mutate();
                        }
                      }}
                      disabled={closeMutation.isPending || !cierreMonto}
                      className={`flex-1 items-center rounded-2xl py-3 ${
                        !cierreMonto ? 'bg-slate-300 dark:bg-slate-600' : 'bg-error'
                      }`}>
                      {closeMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="font-bold text-white">Cerrar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- New Movement Modal --- */}
      <Modal visible={showMovModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <View className="flex-1 bg-black/40">
            <View className="flex-1 justify-center px-6">
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View className="w-full max-w-sm self-center rounded-3xl bg-white p-6 dark:bg-primary-dark">
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">Nuevo Movimiento</Text>

                  <View className="mt-3 flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        selection();
                        setMovTipo('ingreso');
                      }}
                      className={`flex-1 items-center rounded-2xl py-3 ${
                        movTipo === 'ingreso'
                          ? 'bg-success'
                          : 'border border-slate-200 bg-white dark:border-slate-700 dark:bg-primary-dark'
                      }`}>
                      <Text
                        className={`font-medium ${movTipo === 'ingreso' ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        Ingreso
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        selection();
                        setMovTipo('egreso');
                      }}
                      className={`flex-1 items-center rounded-2xl py-3 ${
                        movTipo === 'egreso'
                          ? 'bg-error'
                          : 'border border-slate-200 bg-white dark:border-slate-700 dark:bg-primary-dark'
                      }`}>
                      <Text
                        className={`font-medium ${movTipo === 'egreso' ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        Egreso
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mt-3">
                    <TextInput
                      value={movMonto}
                      onChangeText={setMovMonto}
                      placeholder="Monto"
                      keyboardType="decimal-pad"
                      className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-primary-dark dark:text-white"
                    />
                  </View>
                  <View className="mt-2">
                    <TextInput
                      value={movDesc}
                      onChangeText={setMovDesc}
                      placeholder="Descripción"
                      className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-primary-dark dark:text-white"
                    />
                  </View>

                  <View className="mt-4 flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        setShowMovModal(false);
                        setMovMonto('');
                        setMovDesc('');
                        setMovTipo('ingreso');
                      }}
                      className="flex-1 items-center rounded-2xl border border-slate-200 py-3 dark:border-slate-700">
                      <Text className="font-medium text-slate-600 dark:text-slate-300">Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const monto = parseFloat(movMonto) || 0;
                        if (movTipo === 'egreso' && monto > saldoEsperado) {
                          Alert.alert(
                            'Saldo insuficiente',
                            `El saldo esperado es Bs. ${fmt(saldoEsperado)} y el egreso es Bs. ${fmt(monto)}. ¿Registrar de todas formas?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Registrar igual', style: 'destructive', onPress: () => movMutation.mutate() },
                            ],
                          );
                        } else {
                          movMutation.mutate();
                        }
                      }}
                      disabled={movMutation.isPending || !movMonto || !movDesc}
                      className={`flex-1 items-center rounded-2xl py-3 ${
                        !movMonto || !movDesc ? 'bg-slate-300 dark:bg-slate-600' : 'bg-info'
                      }`}>
                      {movMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="font-bold text-white">Registrar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-error">
        {snackbar.message}
      </Snackbar>
    </>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-sm text-slate-500 dark:text-slate-400">{label}</Text>
      <Text className={`text-sm font-semibold text-slate-900 dark:text-white ${valueClass || ''}`}>{value}</Text>
    </View>
  );
}

import { NativeSyntheticEvent, NativeScrollEvent, RefreshControl, Text, View, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import CardPaymentMethod from './CardPaymentMethod';
import type { PaymentMethod } from '@/types/paymentMethod';

interface ListPaymentMethodsProps {
  paddingTop?: number; // Espacio superior para evitar solapamiento con el header.
  paymentMethods: PaymentMethod[]; // Datos recibidos desde el padre.
  onEdit: (paymentMethod: PaymentMethod) => void; // Función para abrir el editor del método.
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void; // Scroll event para animar el header.
  refreshing?: boolean; // Estado de refresco en pull-to-refresh.
  onRefresh?: () => void; // Callback para recargar los datos.
}

const ListPaymentMethods = ({
  paddingTop,
  paymentMethods,
  onEdit,
  onScroll,
  refreshing,
  onRefresh,
}: ListPaymentMethodsProps) => {
  // Si no hay métodos de pago, mostramos un mensaje vacío.
  if (!paymentMethods.length) {
    return (
      <View className="mx-4 flex-1 items-center justify-center rounded-3xl p-8">
        <Ionicons name="card-outline" size={64} color="#CBD5E1" />
        <Text className="mt-4 text-center text-lg font-medium text-slate-600">No se encontraron métodos de pago</Text>
        <Text className="mt-2 text-center text-sm text-slate-500">Intenta con otro término de búsqueda</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={paymentMethods}
      renderItem={({ item }) => (
        <Pressable>
          <CardPaymentMethod paymentMethod={item} onEdit={onEdit} />
        </Pressable>
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{
        // Padding para que el header superpuesto no tape la primera fila.
        paddingBottom: 20,
        paddingTop: paddingTop ? paddingTop + 20 : 0,
        flexGrow: 1,
      }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} progressViewOffset={140} />
        ) : undefined
      }
    />
  );
};

export default ListPaymentMethods;

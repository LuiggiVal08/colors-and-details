import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
// import * as Haptics from 'expo-haptics';
import type { PaymentMethod } from '@/types/paymentMethod';
import { impactLight } from '@/helpers/haptics';

interface CardPaymentMethodProps {
  paymentMethod: PaymentMethod;
  onEdit: (paymentMethod: PaymentMethod) => void;
}

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'efectivo':
      return 'cash';
    case 'tarjeta':
      return 'card';
    case 'digital':
      return 'phone-portrait';
    case 'transferencia':
      return 'swap-horizontal';
    default:
      return 'help-circle';
  }
};

const CardPaymentMethod = ({ paymentMethod, onEdit }: CardPaymentMethodProps) => {
  const handleEdit = async () => {
    impactLight();
    onEdit(paymentMethod);
  };

  return (
    <Card className="mx-4 mb-4 p-4">
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Ionicons name="card" size={24} color="#64748b" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold text-slate-900" numberOfLines={1} ellipsizeMode="tail">
              {paymentMethod.nombre}
            </Text>
            {paymentMethod.descripcion ? (
              <Text className="text-sm text-slate-500" numberOfLines={1} ellipsizeMode="tail">
                {paymentMethod.descripcion}
              </Text>
            ) : null}
            <Text className="text-sm text-slate-500">
              Comisión: {paymentMethod.comision}%
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleEdit} className="rounded-full p-2" activeOpacity={0.7}>
          <Ionicons name="pencil" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View className="mt-4 flex-row items-center gap-2">
        <View className={`h-2.5 w-2.5 rounded-full ${paymentMethod.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <Text className="text-xs uppercase tracking-[0.2px] text-slate-500">
          {paymentMethod.activo ? 'Activo' : 'Inactivo'}
        </Text>
      </View>
    </Card>
  );
};

export default CardPaymentMethod;

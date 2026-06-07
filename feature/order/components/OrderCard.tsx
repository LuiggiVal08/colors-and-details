import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Order } from '@/types/order';
import { StatusBadge } from './StatusBadge';
import { useExchangeRateStore } from '@/store/exchangeRate';
import Card from '@/components/Card';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const fmt = (n: number) =>
  n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function diffDays(a: Date, b: Date): number {
  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const tasa = useExchangeRateStore((state) => state.tasa);

  const hoy = new Date();
  const tieneFecha = order.fecha_entrega !== null;
  const entrega = tieneFecha ? new Date(order.fecha_entrega!) : null;
  const dias = entrega ? diffDays(entrega, hoy) : 0;
  const esVencido =
    tieneFecha && dias < 0 && order.estado !== 'completado' && order.estado !== 'cancelado';

  const pagoCompleto = order.estado_pago === 'pagado';
  const pagoParcial = order.estado_pago === 'parcial';
  const totalUSD = tasa ? order.total / tasa : 0;

  return (
    <Card className="mb-2.5 rounded-2xl p-4" onPress={onPress}>
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-bold text-slate-900">#{order.id}</Text>
          <StatusBadge status={order.estado} />
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        <Ionicons name="person-outline" size={16} color="#64748B" />
        <Text className="flex-1 text-sm font-medium text-slate-900" numberOfLines={1}>
          {order.cliente_nombre || `Cliente #${order.cliente_id}`}
        </Text>
      </View>

      <View className="mt-1.5 flex-row flex-wrap items-center gap-x-3 gap-y-0.5">
        <View className="flex-row items-center gap-1">
          <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
          <Text className="text-xs text-slate-500">{shortDate(order.fecha)}</Text>
        </View>
        <Text className="text-xs text-slate-300">·</Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="calendar" size={13} color={esVencido ? '#EF4444' : '#94A3B8'} />
          <Text className={`text-xs ${esVencido ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>
            {order.fecha_entrega ? shortDate(order.fecha_entrega) : 'Sin fecha'}
          </Text>
        </View>
      </View>

      {tieneFecha && (
        <View className="mt-1 flex-row items-center gap-1">
          <Ionicons
            name={esVencido ? 'alert-circle' : 'time-outline'}
            size={13}
            color={esVencido ? '#EF4444' : '#94A3B8'}
          />
          <Text className={`text-xs ${esVencido ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>
            {esVencido
              ? `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`
              : dias === 0
                ? 'Entrega hoy'
                : `${dias} día${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`}
          </Text>
        </View>
      )}

      <View className="mt-2 flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Ionicons name="cash-outline" size={15} color="#64748B" />
          <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
            Bs. {fmt(order.total)}
          </Text>
          {tasa && totalUSD > 0 && (
            <Text className="text-xs text-slate-400" numberOfLines={1}>
              (${fmt(totalUSD)})
            </Text>
          )}
        </View>
        <View className="ml-2 flex-shrink-0">
          {pagoCompleto ? (
            <View className="rounded-full bg-emerald-100 px-2.5 py-0.5">
              <Text className="text-[10px] font-semibold text-emerald-700">Pagado</Text>
            </View>
          ) : pagoParcial ? (
            <View className="rounded-full bg-amber-100 px-2.5 py-0.5">
              <Text className="text-[10px] font-semibold text-amber-700">Parcial</Text>
            </View>
          ) : (
            <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
              <Text className="text-[10px] font-semibold text-slate-500">Pendiente</Text>
            </View>
          )}
        </View>
      </View>

      {order.observaciones && (
        <View className="mt-1.5 flex-row items-start gap-1">
          <Ionicons name="document-text-outline" size={13} color="#94A3B8" />
          <Text className="flex-1 text-xs text-slate-500" numberOfLines={1}>
            {order.observaciones}
          </Text>
        </View>
      )}
    </Card>
  );
}

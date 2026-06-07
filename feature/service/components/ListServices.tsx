import { NativeSyntheticEvent, NativeScrollEvent, RefreshControl, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import CardService from './CardService';
import type { Servicio } from '@/types/service';

interface ListServicesProps {
  paddingTop?: number;
  servicios: Servicio[];
  onEdit: (servicio: Servicio) => void;
  onPress?: (servicio: Servicio) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const ListServices = ({
  paddingTop,
  servicios,
  onEdit,
  onPress,
  onScroll,
  refreshing,
  onRefresh,
}: ListServicesProps) => {
  if (!servicios.length) {
    return (
      <View className="mx-4 flex-1 items-center justify-center rounded-3xl p-8">
        <Ionicons name="construct-outline" size={64} color="#CBD5E1" />
        <Text className="mt-4 text-center text-lg font-medium text-slate-600">No se encontraron servicios</Text>
        <Text className="mt-2 text-center text-sm text-slate-500">Intenta con otro termino de busqueda</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={servicios}
      renderItem={({ item }) => <CardService servicio={item} onEdit={onEdit} onPress={onPress} />}
      keyExtractor={(item) => String(item.id)}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{
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

export default ListServices;

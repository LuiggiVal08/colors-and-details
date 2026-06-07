import { NativeSyntheticEvent, NativeScrollEvent, RefreshControl, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import CardClient from './CardClient';
import type { ClientsListProps } from '@/feature/clients/types';
import type { Client } from '@/types/client';

const ListClients = ({
  clients,
  onClientPress,
  onScroll,
  refreshing,
  onRefresh,
}: ClientsListProps & {
  onClientPress?: (client: Client) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}) => {
  if (!clients.length) {
    return (
      <View className="mx-4 flex-1 items-center justify-center rounded-3xl  p-8 ">
        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
        <Text className="mt-4 text-center text-lg font-medium text-slate-600">No se encontraron clientes</Text>
        <Text className="mt-2 text-center text-sm text-slate-500">Intenta con otro término de búsqueda</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={clients}
      renderItem={({ item }) => <CardClient client={item} onPress={onClientPress} />}
      keyExtractor={(item) => item.id}
      // showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 20,
        paddingTop: 90,
        flexGrow: 1,
      }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} progressViewOffset={90} />
        ) : undefined
      }
    />
  );
};

export default ListClients;

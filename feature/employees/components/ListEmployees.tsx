import { NativeSyntheticEvent, NativeScrollEvent, RefreshControl, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import CardEmployee from './CardEmployee';
import type { EmployeesListProps } from '@/feature/employees/types';
import type { Employee } from '@/types/employee';

const ListEmployees = ({
  employees,
  onEmployeePress,
  onScroll,
  refreshing,
  onRefresh,
}: EmployeesListProps & {
  onEmployeePress?: (employee: Employee) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}) => {
  if (!employees.length) {
    return (
      <View className="mx-4 flex-1 items-center justify-center rounded-3xl  p-8 ">
        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
        <Text className="mt-4 text-center text-lg font-medium text-slate-600">No se encontraron empleados</Text>
        <Text className="mt-2 text-center text-sm text-slate-500">Intenta con otro término de búsqueda</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={employees}
      renderItem={({ item }) => <CardEmployee employee={item} onPress={onEmployeePress} />}
      keyExtractor={(item) => item.id.toString()}
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

export default ListEmployees;

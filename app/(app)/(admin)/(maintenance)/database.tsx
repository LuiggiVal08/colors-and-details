import { Text } from 'react-native';
import ScreenLayout from '../../../../components/layout/ScreenLayout';
import Card from '@/components/Card';

export default function DatabaseScreen() {
  return (
    <ScreenLayout>
      <Card className="w-full max-w-3xl p-8">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Base de datos</Text>
        <Text className="text-slate-600">
          Pantalla protegida de mantenimiento para la base de datos.
        </Text>
      </Card>
    </ScreenLayout>
  );
}

import { useState } from 'react';
import { View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { DataTab } from './DataTab';
import { SecurityTab } from './SecurityTab';

export const ProfileTabs = () => {
  const [value, setValue] = useState('datos');

  const renderContent = () => {
    switch (value) {
      case 'datos':
        return <DataTab />;
      case 'seguridad':
        return <SecurityTab />;

      default:
        return null;
    }
  };

  return (
    <View className="w-full max-w-2xl py-4">
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        style={{ backgroundColor: 'rgb(255 255 255 / 0.9)', borderRadius: 20 }}
        buttons={[
          { value: 'datos', label: 'Datos', icon: 'card-account-details-outline' },
          { value: 'seguridad', label: 'Seguridad', icon: 'shield-outline' },
        ]}
      />
      <View className="mt-4 flex min-h-[300px] w-full max-w-2xl gap-4 rounded-3xl bg-white/90 p-8 shadow-lg dark:bg-primary-dark">
        {renderContent()}
      </View>
    </View>
  );
};

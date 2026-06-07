import ScreenLayout from '@/components/layout/ScreenLayout';

import { ProfileHeader } from '@/feature/profile/components/ProfileHeader';
import { ProfileTabs } from '@/feature/profile/components/ProfileTabs';
import { View } from 'react-native';

const ProfileScreen = () => {
  return (
    <ScreenLayout>
      <View className="mt-4  w-full px-4">
        <ProfileHeader />
        <ProfileTabs />
      </View>
    </ScreenLayout>
  );
};
export default ProfileScreen;

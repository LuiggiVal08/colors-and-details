import ScreenLayout from '@/components/layout/ScreenLayout';

import { ProfileHeader } from '@/feature/profile/components/ProfileHeader';
import { ProfileTabs } from '@/feature/profile/components/ProfileTabs';

const ProfileScreen = () => {
  return (
    <ScreenLayout>
      <ProfileHeader />
      <ProfileTabs />
    </ScreenLayout>
  );
};
export default ProfileScreen;

import { Text, View } from 'react-native';

const InfoTag = ({ text, className }: { text: string; className?: string }) => {
  return (
    <View className={`flex flex-row items-center gap-2 rounded-2xl   px-2 py-1 ${className}`}>
      <Text className="text-sm text-white">{text}</Text>
    </View>
  );
};

export default InfoTag;

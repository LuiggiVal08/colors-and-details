import { Image, View } from 'react-native';

const Logo = () => {
  return (
    <View>
      <Image
        className="py-2"
        source={require('../assets/logo.png')}
        style={{ width: 145, height: 130 }}
      />
    </View>
  );
};

export default Logo;

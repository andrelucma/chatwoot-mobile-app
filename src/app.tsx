import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, Appearance, BackHandler } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';
import i18n from '@/i18n';

// Dark mode desativado — Samsung Android 9 dispara appearanceChanged sobrescrevendo
// o setColorScheme inicial. O listener re-aplica o override com guard anti-loop.
let _enforcingLight = false;
Appearance.setColorScheme('light');
Appearance.addChangeListener(() => {
  if (!_enforcingLight) {
    _enforcingLight = true;
    Appearance.setColorScheme('light');
    _enforcingLight = false;
  }
});

const Chatwoot = () => {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const handleBackButtonClick = () => {
    Alert.alert(
      i18n.t('EXIT.TITLE'),
      i18n.t('EXIT.SUBTITLE'),
      [
        { text: i18n.t('EXIT.CANCEL'), onPress: () => {}, style: 'cancel' },
        { text: i18n.t('EXIT.OK'), onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false },
    );
    return true;
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default Chatwoot;

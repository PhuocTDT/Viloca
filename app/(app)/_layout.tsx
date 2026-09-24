import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { useT } from '@/src/lib/i18n';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const PILL_HEIGHT = 32;

function PillIcon({ name, focused, size }: { name: IoniconName; focused: boolean; size: number }) {
  if (focused) {
    return (
      <View
        style={{
          width: size + 32,
          height: PILL_HEIGHT,
          backgroundColor: colors.nomad.secondaryContainer,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={name} size={size} color={colors.nomad.primary} />
      </View>
    );
  }
  return <Ionicons name={name} size={size} color={colors.nomad.onSurfaceVariant} />;
}

export default function AppLayout() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.nomad.primary,
        tabBarInactiveTintColor: colors.nomad.onSurfaceVariant,
        tabBarIconStyle: {
          height: PILL_HEIGHT,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarStyle: {
          backgroundColor: colors.nomad.surface,
          borderTopColor: colors.nomad.outlineVariant,
          height: 68,
          paddingTop: 4,
          paddingBottom: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabHome'),
          tabBarIcon: ({ focused, size }) => (
            <PillIcon name={focused ? 'home' : 'home-outline'} focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabExplore'),
          tabBarIcon: ({ focused, size }) => (
            <PillIcon name={focused ? 'compass' : 'compass-outline'} focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workspace"
        options={{
          title: t('tabTrips'),
          tabBarIcon: ({ focused, size }) => (
            <PillIcon name={focused ? 'map' : 'map-outline'} focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabProfile'),
          tabBarIcon: ({ focused, size }) => (
            <PillIcon name={focused ? 'person' : 'person-outline'} focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="profile/posts" options={{ href: null }} />
      <Tabs.Screen name="profile/trips" options={{ href: null }} />
    </Tabs>
  );
}

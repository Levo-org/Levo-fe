import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabParamList } from '../types';
import HomeScreen from '../screens/home/HomeScreen';
import ReviewScreen from '../screens/review/ReviewScreen';
import StatsScreen from '../screens/stats/StatsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useApi } from '../hooks/useApi';
import { reviewService } from '../services/review.service';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface ReviewBadgeData {
  totalReviewItems: number;
}

export function MainTab() {
  const fetcher = useCallback(() => reviewService.getDashboard(), []);
  const { data: reviewBadgeData, refetch: refetchReviewBadge } = useApi<ReviewBadgeData>(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetchReviewBadge();
    }, [refetchReviewBadge]),
  );

  const reviewBadgeCount = Math.max(0, reviewBadgeData?.totalReviewItems ?? 0);
  const reviewBadgeText = reviewBadgeCount > 99 ? '99+' : String(reviewBadgeCount);

  return (
    <Tab.Navigator
      id='MainTab'    
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: '#AFAFAF',
        tabBarStyle: {
          height: 83,
          paddingTop: 8,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ReviewTab"
        component={ReviewScreen}
        options={{
          tabBarLabel: '복습',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <View>
              <Feather name="rotate-ccw" size={size} color={color} />
              {reviewBadgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{reviewBadgeText}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{
          tabBarLabel: '통계',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Feather name="bar-chart-2" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: '프로필',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: '#FF4B4B',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

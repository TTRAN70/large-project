// src/screens/UserListScreen.tsx
import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "UserList">;

export default function UserListScreen({ route, navigation }: Props) {
  const { mode, usernames } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: mode === "followers" ? "Followers" : "Following",
    });
  }, [mode, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {mode === "followers" ? "Followers" : "Following"}
      </Text>

      {usernames.length === 0 ? (
        <Text style={styles.emptyText}>
          {mode === "followers"
            ? "You don't have any followers yet."
            : "You aren't following anyone yet."}
        </Text>
      ) : (
        <FlatList
          data={usernames}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {item.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.usernameText}>{item}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041C32",
    padding: 16,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  emptyText: {
    color: "#B0BEC5",
    fontStyle: "italic",
    marginTop: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#092A46",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0E3A5D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  usernameText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
